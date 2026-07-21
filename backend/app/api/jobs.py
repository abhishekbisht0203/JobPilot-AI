from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.job import Job
from ..models.resume import Resume
from ..schemas.job import JobResponse, MatchScoreRequest
from ..services.matching.skill_matcher import calculate_skill_match, calculate_overall_match
import uuid

router = APIRouter()

@router.get("", response_model=dict)
async def list_jobs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    search: Optional[str] = None,
    platform: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Job)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Job.title.ilike(search_term) | Job.company.ilike(search_term) | Job.description.ilike(search_term)
        )
    if platform:
        query = query.filter(Job.platform == platform)

    total = query.count()
    jobs = query.order_by(desc(Job.posted_at)).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "data": [JobResponse.model_validate(j) for j in jobs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }

@router.get("/search", response_model=List[JobResponse])
async def search_jobs(
    q: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    search_term = f"%{q}%"
    jobs = db.query(Job).filter(
        Job.title.ilike(search_term) | Job.company.ilike(search_term) | Job.skills.any(q)
    ).limit(20).all()
    return [JobResponse.model_validate(j) for j in jobs]

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse.model_validate(job)

@router.post("/{job_id}/match-score")
async def get_match_score(
    job_id: uuid.UUID,
    req: MatchScoreRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_skills = resume.parsed_text.split() if resume.parsed_text else []
    skill_match = calculate_skill_match(resume_skills, job.skills or [])

    overall = calculate_overall_match(
        skill_score=skill_match,
        experience_score=0.8,
        ats_score=resume.ats_score / 100 if resume.ats_score else 0.7,
    )

    return {
        "overall": overall,
        "skill_match": round(skill_match * 100, 1),
        "ats_score": resume.ats_score,
        "experience_match": 80.0,
    }
