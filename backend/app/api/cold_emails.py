from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.cold_email import ColdEmail
from ..models.resume import Resume
from ..schemas.email import GenerateEmailRequest, ColdEmailResponse
from ..services.ai.cold_email import generate_cold_email
from ..services.email.sender import send_email, generate_tracking_id
import uuid

router = APIRouter()

@router.post("/generate", response_model=ColdEmailResponse)
async def create_cold_email(
    req: GenerateEmailRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume_text = ""
    if req.resume_id:
        resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == user.id).first()
        if resume:
            resume_text = resume.parsed_text or ""

    result = await generate_cold_email(
        resume_text=resume_text,
        company=req.company,
        job_title=req.job_title,
        recruiter_name=req.recruiter_name or "",
    )

    tracking_id = generate_tracking_id()

    email = ColdEmail(
        user_id=user.id,
        recruiter_name=req.recruiter_name,
        company=req.company,
        subject=result["subject"],
        body=result["body"],
        tracking_id=tracking_id,
    )
    db.add(email)
    db.commit()
    db.refresh(email)

    return ColdEmailResponse.model_validate(email)

@router.post("/{email_id}/send")
async def send_cold_email(
    email_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    email = db.query(ColdEmail).filter(
        ColdEmail.id == email_id,
        ColdEmail.user_id == user.id,
    ).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    to_email = email.recruiter_email or "recruiter@example.com"
    success = await send_email(to_email, email.subject, email.body, email.tracking_id)

    if success:
        email.sent = True
        db.commit()

    return {"sent": success}

@router.get("", response_model=List[ColdEmailResponse])
async def list_cold_emails(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    emails = db.query(ColdEmail).filter(
        ColdEmail.user_id == user.id
    ).order_by(ColdEmail.created_at.desc()).all()
    return [ColdEmailResponse.model_validate(e) for e in emails]

@router.get("/{email_id}", response_model=ColdEmailResponse)
async def get_cold_email(
    email_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    email = db.query(ColdEmail).filter(
        ColdEmail.id == email_id,
        ColdEmail.user_id == user.id,
    ).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return ColdEmailResponse.model_validate(email)

@router.get("/tracking-stats")
async def get_tracking_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    emails = db.query(ColdEmail).filter(ColdEmail.user_id == user.id).all()
    total = len(emails)
    sent = sum(1 for e in emails if e.sent)
    opened = sum(1 for e in emails if e.opened_at)

    return {
        "total": total,
        "sent": sent,
        "opened": opened,
        "open_rate": round(opened / sent * 100, 1) if sent > 0 else 0,
    }
