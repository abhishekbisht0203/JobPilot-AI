from ..ai.client import ai_client

async def score_resume(parsed_text: str, job_description: str) -> int:
    prompt = f"""Analyze this resume against the job description and return ONLY a number between 0-100.

RESUME:
{parsed_text[:8000]}

JOB DESCRIPTION:
{job_description[:4000]}

Score:"""
    
    result = await ai_client.generate(prompt, "You are an ATS scoring system. Return only a number.", temperature=0.2)
    import re
    numbers = re.findall(r'\d+', result)
    if numbers:
        score = min(int(numbers[0]), 100)
        return max(score, 0)
    return 50
