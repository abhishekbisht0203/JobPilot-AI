from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.deps import get_current_user
from ..schemas.email import GenerateEmailRequest, ColdEmailResponse
from ..services.ai.cold_email import generate_cold_email
from ..services.email.sender import send_email, generate_tracking_id

router = APIRouter()

@router.post("/generate", response_model=ColdEmailResponse)
async def create_cold_email(
    req: GenerateEmailRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    resume_text = ""
    if req.resume_id:
        resume = await db.resumes.find_one({"_id": ObjectId(req.resume_id), "user_id": str(user["_id"])})
        if resume:
            resume_text = resume.get("parsed_text") or ""

    result = await generate_cold_email(
        resume_text=resume_text,
        company=req.company,
        job_title=req.job_title,
        recruiter_name=req.recruiter_name or "",
    )

    tracking_id = generate_tracking_id()
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": str(user["_id"]),
        "recruiter_name": req.recruiter_name,
        "company": req.company,
        "subject": result["subject"],
        "body": result["body"],
        "tracking_id": tracking_id,
        "opened_at": None,
        "sent": False,
        "created_at": now,
    }
    doc_result = await db.cold_emails.insert_one(doc)
    doc["id"] = str(doc_result.inserted_id)
    return ColdEmailResponse.model_validate(doc)

@router.post("/{email_id}/send")
async def send_cold_email(
    email_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    email_doc = await db.cold_emails.find_one({"_id": ObjectId(email_id), "user_id": str(user["_id"])})
    if not email_doc:
        raise HTTPException(status_code=404, detail="Email not found")

    to_email = email_doc.get("recruiter_email") or "recruiter@example.com"
    success = await send_email(to_email, email_doc["subject"], email_doc["body"], email_doc["tracking_id"])

    if success:
        await db.cold_emails.update_one({"_id": email_doc["_id"]}, {"$set": {"sent": True}})

    return {"sent": success}

@router.get("", response_model=List[ColdEmailResponse])
async def list_cold_emails(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    cursor = db.cold_emails.find({"user_id": str(user["_id"])}).sort("created_at", -1)
    emails = await cursor.to_list(length=100)
    result = []
    for e in emails:
        e["id"] = str(e.pop("_id"))
        result.append(ColdEmailResponse.model_validate(e))
    return result

@router.get("/{email_id}", response_model=ColdEmailResponse)
async def get_cold_email(
    email_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    email_doc = await db.cold_emails.find_one({"_id": ObjectId(email_id), "user_id": str(user["_id"])})
    if not email_doc:
        raise HTTPException(status_code=404, detail="Email not found")
    email_doc["id"] = str(email_doc.pop("_id"))
    return ColdEmailResponse.model_validate(email_doc)

@router.get("/tracking-stats")
async def get_tracking_stats(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    cursor = db.cold_emails.find({"user_id": str(user["_id"])})
    emails = await cursor.to_list(length=1000)
    total = len(emails)
    sent = sum(1 for e in emails if e.get("sent"))
    opened = sum(1 for e in emails if e.get("opened_at"))

    return {
        "total": total,
        "sent": sent,
        "opened": opened,
        "open_rate": round(opened / sent * 100, 1) if sent > 0 else 0,
    }
