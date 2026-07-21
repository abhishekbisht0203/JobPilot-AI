from .client import ai_client

RESUME_SYSTEM_PROMPT = """You are an expert resume writer and ATS consultant. 
Rewrite resumes to maximize ATS score while keeping them truthful. 
Focus on: keyword alignment, quantifiable achievements, strong action verbs, role-appropriate formatting.
Output in plain text format ready for PDF export."""

async def optimize_resume(parsed_resume: str, job_description: str, target_role: str) -> str:
    prompt = f"""Rewrite this resume for a {target_role} position:

RESUME:
{parsed_resume}

JOB DESCRIPTION:
{job_description}

Return the optimized resume in plain text format."""
    
    return await ai_client.generate(prompt, RESUME_SYSTEM_PROMPT)

async def calculate_ats_score(parsed_resume: str, job_description: str) -> int:
    prompt = f"""Analyze this resume against the job description and return ONLY a number (0-100) representing the ATS match score.

RESUME:
{parsed_resume}

JOB DESCRIPTION:
{job_description}

ATS Score:"""
    
    result = await ai_client.generate(prompt, "You are an ATS scoring expert. Return only a number.", temperature=0.3)
    import re
    numbers = re.findall(r'\d+', result)
    if numbers:
        score = min(int(numbers[0]), 100)
        return max(score, 0)
    return 50
