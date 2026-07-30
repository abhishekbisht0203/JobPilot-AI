from bson import ObjectId
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.deps import get_current_user
from ..schemas.resume import ResumeResponse, ResumeVersionResponse, CreateVersionRequest
from ..services.resume.parser import parse_resume
from ..services.ai.resume_optimizer import optimize_resume, calculate_ats_score

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    content = await file.read()
    parsed_text = await parse_resume(content, file.filename or "resume.pdf")

    if not parsed_text:
        raise HTTPException(status_code=400, detail="Could not parse resume text")

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": str(user["_id"]),
        "original_filename": file.filename or "resume.pdf",
        "file_url": None,
        "parsed_text": parsed_text,
        "ats_score": 50,
        "created_at": now,
    }
    result = await get_db().resumes.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return ResumeResponse.model_validate(doc)

@router.post("/{resume_id}/analyze-ats")
async def analyze_ats(
    resume_id: str,
    job_description: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": str(user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    score = resume.get("ats_score", 50)
    if resume.get("parsed_text"):
        score = await calculate_ats_score(resume["parsed_text"], job_description)
        await db.resumes.update_one({"_id": resume["_id"]}, {"$set": {"ats_score": score}})

    return {"ats_score": score}

@router.get("", response_model=List[ResumeResponse])
async def list_resumes(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    cursor = db.resumes.find({"user_id": str(user["_id"])}).sort("created_at", -1)
    resumes = await cursor.to_list(length=100)
    result = []
    for r in resumes:
        r["id"] = str(r.pop("_id"))
        result.append(ResumeResponse.model_validate(r))
    return result

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": str(user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    resume["id"] = str(resume.pop("_id"))
    return ResumeResponse.model_validate(resume)

@router.post("/{resume_id}/versions", response_model=ResumeVersionResponse)
async def create_version(
    resume_id: str,
    req: CreateVersionRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": str(user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    optimized = await optimize_resume(
        resume.get("parsed_text") or "",
        "",
        req.target_role,
    )

    now = datetime.now(timezone.utc)
    version = {
        "resume_id": resume_id,
        "title": req.title,
        "content": optimized,
        "target_role": req.target_role,
        "created_at": now,
    }
    result = await db.resume_versions.insert_one(version)
    version["id"] = str(result.inserted_id)
    return ResumeVersionResponse.model_validate(version)

@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
async def list_versions(
    resume_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": str(user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    cursor = db.resume_versions.find({"resume_id": resume_id}).sort("created_at", -1)
    versions = await cursor.to_list(length=50)
    result = []
    for v in versions:
        v["id"] = str(v.pop("_id"))
        result.append(ResumeVersionResponse.model_validate(v))
    return result

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": str(user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    await db.resumes.delete_one({"_id": resume["_id"]})
    return {"message": "Resume deleted"}
