from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from ..core.deps import get_current_user
from ..models.user import User, PlanTier
from ..schemas.auth import (
    LoginRequest, RegisterRequest, GoogleAuthRequest, ForgotPasswordRequest,
    ResetPasswordRequest, AuthResponse, UserResponse,
)
from uuid import UUID

router = APIRouter()

@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        name=req.name,
        plan_tier=PlanTier.FREE,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token,
    )

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token,
    )

@router.post("/google", response_model=AuthResponse)
async def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = payload.get("email", "")
    name = payload.get("name", "Google User")
    google_id = payload.get("sub", "")

    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = User(
            email=email,
            name=name,
            google_id=google_id,
            plan_tier=PlanTier.FREE,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token,
    )

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        reset_token = create_access_token({"sub": str(user.id), "type": "reset"}, expires_delta=3600)
        print(f"Reset token for {user.email}: {reset_token}")
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user = db.query(User).filter(User.id == UUID(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = get_password_hash(req.password)
    db.commit()
    return {"message": "Password reset successful"}

@router.get("/profile", response_model=UserResponse)
async def get_profile(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
