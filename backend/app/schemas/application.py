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
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    follow_up_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ApplicationStatsResponse(BaseModel):
    saved: int = 0
    applied: int = 0
    interviewing: int = 0
    offer: int = 0
    rejected: int = 0
    total: int = 0
