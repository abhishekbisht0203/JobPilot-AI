from bson import ObjectId
from ..core.database import get_sync_db
from datetime import datetime, timezone
from ..services.email.sender import send_email
import asyncio

def send_followup_reminders():
    db = get_sync_db()
    now = datetime.now(timezone.utc)

    apps = db.applications.find({
        "follow_up_at": {"$lte": now},
        "status": {"$in": ["applied", "interviewing"]},
    })

    for app in apps:
        uid = app.get("user_id")
        jid = app.get("job_id")
        if not uid or not jid:
            continue

        user = db.users.find_one({"_id": ObjectId(uid)})
        job = db.jobs.find_one({"_id": ObjectId(jid)})

        if user and user.get("email") and job:
            subject = f"Follow-up reminder: {job['title']} at {job['company']}"
            body = f"""
Hello {user['name']},

It's time to follow up on your application for {job['title']} at {job['company']}.

You applied on {app.get('applied_at', '').strftime('%B %d, %Y') if app.get('applied_at') else 'recently'}.

Best regards,
JobPilot AI
"""
            asyncio.run(send_email(user["email"], subject, body, ""))
