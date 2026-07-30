from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str  # maps to fullname in Express schema
    email: EmailStr
    password: str
    phoneNumber: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    code: Optional[str] = None
    state: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class GitHubAuthRequest(BaseModel):
    code: str
    state: Optional[str] = None

class GitHubUrlResponse(BaseModel):
    url: str

class UserResponse(BaseModel):
    id: str
    _id: str
    email: str
    fullname: Optional[str] = None
    name: Optional[str] = None
    phoneNumber: Optional[str] = None
    avatar_url: Optional[str] = None
    profile: Optional[dict] = None
    profilePhoto: Optional[str] = None
    roles: Optional[dict] = None
    currentRole: Optional[str] = None
    profileCompleted: Optional[bool] = None
    plan_tier: Optional[str] = "free"
    daily_usage_count: Optional[int] = 0
    usage_reset_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class AuthResponse(BaseModel):
    success: bool = True
    user: UserResponse
    token: str
