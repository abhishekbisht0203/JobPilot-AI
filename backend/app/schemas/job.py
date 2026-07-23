from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class JobResponse(BaseModel):
    id: uuid.UUID
    title: str
    company: str
    platform: str
    url: str
    salary_min: Optional[int]
    salary_max: Optional[int]
    currency: Optional[str]
    location: Optional[str]
    description: str
    skills: List[str]
    match_score: Optional[float] = None
    posted_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class MatchScoreRequest(BaseModel):
    resume_id: str
