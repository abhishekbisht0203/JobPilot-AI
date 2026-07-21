from ..core.database import SessionLocal
from ..models.application import Application
from datetime import datetime, timezone
from ..services.email.sender import send_email
from sqlalchemy.orm import joinedload
import asyncio

def send_followup_reminders():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        apps = db.query(Application).options(
            joinedload(Application.job),
            joinedload(Application.user),
        ).filter(
            Application.follow_up_at <= now,
            Application.status.in_(["applied", "interviewing"]),
        ).all()

        for app in apps:
            user = app.user
            job = app.job
            if user and user.email and job:
                subject = f"Follow-up reminder: {job.title} at {job.company}"
                body = f"""
Hello {user.name},

It's time to follow up on your application for {job.title} at {job.company}.

You applied on {app.applied_at.strftime('%B %d, %Y') if app.applied_at else 'recently'}.

Best regards,
JobPilot AI
"""
                asyncio.run(send_email(user.email, subject, body, ""))
    finally:
        db.close()
