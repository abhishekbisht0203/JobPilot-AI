from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from passlib.context import CryptContext
from ..core.database import get_db
from ..core.deps import get_current_user
from ..schemas.auth import UserResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    name: str = None,
    avatar_url: str = None,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    update = {}
    if name:
        update["name"] = name
    if avatar_url:
        update["avatar_url"] = avatar_url

    if update:
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
        user.update(update)

    user["id"] = str(user["_id"])
    return UserResponse.model_validate(user)

class NotificationSettings(BaseModel):
    push_enabled: bool = True
    email_enabled: bool = True
    sms_enabled: bool = False
    application_updates: bool = True
    marketing_emails: bool = False

class PrivacySettings(BaseModel):
    profile_visible: bool = True
    resume_public: bool = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.patch("/notifications")
async def update_notification_settings(
    data: NotificationSettings,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"notification_settings": data.model_dump()}},
    )
    return {"message": "Notification settings updated"}

@router.patch("/privacy")
async def update_privacy_settings(
    data: PrivacySettings,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"privacy_settings": data.model_dump()}},
    )
    return {"message": "Privacy settings updated"}

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    user: dict = Depends(get_current_user),
):
    if not pwd_context.verify(data.current_password, user.get("hashed_password", "")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    db = get_db()
    new_hashed = pwd_context.hash(data.new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"hashed_password": new_hashed}},
    )
    return {"message": "Password changed successfully"}

@router.delete("/account")
async def delete_account(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = user["_id"]

    await db.applications.delete_many({"user_id": str(user_id)})
    await db.resumes.delete_many({"user_id": str(user_id)})
    await db.cover_letters.delete_many({"user_id": str(user_id)})
    await db.cold_emails.delete_many({"user_id": str(user_id)})
    await db.notifications.delete_many({"user_id": str(user_id)})
    await db.messages.delete_many({
        "$or": [{"sender_id": str(user_id)}, {"recipient_id": str(user_id)}],
    })
    await db.contact_messages.delete_many({"user_id": str(user_id)})
    await db.users.delete_one({"_id": user_id})

    return {"message": "Account deleted successfully"}
