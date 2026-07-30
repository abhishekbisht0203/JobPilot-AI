from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeResponse(BaseModel):
    id: str
    original_filename: str
    file_url: Optional[str] = None
    parsed_text: Optional[str] = None
    ats_score: int = 0
    created_at: Optional[datetime] = None

class ResumeVersionResponse(BaseModel):
    id: str
    resume_id: str
    title: str
    content: str
    target_role: str
    created_at: Optional[datetime] = None

class CreateVersionRequest(BaseModel):
    title: str
    target_role: str
