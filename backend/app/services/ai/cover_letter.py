from .client import ai_client

SYSTEM_PROMPT = """You are an expert cover letter writer. 
Write professional, tailored cover letters that highlight relevant experience. 
Keep to 3 paragraphs. Be concise and impactful."""

async def generate_cover_letter(
    resume_text: str,
    job_description: str,
    company: str,
    job_title: str,
    tone: str = "professional",
) -> str:
    prompt = f"""Write a {tone} cover letter for {company} for the role of {job_title}.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}"""
    
    return await ai_client.generate(prompt, SYSTEM_PROMPT)
