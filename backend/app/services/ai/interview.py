from .client import ai_client

SYSTEM_PROMPT = """You are an expert technical interviewer. 
Generate relevant interview questions based on job descriptions.
Questions should test both technical skills and cultural fit."""

async def generate_interview_questions(job_description: str) -> list[str]:
    prompt = f"""Generate 5 interview questions for this job description.
Return as a numbered list.

JOB DESCRIPTION:
{job_description}"""
    
    result = await ai_client.generate(prompt, SYSTEM_PROMPT)
    questions = []
    for line in result.strip().split("\n"):
        line = line.strip()
        if line and (line[0].isdigit() or line.startswith("-")):
            question = line.split(".", 1)[-1].strip() if "." in line[:3] else line
            questions.append(question)
    return questions[:5]
