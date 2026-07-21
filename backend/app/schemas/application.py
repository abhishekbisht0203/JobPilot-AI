from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CreateApplicationRequest(BaseModel):
    job_id: str
    notes: Optional[str] = None

class UpdateApplicationRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    status: str
    notes: Optional[str]
    applied_at: Optional[datetime]
    follow_up_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ApplicationStatsResponse(BaseModel):
    saved: int
    applied: int
    interviewing: int
    offer: int
    rejected: int
    total: int
