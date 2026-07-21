from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.application import Application
from ..models.usage_log import UsageLog

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    total_apps = db.query(func.count(Application.id)).filter(Application.user_id == user.id).scalar() or 0
    weekly_apps = db.query(func.count(Application.id)).filter(
        Application.user_id == user.id,
        Application.created_at >= week_ago,
    ).scalar() or 0

    status_counts = db.query(
        Application.status, func.count(Application.id)
    ).filter(Application.user_id == user.id).group_by(Application.status).all()

    interviews = sum(count for status, count in status_counts if status == "interviewing")
    offers = sum(count for status, count in status_counts if status == "offer")

    return {
        "total_applications": total_apps,
        "weekly_applications": weekly_apps,
        "interviews": interviews,
        "offers": offers,
        "status_breakdown": {str(s): c for s, c in status_counts},
    }

@router.get("/usage")
async def get_usage_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    today_usage = db.query(func.count(UsageLog.id)).filter(
        UsageLog.user_id == user.id,
        UsageLog.timestamp >= today_start,
    ).scalar() or 0

    return {
        "daily_usage": today_usage,
        "daily_limit": user.daily_usage_count,
        "plan_tier": user.plan_tier,
    }
