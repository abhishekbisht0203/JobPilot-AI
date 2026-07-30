import asyncio, traceback
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
        companies = []
        for c in all_companies:
            company = {
                "id": c["_id"],
                "name": c["_id"],
                "jobs_count": c["jobs_count"],
            }
            companies.append(company)
        print(f"Success: {len(companies)} companies")
        for c in companies[:3]:
            print(f'  {c["name"]} ({c["jobs_count"]} jobs)')
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")
        traceback.print_exc()
    finally:
        await close_db()

asyncio.run(check())
