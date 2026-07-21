from ..core.database import SessionLocal
from ..models.user import User
from datetime import datetime, timezone, timedelta

def reset_daily_usage():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        db.query(User).filter(
            User.usage_reset_at < now - timedelta(days=1)
        ).update({
            User.daily_usage_count: 0,
            User.usage_reset_at: now,
        })
        db.commit()
    finally:
        db.close()
