from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.cover_letter import CoverLetter
from ..models.resume import Resume
from ..schemas.cover_letter import GenerateCoverLetterRequest, CoverLetterResponse
from ..services.ai.cover_letter import generate_cover_letter
import uuid

router = APIRouter()

@router.post("/generate", response_model=CoverLetterResponse)
async def create_cover_letter(
    req: GenerateCoverLetterRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume_text = ""
    if req.resume_id:
        resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == user.id).first()
        if resume:
            resume_text = resume.parsed_text or ""

    content = await generate_cover_letter(
        resume_text=resume_text,
        job_description=req.job_description,
        company=req.company,
        job_title=req.job_title,
        tone=req.tone,
    )

    cover_letter = CoverLetter(
        user_id=user.id,
        company=req.company,
        job_title=req.job_title,
        tone=req.tone,
        content=content,
    )
    db.add(cover_letter)
    db.commit()
    db.refresh(cover_letter)

    return CoverLetterResponse.model_validate(cover_letter)

@router.get("", response_model=List[CoverLetterResponse])
async def list_cover_letters(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    letters = db.query(CoverLetter).filter(
        CoverLetter.user_id == user.id
    ).order_by(CoverLetter.created_at.desc()).all()
    return [CoverLetterResponse.model_validate(l) for l in letters]

@router.get("/{letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    letter_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    letter = db.query(CoverLetter).filter(
        CoverLetter.id == letter_id,
        CoverLetter.user_id == user.id,
    ).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return CoverLetterResponse.model_validate(letter)

@router.delete("/{letter_id}")
async def delete_cover_letter(
    letter_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    letter = db.query(CoverLetter).filter(
        CoverLetter.id == letter_id,
        CoverLetter.user_id == user.id,
    ).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    db.delete(letter)
    db.commit()
    return {"message": "Cover letter deleted"}
