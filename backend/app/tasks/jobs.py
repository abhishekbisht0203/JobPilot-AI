from ..core.database import get_sync_db
from ..services.jobs.aggregator import aggregate_all_jobs
import asyncio

def fetch_jobs_task():
    jobs_data = asyncio.run(aggregate_all_jobs())
    db = get_sync_db()
    count = 0

    for job_data in jobs_data:
        existing = db.jobs.find_one({
            "url": job_data["url"],
            "company": job_data["company"],
        })
        if not existing:
            db.jobs.insert_one(job_data)
            count += 1

    print(f"Fetched {count} new jobs")
