import asyncio
import traceback
from app.core.database import get_db, connect_db, close_db

async def check():
    await connect_db()
    db = get_db()
    try:
        pipeline = [
            {"$group": {
                "_id": "$company",
                "jobs_count": {"$sum": 1},
                "locations": {"$addToSet": "$location"},
                "skills": {"$addToSet": {"$ifNull": ["$skills", []]}},
                "sample_description": {"$first": "$description"},
            }},
            {"$sort": {"jobs_count": -1}},
        ]
        cursor = db.jobs.aggregate(pipeline)
        all_companies = await cursor.to_list(length=100)
        print(f"Async: Companies found: {len(all_companies)}")
        for c in all_companies[:3]:
            print(f"  - {c['_id']} ({c['jobs_count']} jobs)")
    except Exception as e:
        print(f"Async Error: {type(e).__name__}: {e}")
        traceback.print_exc()
    finally:
        await close_db()

asyncio.run(check())
