from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..schemas.auth import UserResponse

router = APIRouter()

@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    name: str = None,
    avatar_url: str = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if name:
        user.name = name
    if avatar_url:
        user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
