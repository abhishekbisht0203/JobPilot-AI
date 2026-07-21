from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.mock_interview import MockInterview
from ..models.skill_gap import SkillGapAnalysis
from ..schemas.ai import (
    MockInterviewRequest, MockInterviewResponse,
    SkillGapRequest, SkillGapResponse,
    LinkedinOptimizeRequest, LinkedinOptimizeResponse,
)
from ..services.ai.interview import generate_interview_questions
from ..services.ai.skill_gap import analyze_skill_gap
from ..services.ai.linkedin_optimizer import optimize_linkedin_section

router = APIRouter()

@router.post("/mock-interview", response_model=MockInterviewResponse)
async def create_mock_interview(
    req: MockInterviewRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = await generate_interview_questions(req.job_description)

    interview = MockInterview(
        user_id=user.id,
        job_id=req.job_id,
        questions=questions,
    )
    db.add(interview)
    db.commit()

    return MockInterviewResponse(questions=questions)

@router.post("/skill-gap", response_model=SkillGapResponse)
async def analyze_skills(
    req: SkillGapRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = await analyze_skill_gap(req.target_role, req.current_skills)

    analysis = SkillGapAnalysis(
        user_id=user.id,
        target_role=req.target_role,
        current_skills=result.get("current_skills", req.current_skills),
        missing_skills=result.get("missing_skills", []),
        recommendations=result.get("recommendations", []),
    )
    db.add(analysis)
    db.commit()

    return SkillGapResponse(
        current_skills=result.get("current_skills", req.current_skills),
        missing_skills=result.get("missing_skills", []),
        recommendations=result.get("recommendations", []),
    )

@router.post("/linkedin-optimize", response_model=LinkedinOptimizeResponse)
async def optimize_linkedin(
    req: LinkedinOptimizeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    optimized = await optimize_linkedin_section(req.profile_section, req.content)
    return LinkedinOptimizeResponse(optimized=optimized)
