import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from ..core.database import Base
import enum

class PlanTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    plan_tier = Column(SAEnum(PlanTier), default=PlanTier.FREE, nullable=False)
    daily_usage_count = Column(Integer, default=0)
    usage_reset_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    google_id = Column(String(255), nullable=True, unique=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
