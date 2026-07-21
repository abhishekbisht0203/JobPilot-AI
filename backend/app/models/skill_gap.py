import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from ..core.database import Base

class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    target_role = Column(String(255), nullable=False)
    current_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
