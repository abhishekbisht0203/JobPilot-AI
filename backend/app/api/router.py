from fastapi import APIRouter
from . import auth, users, resumes, cover_letters, cold_emails, jobs, applications, ai_features, analytics, webhooks

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(cover_letters.router, prefix="/cover-letters", tags=["Cover Letters"])
api_router.include_router(cold_emails.router, prefix="/cold-emails", tags=["Cold Emails"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(ai_features.router, prefix="/ai", tags=["AI Features"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
