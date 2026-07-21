from .client import ai_client

SYSTEM_PROMPT = """You are a career development expert. 
Analyze skill gaps and provide actionable recommendations for career growth."""

async def analyze_skill_gap(target_role: str, current_skills: list[str]) -> dict:
    skills_str = ", ".join(current_skills)
    prompt = f"""Analyze the skill gap for someone targeting a {target_role} role.

Current skills: {skills_str}

Return a JSON object with:
1. current_skills: list of current skills that are relevant
2. missing_skills: list of important missing skills
3. recommendations: list of specific learning recommendations

Return ONLY valid JSON."""
    
    result = await ai_client.generate(prompt, SYSTEM_PROMPT, temperature=0.3)
    import json
    import re
    
    json_match = re.search(r'\{.*\}', result, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    
    return {
        "current_skills": current_skills,
        "missing_skills": [],
        "recommendations": ["Unable to analyze skill gap at this time."],
    }
