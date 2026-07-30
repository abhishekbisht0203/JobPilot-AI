from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta
from ..core.database import get_db
from ..core.deps import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    user_id = str(user["_id"])

    total_apps = await db.applications.count_documents({"user_id": user_id})
    weekly_apps = await db.applications.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": week_ago},
    })

    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    cursor = db.applications.aggregate(pipeline)
    status_counts = await cursor.to_list(length=10)

    interviews = sum(row["count"] for row in status_counts if row["_id"] == "interviewing")
    offers = sum(row["count"] for row in status_counts if row["_id"] == "offer")

    return {
        "total_applications": total_apps,
        "weekly_applications": weekly_apps,
        "interviews": interviews,
        "offers": offers,
        "status_breakdown": {str(row["_id"]): row["count"] for row in status_counts},
    }

@router.get("/usage")
async def get_usage_stats(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    today_usage = await db.usage_logs.count_documents({
        "user_id": str(user["_id"]),
        "timestamp": {"$gte": today_start},
    })

    return {
        "daily_usage": today_usage,
        "daily_limit": user.get("daily_usage_count", 0),
        "plan_tier": user.get("plan_tier", "free"),
    }
