import secrets
import httpx
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from ..core.database import get_db
from ..core.security import get_password_hash, verify_password, create_access_token, decode_token
from ..core.deps import get_current_user
from ..core.config import settings
from ..models import PlanTier
from ..schemas.auth import (
    LoginRequest, RegisterRequest, GoogleAuthRequest, ForgotPasswordRequest,
    ResetPasswordRequest, AuthResponse, UserResponse, GitHubAuthRequest,
)

router = APIRouter()

_oauth_states: dict[str, str] = {}

def _generate_state() -> str:
    state = secrets.token_urlsafe(32)
    _oauth_states[state] = ""
    return state

def _consume_state(state: str) -> bool:
    return _oauth_states.pop(state, None) is not None

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAIL_URL = "https://api.github.com/user/emails"

def _doc_to_user(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    db = get_db()
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.now(timezone.utc)
    user = {
        "email": req.email,
        "password_hash": get_password_hash(req.password),
        "name": req.name,
        "avatar_url": None,
        "plan_tier": PlanTier.FREE.value,
        "daily_usage_count": 0,
        "usage_reset_at": now,
        "google_id": None,
        "github_id": None,
        "is_active": 1,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(user)
    user["id"] = str(result.inserted_id)

    token = create_access_token({"sub": user["id"]})
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token,
    )

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": req.email})
    if not user or not user.get("password_hash") or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user["id"] = str(user.pop("_id"))
    token = create_access_token({"sub": user["id"]})
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token,
    )

@router.get("/google/url")
async def google_oauth_url():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    state = _generate_state()
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&state={state}"
    )
    return {"url": url}

@router.post("/google", response_model=AuthResponse)
async def google_auth(req: GoogleAuthRequest):
    if req.code and req.state:
        if not _consume_state(req.state):
            raise HTTPException(status_code=401, detail="Invalid state parameter")
        return await _google_code_flow(req.code)
    if req.id_token:
        return await _google_id_token_flow(req.id_token)
    raise HTTPException(status_code=400, detail="Provide either id_token or code+state")

async def _google_id_token_flow(id_token: str) -> AuthResponse:
    async with httpx.AsyncClient() as client:
        resp = await client.get(GOOGLE_TOKENINFO_URL, params={"id_token": id_token})
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google ID token")
        payload = resp.json()
    if payload.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch")
    return await _upsert_google_user(payload)

async def _google_code_flow(code: str) -> AuthResponse:
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to exchange Google code")
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="Invalid Google code")
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to fetch Google user")
        payload = userinfo_resp.json()
    return await _upsert_google_user(payload)

async def _upsert_google_user(payload: dict) -> AuthResponse:
    db = get_db()
    email = payload.get("email", "")
    name = payload.get("name", "Google User")
    google_id = str(payload.get("id") or payload.get("sub", ""))
    picture = payload.get("picture", "")

    if not google_id:
        raise HTTPException(status_code=401, detail="Missing Google user ID")

    user = await db.users.find_one({"google_id": google_id})
    if not user:
        existing = await db.users.find_one({"email": email}) if email else None
        if existing:
            await db.users.update_one(
                {"_id": existing["_id"]},
                {"$set": {"google_id": google_id, "avatar_url": existing.get("avatar_url") or picture}}
            )
            user = await db.users.find_one({"_id": existing["_id"]})
        else:
            now = datetime.now(timezone.utc)
            doc = {
                "email": email or f"google_{google_id}@placeholder.local",
                "password_hash": None,
                "name": name,
                "avatar_url": picture or None,
                "plan_tier": PlanTier.FREE.value,
                "daily_usage_count": 0,
                "usage_reset_at": now,
                "google_id": google_id,
                "github_id": None,
                "is_active": 1,
                "created_at": now,
                "updated_at": now,
            }
            result = await db.users.insert_one(doc)
            user = doc
            user["_id"] = result.inserted_id

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id})
    user["id"] = user_id
    return AuthResponse(user=UserResponse.model_validate(user), token=token)

@router.get("/github/url")
async def github_oauth_url():
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    state = _generate_state()
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        f"&state={state}"
        f"&scope=read:user%20user:email"
    )
    return {"url": url}

@router.post("/github", response_model=AuthResponse)
async def github_auth(req: GitHubAuthRequest):
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")

    if req.state and not _consume_state(req.state):
        raise HTTPException(status_code=401, detail="Invalid state parameter")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GITHUB_ACCESS_TOKEN_URL,
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": req.code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to get GitHub access token")
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="Invalid GitHub code")

        user_resp = await client.get(GITHUB_USER_URL, headers={"Authorization": f"Bearer {access_token}"})
        if user_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to fetch GitHub user")
        user_data = user_resp.json()

        email_resp = await client.get(GITHUB_EMAIL_URL, headers={"Authorization": f"Bearer {access_token}"})
        emails = email_resp.json() if email_resp.status_code == 200 else []
        primary_email = next((e["email"] for e in emails if e.get("primary")), user_data.get("email", ""))

    github_id = str(user_data["id"])
    name = user_data.get("name") or user_data.get("login", "GitHub User")
    avatar_url = user_data.get("avatar_url", "")

    db = get_db()
    user = await db.users.find_one({"github_id": github_id})
    if not user:
        existing = await db.users.find_one({"email": primary_email}) if primary_email else None
        if existing:
            await db.users.update_one(
                {"_id": existing["_id"]},
                {"$set": {"github_id": github_id, "avatar_url": existing.get("avatar_url") or avatar_url}}
            )
            user = await db.users.find_one({"_id": existing["_id"]})
        else:
            now = datetime.now(timezone.utc)
            doc = {
                "email": primary_email or f"github_{github_id}@placeholder.local",
                "password_hash": None,
                "name": name,
                "avatar_url": avatar_url or None,
                "plan_tier": PlanTier.FREE.value,
                "daily_usage_count": 0,
                "usage_reset_at": now,
                "google_id": None,
                "github_id": github_id,
                "is_active": 1,
                "created_at": now,
                "updated_at": now,
            }
            result = await db.users.insert_one(doc)
            user = doc
            user["_id"] = result.inserted_id

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id})
    user["id"] = user_id
    return AuthResponse(user=UserResponse.model_validate(user), token=token)

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    db = get_db()
    user = await db.users.find_one({"email": req.email})
    if user:
        reset_token = create_access_token({"sub": str(user["_id"]), "type": "reset"}, expires_delta=timedelta(hours=1))
        print(f"Reset token for {req.email}: {reset_token}")
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    payload = decode_token(req.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": get_password_hash(req.password)}}
    )
    return {"message": "Password reset successful"}

@router.get("/profile", response_model=UserResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    user["id"] = str(user["_id"])
    return UserResponse.model_validate(user)
