from fastapi import APIRouter, Depends
from ..core.database import get_db
from ..core.deps import get_current_user
from ..schemas.auth import UserResponse

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
