from ..core.database import get_sync_db
from datetime import datetime, timezone, timedelta

def reset_daily_usage():
    db = get_sync_db()
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=1)

    db.users.update_many(
        {"usage_reset_at": {"$lt": cutoff}},
        {"$set": {"daily_usage_count": 0, "usage_reset_at": now}},
    )
