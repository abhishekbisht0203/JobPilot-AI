from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from ..core.database import get_db
from ..core.deps import get_current_user
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
    user: dict = Depends(get_current_user),
):
    questions = await generate_interview_questions(req.job_description)

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": str(user["_id"]),
        "job_id": req.job_id,
        "questions": questions,
        "answers": [],
        "scores": [],
        "overall_score": 0.0,
        "created_at": now,
    }
    await get_db().mock_interviews.insert_one(doc)

    return MockInterviewResponse(questions=questions)

@router.post("/skill-gap", response_model=SkillGapResponse)
async def analyze_skills(
    req: SkillGapRequest,
    user: dict = Depends(get_current_user),
):
    result = await analyze_skill_gap(req.target_role, req.current_skills)

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": str(user["_id"]),
        "target_role": req.target_role,
        "current_skills": result.get("current_skills", req.current_skills),
        "missing_skills": result.get("missing_skills", []),
        "recommendations": result.get("recommendations", []),
        "created_at": now,
    }
    await get_db().skill_gap_analyses.insert_one(doc)

    return SkillGapResponse(
        current_skills=result.get("current_skills", req.current_skills),
        missing_skills=result.get("missing_skills", []),
        recommendations=result.get("recommendations", []),
    )

@router.post("/linkedin-optimize", response_model=LinkedinOptimizeResponse)
async def optimize_linkedin(
    req: LinkedinOptimizeRequest,
    user: dict = Depends(get_current_user),
):
    optimized = await optimize_linkedin_section(req.profile_section, req.content)
    return LinkedinOptimizeResponse(optimized=optimized)
