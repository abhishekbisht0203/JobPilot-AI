from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class ResumeResponse(BaseModel):
    id: uuid.UUID
    original_filename: str
    file_url: Optional[str]
    parsed_text: Optional[str]
    ats_score: int
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeVersionResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    title: str
    content: str
    target_role: str
    created_at: datetime

    class Config:
        from_attributes = True

class CreateVersionRequest(BaseModel):
    title: str
    target_role: str
