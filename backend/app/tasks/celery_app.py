from celery import Celery
from ..core.config import settings

celery_app = Celery(
    "jobpilot",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "reset-daily-usage": {
            "task": "app.tasks.usage.reset_daily_usage",
            "schedule": 86400,
        },
        "fetch-jobs-hourly": {
            "task": "app.tasks.jobs.fetch_jobs_task",
            "schedule": 3600,
        },
        "send-followup-reminders": {
            "task": "app.tasks.reminders.send_followup_reminders",
            "schedule": 43200,
        },
    },
)
