from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    avatar_url: Optional[str] = None
    plan_tier: str
    daily_usage_count: int
    usage_reset_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
