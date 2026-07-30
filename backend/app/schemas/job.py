from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    platform: str
    url: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: Optional[str] = None
    location: Optional[str] = None
    description: str
    skills: List[str] = []
    match_score: Optional[float] = None
    posted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

class MatchScoreRequest(BaseModel):
    resume_id: str
