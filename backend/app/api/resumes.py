from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.resume import Resume, ResumeVersion
from ..schemas.resume import ResumeResponse, ResumeVersionResponse, CreateVersionRequest
from ..services.resume.parser import parse_resume
from ..services.resume.ats_scorer import score_resume
from ..services.ai.resume_optimizer import optimize_resume, calculate_ats_score
import uuid

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    content = await file.read()
    parsed_text = await parse_resume(content, file.filename or "resume.pdf")

    if not parsed_text:
        raise HTTPException(status_code=400, detail="Could not parse resume text")

    resume = Resume(
        user_id=user.id,
        original_filename=file.filename or "resume.pdf",
        file_url=None,
        parsed_text=parsed_text,
        ats_score=50,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeResponse.model_validate(resume)

@router.post("/{resume_id}/analyze-ats")
async def analyze_ats(
    resume_id: uuid.UUID,
    job_description: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if resume.parsed_text:
        score = await calculate_ats_score(resume.parsed_text, job_description)
        resume.ats_score = score
        db.commit()

    return {"ats_score": resume.ats_score}

@router.get("", response_model=List[ResumeResponse])
async def list_resumes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resumes = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.created_at.desc()).all()
    return [ResumeResponse.model_validate(r) for r in resumes]

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeResponse.model_validate(resume)

@router.post("/{resume_id}/versions", response_model=ResumeVersionResponse)
async def create_version(
    resume_id: uuid.UUID,
    req: CreateVersionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    optimized = await optimize_resume(
        resume.parsed_text or "",
        "",
        req.target_role,
    )

    version = ResumeVersion(
        resume_id=resume_id,
        title=req.title,
        content=optimized,
        target_role=req.target_role,
    )
    db.add(version)
    db.commit()
    db.refresh(version)

    return ResumeVersionResponse.model_validate(version)

@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
async def list_versions(
    resume_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    versions = db.query(ResumeVersion).join(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user.id,
    ).all()
    return [ResumeVersionResponse.model_validate(v) for v in versions]

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}
