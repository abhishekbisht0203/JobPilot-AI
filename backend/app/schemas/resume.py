from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeResponse(BaseModel):
    id: str
    original_filename: str
    file_url: Optional[str]
    parsed_text: Optional[str]
    ats_score: int
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeVersionResponse(BaseModel):
    id: str
    resume_id: str
    title: str
    content: str
    target_role: str
    created_at: datetime

    class Config:
        from_attributes = True

class CreateVersionRequest(BaseModel):
    title: str
    target_role: str
