from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel
from ..core.database import get_db
from ..core.deps import get_current_user

router = APIRouter()

class SendMessage(BaseModel):
    recipient_id: str
    content: str

@router.get("")
async def list_messages(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = str(user["_id"])
    skip = (page - 1) * per_page

    total = await db.messages.count_documents({
        "$or": [{"sender_id": user_id}, {"recipient_id": user_id}],
    })

    cursor = db.messages.find({
        "$or": [{"sender_id": user_id}, {"recipient_id": user_id}],
    }).sort("created_at", -1).skip(skip).limit(per_page)

    messages = await cursor.to_list(length=per_page)
    for m in messages:
        m["id"] = str(m.pop("_id"))

    return {"data": messages, "total": total, "page": page, "per_page": per_page}

@router.post("")
async def send_message(
    data: SendMessage,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = str(user["_id"])

    recipient = await db.users.find_one({"_id": ObjectId(data.recipient_id)})
    if not recipient and data.recipient_id != "system":
        raise HTTPException(status_code=404, detail="Recipient not found")

    doc = {
        "sender_id": user_id,
        "sender_name": user.get("name", "User"),
        "recipient_id": data.recipient_id,
        "content": data.content,
        "read": False,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.messages.insert_one(doc)
    doc["id"] = str(result.inserted_id)

    return {"message": "Message sent", "data": doc}
