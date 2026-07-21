from ..core.database import SessionLocal
from ..models.job import Job
from ..services.jobs.aggregator import aggregate_all_jobs
import asyncio

def fetch_jobs_task():
    jobs_data = asyncio.run(aggregate_all_jobs())
    db = SessionLocal()
    try:
        for job_data in jobs_data:
            existing = db.query(Job).filter(
                Job.url == job_data["url"],
                Job.company == job_data["company"],
            ).first()
            if not existing:
                job = Job(**job_data)
                db.add(job)
        db.commit()
        print(f"Fetched {len(jobs_data)} new jobs")
    finally:
        db.close()
