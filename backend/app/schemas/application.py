from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class CreateApplicationRequest(BaseModel):
    job_id: uuid.UUID
    notes: Optional[str] = None

class UpdateApplicationRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: uuid.UUID
    job_id: uuid.UUID
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
