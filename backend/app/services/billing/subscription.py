from ...core.config import settings

async def create_checkout_session(user_id: str, price_id: str) -> str:
    if not settings.STRIPE_SECRET_KEY:
        return "mock_session_id"
    
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    session = stripe.checkout.Session.create(
        customer_email=None,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url="https://jobpilot.ai/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="https://jobpilot.ai/pricing",
        metadata={"user_id": str(user_id)},
    )
    return session.url

async def cancel_subscription(subscription_id: str) -> bool:
    if not settings.STRIPE_SECRET_KEY:
        return True
    
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    try:
        stripe.Subscription.delete(subscription_id)
        return True
    except Exception as e:
        print(f"Stripe cancellation error: {e}")
        return False

async def get_usage_limits(plan_tier: str) -> int:
    if plan_tier == "free":
        return settings.FREE_DAILY_LIMIT
    elif plan_tier == "pro":
        return settings.PRO_DAILY_LIMIT
    else:
        return 9999
