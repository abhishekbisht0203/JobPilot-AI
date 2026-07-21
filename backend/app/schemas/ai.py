from pydantic import BaseModel
from typing import List, Optional

class MockInterviewRequest(BaseModel):
    job_id: Optional[str] = None
    job_description: str

class MockInterviewResponse(BaseModel):
    questions: List[str]

class SkillGapRequest(BaseModel):
    target_role: str
    current_skills: List[str]

class SkillGapResponse(BaseModel):
    current_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]

class LinkedinOptimizeRequest(BaseModel):
    profile_section: str
    content: str

class LinkedinOptimizeResponse(BaseModel):
    optimized: str
