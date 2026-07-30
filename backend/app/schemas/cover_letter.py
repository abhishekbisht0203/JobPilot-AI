from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GenerateCoverLetterRequest(BaseModel):
    job_description: str
    company: str
    job_title: str
    tone: str = "professional"
    resume_id: Optional[str] = None

class CoverLetterResponse(BaseModel):
    id: str
    company: str
    job_title: str
    tone: str
    content: str
    created_at: Optional[datetime] = None
