from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models import ApplicationStatus
from ..schemas.application import (
    CreateApplicationRequest, UpdateApplicationRequest,
    ApplicationResponse, ApplicationStatsResponse,
)
from ..schemas.job import JobResponse

router = APIRouter()

@router.post("", response_model=ApplicationResponse)
async def create_application(
    req: CreateApplicationRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(req.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = await db.applications.find_one({
        "user_id": str(user["_id"]),
        "job_id": req.job_id,
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": str(user["_id"]),
        "job_id": req.job_id,
        "status": ApplicationStatus.SAVED.value,
        "notes": req.notes,
        "applied_at": None,
        "follow_up_at": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.applications.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return ApplicationResponse.model_validate(doc)

@router.get("", response_model=dict)
async def list_applications(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    user: dict = Depends(get_current_user),
):
    db = get_db()
    filter_query = {"user_id": str(user["_id"])}
    if status:
        filter_query["status"] = status

    total = await db.applications.count_documents(filter_query)
    cursor = db.applications.find(filter_query).sort("created_at", -1).skip((page - 1) * 20).limit(20)
    apps = await cursor.to_list(length=20)

    result = []
    for app in apps:
        app["id"] = str(app.pop("_id"))
        app_data = ApplicationResponse.model_validate(app).model_dump()
        job = await db.jobs.find_one({"_id": ObjectId(app["job_id"])})
        if job:
            job["id"] = str(job.pop("_id"))
            app_data["job"] = JobResponse.model_validate(job).model_dump()
        result.append(app_data)

    return {"data": result, "total": total, "page": page, "per_page": 20}

@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    req: UpdateApplicationRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    app = await db.applications.find_one({
        "_id": ObjectId(application_id),
        "user_id": str(user["_id"]),
    })
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    update = {"updated_at": datetime.now(timezone.utc)}
    if req.status:
        update["status"] = req.status
        if req.status == "applied" and not app.get("applied_at"):
            update["applied_at"] = datetime.now(timezone.utc)
    if req.notes is not None:
        update["notes"] = req.notes

    await db.applications.update_one({"_id": app["_id"]}, {"$set": update})
    app.update(update)
    app["id"] = str(app.pop("_id"))
    return ApplicationResponse.model_validate(app)

@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    app = await db.applications.find_one({
        "_id": ObjectId(application_id),
        "user_id": str(user["_id"]),
    })
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    await db.applications.delete_one({"_id": app["_id"]})
    return {"message": "Application deleted"}

@router.get("/stats", response_model=ApplicationStatsResponse)
async def get_application_stats(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    pipeline = [
        {"$match": {"user_id": str(user["_id"])}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    cursor = db.applications.aggregate(pipeline)
    counts = await cursor.to_list(length=10)

    stats = {"saved": 0, "applied": 0, "interviewing": 0, "offer": 0, "rejected": 0}
    total = 0
    for row in counts:
        status = row["_id"]
        count = row["count"]
        total += count
        if status in stats:
            stats[status] = count

    return ApplicationStatsResponse(**stats, total=total)
