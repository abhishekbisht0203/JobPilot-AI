from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel
from ..core.database import get_db
from ..core.deps import get_current_user

router = APIRouter()

class ContactSubmission(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    type: str = "general"

@router.post("")
async def submit_contact(
    data: ContactSubmission,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = str(user["_id"])
    doc = {
        "user_id": user_id,
        "name": data.name,
        "email": data.email,
        "subject": data.subject,
        "message": data.message,
        "type": data.type,
        "status": "open",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.contact_messages.insert_one(doc)
    return {"message": "Message sent successfully", "id": str(result.inserted_id)}

@router.get("/tickets")
async def list_tickets(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = str(user["_id"])
    cursor = db.contact_messages.find({"user_id": user_id}).sort("created_at", -1)
    tickets = await cursor.to_list(length=50)
    for t in tickets:
        t["id"] = str(t.pop("_id"))
    return {"data": tickets}
