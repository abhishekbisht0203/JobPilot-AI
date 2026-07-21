from .client import ai_client

SYSTEM_PROMPT = """You are a LinkedIn profile optimization expert. 
Improve profile sections to make them more engaging, professional, and keyword-rich 
for better visibility in recruiter searches."""

async def optimize_linkedin_section(section: str, content: str) -> str:
    prompt = f"""Optimize this LinkedIn {section} section. Make it more impactful and keyword-rich.

Current {section}:
{content}"""
    
    return await ai_client.generate(prompt, SYSTEM_PROMPT)
