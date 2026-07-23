from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..core.database import get_db
from ..models.cold_email import ColdEmail

router = APIRouter()

@router.get("/email-open/{tracking_id}")
async def track_email_open(
    tracking_id: str,
    db: Session = Depends(get_db),
):
    email = db.query(ColdEmail).filter(ColdEmail.tracking_id == tracking_id).first()
    if email and not email.opened_at:
        email.opened_at = datetime.now(timezone.utc)
        db.commit()

    from fastapi.responses import Response
    return Response(
        content=b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x00\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b",
        media_type="image/gif",
    )
