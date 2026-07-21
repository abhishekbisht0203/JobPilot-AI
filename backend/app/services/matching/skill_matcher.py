from typing import List

SKILL_SYNONYMS = {
    "javascript": ["js", "es6", "ecmascript"],
    "typescript": ["ts"],
    "python": ["python3"],
    "react": ["reactjs", "react.js"],
    "node.js": ["node", "nodejs", "express.js"],
    "machine learning": ["ml", "machinelearning"],
    "artificial intelligence": ["ai"],
}

def calculate_skill_match(resume_skills: List[str], job_skills: List[str]) -> float:
    if not job_skills:
        return 0.5
    
    resume_lower = [s.lower() for s in resume_skills]
    job_lower = [s.lower() for s in job_skills]
    
    matches = 0
    for job_skill in job_lower:
        if job_skill in resume_lower:
            matches += 1
            continue
        synonyms = SKILL_SYNONYMS.get(job_skill, [])
        if any(syn in resume_lower for syn in synonyms):
            matches += 1
            continue
    
    return matches / len(job_skills) if job_skills else 0.5

def calculate_experience_match(resume_years: int, required_years: int) -> float:
    if required_years == 0:
        return 1.0
    if resume_years >= required_years:
        return min(1.0, resume_years / (required_years * 1.5))
    return resume_years / required_years * 0.8

def calculate_overall_match(
    skill_score: float,
    experience_score: float = 0.8,
    ats_score: float = 0.7,
) -> float:
    return round((skill_score * 0.5 + experience_score * 0.25 + ats_score * 0.25) * 100, 1)
