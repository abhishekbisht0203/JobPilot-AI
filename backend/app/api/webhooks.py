from fastapi import APIRouter
from fastapi.responses import Response
from datetime import datetime, timezone
from ..core.database import get_db

router = APIRouter()

@router.get("/email-open/{tracking_id}")
async def track_email_open(
    tracking_id: str,
):
    db = get_db()
    email = await db.cold_emails.find_one({"tracking_id": tracking_id})
    if email and not email.get("opened_at"):
        await db.cold_emails.update_one(
            {"_id": email["_id"]},
            {"$set": {"opened_at": datetime.now(timezone.utc)}}
        )

    return Response(
        content=b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x00\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b",
        media_type="image/gif",
    )
