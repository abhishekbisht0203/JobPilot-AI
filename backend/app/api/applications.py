from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.application import Application, ApplicationStatus
from ..models.job import Job
from ..schemas.application import (
    CreateApplicationRequest, UpdateApplicationRequest,
    ApplicationResponse, ApplicationStatsResponse,
)
from ..schemas.job import JobResponse
import uuid

router = APIRouter()

@router.post("", response_model=ApplicationResponse)
async def create_application(
    req: CreateApplicationRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(Application).filter(
        Application.user_id == user.id,
        Application.job_id == req.job_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    application = Application(
        user_id=user.id,
        job_id=req.job_id,
        status=ApplicationStatus.SAVED,
        notes=req.notes,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return ApplicationResponse.model_validate(application)

@router.get("", response_model=dict)
async def list_applications(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Application).filter(Application.user_id == user.id)
    if status:
        query = query.filter(Application.status == status)

    total = query.count()
    apps = query.order_by(desc(Application.created_at)).offset((page - 1) * 20).limit(20).all()

    result = []
    for app in apps:
        app_data = ApplicationResponse.model_validate(app).model_dump()
        job = db.query(Job).filter(Job.id == app.job_id).first()
        if job:
            app_data["job"] = JobResponse.model_validate(job).model_dump()
        result.append(app_data)

    return {"data": result, "total": total, "page": page, "per_page": 20}

@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: uuid.UUID,
    req: UpdateApplicationRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if req.status:
        app.status = req.status
        if req.status == "applied" and not app.applied_at:
            app.applied_at = datetime.now(timezone.utc)
    if req.notes is not None:
        app.notes = req.notes

    db.commit()
    db.refresh(app)
    return ApplicationResponse.model_validate(app)

@router.delete("/{application_id}")
async def delete_application(
    application_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    return {"message": "Application deleted"}

@router.get("/stats", response_model=ApplicationStatsResponse)
async def get_application_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    apps = db.query(Application).filter(Application.user_id == user.id).all()
    stats = {"saved": 0, "applied": 0, "interviewing": 0, "offer": 0, "rejected": 0}
    for app in apps:
        status = app.status.value if hasattr(app.status, 'value') else app.status
        if status in stats:
            stats[status] += 1

    return ApplicationStatsResponse(
        **stats,
        total=len(apps),
    )
