from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel
from ..core.database import get_db
from ..core.deps import get_current_user

router = APIRouter()

BLOG_POSTS = [
    {"title": "10 Tips for Acing Your Virtual Interview", "excerpt": "Master the art of remote interviews with these proven strategies.", "author": "Sarah Chen", "read_time": "5 min", "tags": ["interview", "remote", "tips"], "type": "blog"},
    {"title": "How to Write a Resume That Gets Noticed", "excerpt": "Stand out from hundreds of applicants with these resume writing techniques.", "author": "Mike Johnson", "read_time": "8 min", "tags": ["resume", "career", "advice"], "type": "blog"},
    {"title": "The Future of AI in Recruitment", "excerpt": "How artificial intelligence is transforming the job search landscape.", "author": "Dr. Aisha Patel", "read_time": "6 min", "tags": ["ai", "recruitment", "future"], "type": "blog"},
    {"title": "Navigating Career Transitions Successfully", "excerpt": "A strategic approach to changing careers at any stage.", "author": "James Wilson", "read_time": "7 min", "tags": ["career", "transition", "strategy"], "type": "blog"},
    {"title": "Top Skills Employers Look for in 2026", "excerpt": "Stay ahead of the curve with these in-demand skills.", "author": "Emily Rodriguez", "read_time": "4 min", "tags": ["skills", "trends", "career"], "type": "blog"},
    {"title": "Building a Personal Brand on LinkedIn", "excerpt": "Establish yourself as a thought leader in your industry.", "author": "David Kim", "read_time": "6 min", "tags": ["linkedin", "branding", "networking"], "type": "blog"},
]

GUIDES = [
    {"title": "Complete Guide to Job Searching", "excerpt": "From application to offer - a comprehensive roadmap.", "read_time": "15 min", "steps": 8, "type": "guide"},
    {"title": "Mastering the Art of Networking", "excerpt": "Build meaningful professional relationships.", "read_time": "10 min", "steps": 6, "type": "guide"},
    {"title": "Salary Negotiation Playbook", "excerpt": "Never leave money on the table again.", "read_time": "12 min", "steps": 5, "type": "guide"},
    {"title": "Remote Work Success Guide", "excerpt": "Thrive in a remote work environment.", "read_time": "8 min", "steps": 7, "type": "guide"},
]

QUESTIONS = [
    {"question": "Tell me about yourself", "answer": "Structure your response around your current role, past experience, and why you're interested in this position.", "category": "behavioral"},
    {"question": "What are your greatest strengths?", "answer": "Choose strengths relevant to the role and back them with specific examples.", "category": "behavioral"},
    {"question": "What is your biggest weakness?", "answer": "Be honest but show how you're working to improve it.", "category": "behavioral"},
    {"question": "Why do you want to work here?", "answer": "Research the company and connect your skills to their mission.", "category": "behavioral"},
    {"question": "Describe a challenging situation and how you handled it", "answer": "Use the STAR method: Situation, Task, Action, Result.", "category": "behavioral"},
    {"question": "What is the difference between '==' and '===' in JavaScript?", "answer": "'==' checks value after type coercion, '===' checks both value and type without coercion.", "category": "technical"},
    {"question": "Explain RESTful APIs", "answer": "REST uses HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources identified by URLs.", "category": "technical"},
    {"question": "What is the time complexity of binary search?", "answer": "O(log n) - it divides the search space in half with each comparison.", "category": "technical"},
]

@router.get("")
async def list_resources(
    type: str = "",
    page: int = 1,
    per_page: int = 20,
):
    resources = BLOG_POSTS + GUIDES + QUESTIONS
    for i, r in enumerate(resources):
        r["id"] = str(i + 1)

    if type:
        resources = [r for r in resources if r.get("type") == type]

    total = len(resources)
    skip = (page - 1) * per_page
    paginated = resources[skip:skip + per_page]

    return {"data": paginated, "total": total, "page": page, "per_page": per_page}

@router.get("/{id}")
async def get_resource(id: str):
    all_resources = BLOG_POSTS + GUIDES + QUESTIONS
    for i, r in enumerate(all_resources):
        r["id"] = str(i + 1)

    try:
        idx = int(id) - 1
        if 0 <= idx < len(all_resources):
            return {"data": all_resources[idx]}
    except ValueError:
        pass
    raise HTTPException(status_code=404, detail="Resource not found")
