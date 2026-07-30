from fastapi import APIRouter, Depends, HTTPException
from ..core.database import get_db
from ..core.deps import get_current_user

router = APIRouter()

INDUSTRIES = {
    "healthcare": "Healthcare",
    "finance": "Finance",
    "technology": "Technology",
    "education": "Education",
    "retail": "Retail",
    "manufacturing": "Manufacturing",
    "media": "Media",
    "consulting": "Consulting",
    "real_estate": "Real Estate",
    "hospitality": "Hospitality",
    "transportation": "Transportation",
    "energy": "Energy",
}

def derive_industry(description: str = "") -> str:
    desc = description.lower() if description else ""
    if any(w in desc for w in ["health", "medical", "hospital", "pharma", "clinical"]):
        return "Healthcare"
    if any(w in desc for w in ["bank", "finance", "financial", "insurance", "investment", "accounting"]):
        return "Finance"
    if any(w in desc for w in ["software", "tech", "engineering", "developer", "cloud", "data", "ai", "ml", "computer", "it "]):
        return "Technology"
    if any(w in desc for w in ["education", "teaching", "training", "school", "university", "learning"]):
        return "Education"
    if any(w in desc for w in ["retail", "ecommerce", "store", "shop", "merchandise"]):
        return "Retail"
    if any(w in desc for w in ["manufacturing", "production", "factory", "supply chain"]):
        return "Manufacturing"
    if any(w in desc for w in ["media", "news", "publishing", "content", "marketing", "advertising"]):
        return "Media"
    if any(w in desc for w in ["consulting", "advisory", "strategy"]):
        return "Consulting"
    return "Technology"

@router.get("")
async def list_companies(
    page: int = 1,
    per_page: int = 20,
    search: str = "",
    user: dict = Depends(get_current_user),
):
    db = get_db()
    skip = (page - 1) * per_page

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

    if search:
        pipeline.insert(0, {"$match": {"company": {"$regex": search, "$options": "i"}}})

    cursor = db.jobs.aggregate(pipeline)
    all_companies = await cursor.to_list(length=100)

    companies = []
    for c in all_companies:
        flat_skills = [s for sub in c.get("skills", []) for s in (sub if isinstance(sub, list) else [sub]) if s]
        company = {
            "id": c["_id"],
            "name": c["_id"],
            "industry": derive_industry(c.get("sample_description", "")),
            "description": (c.get("sample_description", "") or "")[:300],
            "open_jobs_count": c["jobs_count"],
            "locations": list(set(l for l in c.get("locations", []) if l)),
            "skills": list(set(flat_skills)),
            "employees_count": None,
            "rating": None,
        }
        companies.append(company)

    total = len(companies)
    paginated = companies[skip:skip + per_page]

    return {"data": paginated, "total": total, "page": page, "per_page": per_page}

@router.get("/{name}")
async def get_company(
    name: str,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    cursor = db.jobs.find({"company": name}).sort("created_at", -1)
    jobs = await cursor.to_list(length=100)

    if not jobs:
        raise HTTPException(status_code=404, detail="Company not found")

    for j in jobs:
        j["id"] = str(j.pop("_id"))

    skills = set()
    locations = set()
    for j in jobs:
        if j.get("skills"):
            skills.update(j["skills"])
        if j.get("location"):
            locations.add(j["location"])

    company = {
        "id": name,
        "name": name,
        "industry": derive_industry(jobs[0].get("description", "")),
        "description": (jobs[0].get("description", "") or "")[:500],
        "open_jobs_count": len(jobs),
        "locations": list(locations),
        "skills": list(skills),
        "employees_count": None,
        "rating": None,
        "jobs": [{
            "id": j["id"],
            "title": j.get("title", ""),
            "location": j.get("location"),
            "description": (j.get("description", "") or "")[:200],
            "skills": j.get("skills", []),
            "salary_min": j.get("salary_min"),
            "salary_max": j.get("salary_max"),
            "currency": j.get("currency"),
            "posted_at": j.get("posted_at"),
            "created_at": j.get("created_at"),
        } for j in jobs],
    }

    return {"data": company}
