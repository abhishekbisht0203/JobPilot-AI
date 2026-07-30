from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.deps import get_current_user
from ..schemas.cover_letter import GenerateCoverLetterRequest, CoverLetterResponse
from ..services.ai.cover_letter import generate_cover_letter

router = APIRouter()

@router.post("/generate", response_model=CoverLetterResponse)
async def create_cover_letter(
    req: GenerateCoverLetterRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    resume_text = ""
    if req.resume_id:
        resume = await db.resumes.find_one({"_id": ObjectId(req.resume_id), "user_id": str(user["_id"])})
        if resume:
            resume_text = resume.get("parsed_text") or ""

    content = await generate_cover_letter(
        resume_text=resume_text,
        job_description=req.job_description,
        company=req.company,
        job_title=req.job_title,
        tone=req.tone,
    )

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": str(user["_id"]),
        "company": req.company,
        "job_title": req.job_title,
        "tone": req.tone,
        "content": content,
        "created_at": now,
    }
    result = await db.cover_letters.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return CoverLetterResponse.model_validate(doc)

@router.get("", response_model=List[CoverLetterResponse])
async def list_cover_letters(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    cursor = db.cover_letters.find({"user_id": str(user["_id"])}).sort("created_at", -1)
    letters = await cursor.to_list(length=100)
    result = []
    for l in letters:
        l["id"] = str(l.pop("_id"))
        result.append(CoverLetterResponse.model_validate(l))
    return result

@router.get("/{letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    letter_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    letter = await db.cover_letters.find_one({"_id": ObjectId(letter_id), "user_id": str(user["_id"])})
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    letter["id"] = str(letter.pop("_id"))
    return CoverLetterResponse.model_validate(letter)

@router.delete("/{letter_id}")
async def delete_cover_letter(
    letter_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    letter = await db.cover_letters.find_one({"_id": ObjectId(letter_id), "user_id": str(user["_id"])})
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    await db.cover_letters.delete_one({"_id": letter["_id"]})
    return {"message": "Cover letter deleted"}
