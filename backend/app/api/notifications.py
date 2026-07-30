from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from ..core.database import get_db
from ..core.deps import get_current_user

router = APIRouter()

@router.get("")
async def list_notifications(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = str(user["_id"])
    skip = (page - 1) * per_page

    total = await db.notifications.count_documents({"user_id": user_id})
    cursor = db.notifications.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(per_page)
    notifications = await cursor.to_list(length=per_page)

    for n in notifications:
        n["id"] = str(n.pop("_id"))

    return {"data": notifications, "total": total, "page": page, "per_page": per_page}

@router.patch("/{id}/read")
async def mark_notification_read(
    id: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = str(user["_id"])
    result = await db.notifications.update_one(
        {"_id": ObjectId(id), "user_id": user_id},
        {"$set": {"read": True}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}

@router.post("/read-all")
async def mark_all_read(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = str(user["_id"])
    await db.notifications.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}},
    )
    return {"message": "All notifications marked as read"}

@router.get("/seed")
async def seed_notifications(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = str(user["_id"])
    existing = await db.notifications.count_documents({"user_id": user_id})
    if existing > 0:
        return {"message": "Notifications already exist"}

    samples = [
        {"type": "application", "title": "Application Received", "body": "Your application for Software Engineer at Google has been received."},
        {"type": "interview", "title": "Interview Scheduled", "body": "You have an interview with Microsoft on Friday at 2:00 PM."},
        {"type": "offer", "title": "Offer Received!", "body": "Congratulations! Stripe has sent you an offer letter."},
        {"type": "message", "title": "New Message", "body": "Recruiter from Amazon viewed your profile."},
        {"type": "system", "title": "Profile Updated", "body": "Your profile has been updated successfully."},
        {"type": "reminder", "title": "Follow Up Reminder", "body": "Follow up on your application to Apple - 3 days since applied."},
    ]

    now = datetime.now(timezone.utc)
    for i, s in enumerate(samples):
        await db.notifications.insert_one({
            "user_id": user_id,
            "type": s["type"],
            "title": s["title"],
            "body": s["body"],
            "read": False,
            "data": {},
            "created_at": now,
        })

    return {"message": f"Seeded {len(samples)} notifications"}
