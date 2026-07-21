from .client import ai_client

SYSTEM_PROMPT = """You are an expert at writing cold emails to recruiters.
Keep emails concise (150 words max), professional, with a clear call to action.
Personalize based on available information."""

async def generate_cold_email(
    resume_text: str,
    company: str,
    job_title: str,
    recruiter_name: str = "",
) -> dict:
    greeting = f"Dear {recruiter_name}," if recruiter_name else "Dear Hiring Team,"
    
    prompt = f"""Write a cold email to a recruiter at {company} about the {job_title} position.
Greeting: {greeting}

RESUME:
{resume_text}

Generate subject line and email body. Return as:
SUBJECT: <subject>
BODY: <body>"""
    
    result = await ai_client.generate(prompt, SYSTEM_PROMPT)
    
    lines = result.split("\n")
    subject = ""
    body_lines = []
    in_body = False
    
    for line in lines:
        if line.upper().startswith("SUBJECT:"):
            subject = line.replace("SUBJECT:", "", 1).strip()
        elif line.upper().startswith("BODY:"):
            in_body = True
            body_lines.append(line.replace("BODY:", "", 1).strip())
        elif in_body:
            body_lines.append(line)
    
    return {
        "subject": subject or f"Application for {job_title} position at {company}",
        "body": "\n".join(body_lines).strip(),
    }
