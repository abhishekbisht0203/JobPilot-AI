from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.deps import get_current_user

router = APIRouter()


@router.get("")
async def list_saved_jobs(user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(user["_id"])
    cursor = db.savedjobs.find({"userId": user_id}).sort("createdAt", -1)
    saved = await cursor.to_list(length=100)

    result = []
    for s in saved:
        s["id"] = str(s.pop("_id"))
        # Populate job
        job_id = s.get("jobId") or s.get("job_id")
        if job_id:
            job = await db.jobs.find_one({"_id": ObjectId(job_id)})
            if job:
                job["id"] = str(job.pop("_id"))
                s["job"] = {k: v for k, v in job.items() if k != "_id"}
        result.append(s)

    return {"success": True, "savedJobs": result}


@router.post("")
async def save_job(data: dict, user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(user["_id"])
    job_id = data.get("jobId") or data.get("job_id")
    if not job_id:
        raise HTTPException(status_code=400, detail="job_id is required")

    # Check if already saved
    existing = await db.savedjobs.find_one({"userId": user_id, "$or": [{"jobId": job_id}, {"job_id": job_id}]})
    if existing:
        return {"success": True, "message": "Job already saved"}

    now = datetime.now(timezone.utc)
    doc = {
        "userId": user_id,
        "jobId": job_id,
        "createdAt": now,
    }
    result = await db.savedjobs.insert_one(doc)
    return {"success": True, "message": "Job saved", "id": str(result.inserted_id)}


@router.delete("/{saved_id}")
async def remove_saved_job(saved_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.savedjobs.delete_one({"_id": ObjectId(saved_id), "userId": str(user["_id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved job not found")
    return {"success": True, "message": "Job unsaved"}
