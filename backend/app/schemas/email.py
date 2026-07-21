from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GenerateEmailRequest(BaseModel):
    company: str
    job_title: str
    recruiter_name: Optional[str] = None
    resume_id: Optional[str] = None

class ColdEmailResponse(BaseModel):
    id: str
    recruiter_name: Optional[str]
    recruiter_email: Optional[str]
    company: str
    subject: str
    body: str
    tracking_id: str
    opened_at: Optional[datetime]
    sent: bool
    created_at: datetime

    class Config:
        from_attributes = True
