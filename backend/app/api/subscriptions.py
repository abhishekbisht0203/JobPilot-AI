from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from pydantic import BaseModel
from ..core.database import get_db
from ..core.deps import get_current_user

router = APIRouter()

PLANS = [
    {
        "id": "free",
        "name": "Free",
        "tier": "free",
        "price_monthly": 0,
        "price_yearly": 0,
        "features": [
            "Basic job search",
            "5 applications tracking",
            "1 resume upload",
            "Basic ATS score",
            "Email support",
        ],
        "highlighted": False,
        "popular": False,
    },
    {
        "id": "pro",
        "name": "Pro",
        "tier": "pro",
        "price_monthly": 29,
        "price_yearly": 290,
        "features": [
            "Unlimited job search",
            "Unlimited applications tracking",
            "AI Resume Builder",
            "Advanced ATS scoring",
            "Cover Letter Generator",
            "Mock Interview practice",
            "Salary insights",
            "Priority support",
            "No ads",
        ],
        "highlighted": True,
        "popular": True,
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "tier": "enterprise",
        "price_monthly": 99,
        "price_yearly": 990,
        "features": [
            "Everything in Pro",
            "Team collaboration",
            "API access",
            "Custom branding",
            "Dedicated account manager",
            "Custom integrations",
            "24/7 phone support",
            "SLA guarantee",
        ],
        "highlighted": False,
        "popular": False,
    },
]

class SubscribeRequest(BaseModel):
    plan_id: str
    interval: str = "monthly"

@router.get("/plans")
async def get_plans():
    return {"data": PLANS}

@router.post("")
async def subscribe(
    data: SubscribeRequest,
    user: dict = Depends(get_current_user),
):
    plan = next((p for p in PLANS if p["id"] == data.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    if data.interval not in ("monthly", "yearly"):
        raise HTTPException(status_code=400, detail="Invalid interval")

    db = get_db()
    tier = plan["tier"]
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "plan_tier": tier,
            "subscription_plan": data.plan_id,
            "subscription_interval": data.interval,
            "subscription_updated_at": datetime.now(timezone.utc),
        }},
    )
    return {"message": f"Subscribed to {plan['name']} plan", "plan": plan, "tier": tier}

@router.get("/current")
async def get_current_subscription(
    user: dict = Depends(get_current_user),
):
    plan = next((p for p in PLANS if p["tier"] == user.get("plan_tier", "free")), PLANS[0])
    return {
        "plan": plan,
        "tier": user.get("plan_tier", "free"),
        "interval": user.get("subscription_interval", "monthly"),
    }

@router.post("/cancel")
async def cancel_subscription(
    user: dict = Depends(get_current_user),
):
    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "plan_tier": "free",
            "subscription_plan": None,
            "subscription_interval": None,
        }},
    )
    return {"message": "Subscription cancelled"}
