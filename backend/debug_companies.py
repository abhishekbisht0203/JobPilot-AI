import asyncio
import traceback
from app.core.database import get_sync_db, get_db

# Try sync first
try:
    db = get_sync_db()
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
    results = list(cursor)
    print(f"Sync: Companies found: {len(results)}")
    for r in results[:3]:
        print(f"  - {r['_id']} ({r['jobs_count']} jobs)")
        print(f"    locations: {r.get('locations', [])}")
        print(f"    sample: {(r.get('sample_description', '') or '')[:100]}")
except Exception as e:
    print(f"Sync Error: {type(e).__name__}: {e}")
    traceback.print_exc()
