from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..core.database import get_db
from ..core.deps import get_current_user
from ..schemas.job import JobResponse, MatchScoreRequest
from ..services.matching.skill_matcher import calculate_skill_match, calculate_overall_match
import re

router = APIRouter()

@router.get("", response_model=dict)
async def list_jobs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    search: Optional[str] = None,
    platform: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    filter_query = {}

    if search:
        escaped = re.escape(search)
        filter_query["$or"] = [
            {"title": {"$regex": escaped, "$options": "i"}},
            {"company": {"$regex": escaped, "$options": "i"}},
            {"description": {"$regex": escaped, "$options": "i"}},
        ]
    if platform:
        filter_query["platform"] = platform

    total = await db.jobs.count_documents(filter_query)
    cursor = db.jobs.find(filter_query).sort("posted_at", -1).skip((page - 1) * per_page).limit(per_page)
    jobs = await cursor.to_list(length=per_page)

    data = []
    for j in jobs:
        j["id"] = str(j.pop("_id"))
        data.append(JobResponse.model_validate(j))

    return {
        "data": data,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }

@router.get("/search", response_model=List[JobResponse])
async def search_jobs(
    q: str = Query(..., min_length=1),
    user: dict = Depends(get_current_user),
):
    db = get_db()
    escaped = re.escape(q)
    cursor = db.jobs.find({
        "$or": [
            {"title": {"$regex": escaped, "$options": "i"}},
            {"company": {"$regex": escaped, "$options": "i"}},
            {"skills": {"$regex": escaped, "$options": "i"}},
        ]
    }).limit(20)

    jobs = await cursor.to_list(length=20)
    result = []
    for j in jobs:
        j["id"] = str(j.pop("_id"))
        result.append(JobResponse.model_validate(j))
    return result

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["id"] = str(job.pop("_id"))
    return JobResponse.model_validate(job)

@router.post("/{job_id}/match-score")
async def get_match_score(
    job_id: str,
    req: MatchScoreRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume = await db.resumes.find_one({"_id": ObjectId(req.resume_id), "user_id": str(user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_skills = resume.get("parsed_text", "").split() if resume.get("parsed_text") else []
    skill_match = calculate_skill_match(resume_skills, job.get("skills") or [])

    overall = calculate_overall_match(
        skill_score=skill_match,
        experience_score=0.8,
        ats_score=resume.get("ats_score", 70) / 100 if resume.get("ats_score") else 0.7,
    )

    return {
        "overall": overall,
        "skill_match": round(skill_match * 100, 1),
        "ats_score": resume.get("ats_score"),
        "experience_match": 80.0,
    }
