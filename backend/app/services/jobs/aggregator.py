import httpx
from datetime import datetime, timezone
from typing import List, Optional
import asyncio
import re

async def fetch_remoteok_jobs() -> List[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://remoteok.com/api", timeout=15)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    jobs = []
                    for item in data[1:]:
                        if isinstance(item, dict):
                            jobs.append({
                                "title": item.get("position", ""),
                                "company": item.get("company", ""),
                                "platform": "RemoteOK",
                                "url": f"https://remoteok.com/{item.get('slug', '')}",
                                "description": strip_html(item.get("description", "")),
                                "skills": extract_skills(item.get("description", "")),
                                "location": "Remote",
                                "posted_at": parse_date(item.get("date")),
                            })
                    return jobs
    except Exception as e:
        print(f"RemoteOK fetch error: {e}")
    return []

async def fetch_wwr_jobs() -> List[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://weworkremotely.com/api/v1/jobs", timeout=15)
            if response.status_code == 200:
                data = response.json()
                jobs = []
                for item in data.get("jobs", []):
                    jobs.append({
                        "title": item.get("title", ""),
                        "company": item.get("company_name", ""),
                        "platform": "WeWorkRemotely",
                        "url": item.get("url", ""),
                        "description": item.get("description", ""),
                        "skills": extract_skills(item.get("description", "")),
                        "location": item.get("region", "Remote"),
                        "posted_at": parse_date(item.get("published_at")),
                    })
                return jobs
    except Exception as e:
        print(f"WWR fetch error: {e}")
    return []

async def fetch_ycombinator_jobs() -> List[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://jobs.ycombinator.com/api/v1/jobs", timeout=15)
            if response.status_code == 200:
                data = response.json()
                jobs = []
                for item in data.get("jobs", []):
                    jobs.append({
                        "title": item.get("title", ""),
                        "company": item.get("company", {}).get("name", ""),
                        "platform": "Y Combinator",
                        "url": item.get("url", ""),
                        "description": item.get("description", ""),
                        "skills": extract_skills(item.get("description", "")),
                        "location": item.get("location", "Remote"),
                        "posted_at": parse_date(item.get("created_at")),
                    })
                return jobs
    except Exception as e:
        print(f"YC fetch error: {e}")
    return []

async def aggregate_all_jobs() -> list:
    results = await asyncio.gather(
        fetch_remoteok_jobs(),
        fetch_wwr_jobs(),
        fetch_ycombinator_jobs(),
        return_exceptions=True,
    )
    all_jobs = []
    for result in results:
        if isinstance(result, list):
            all_jobs.extend(result)
    return all_jobs

def strip_html(text: str) -> str:
    clean = re.compile("<.*?>")
    return re.sub(clean, "", text)[:5000]

def extract_skills(text: str) -> list:
    skills_list = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "Go", "Rust",
        "AWS", "Docker", "Kubernetes", "SQL", "PostgreSQL", "MongoDB", "Redis",
        "Machine Learning", "AI", "Deep Learning", "NLP", "Computer Vision",
        "TensorFlow", "PyTorch", "FastAPI", "Django", "Flask", "GraphQL",
        "REST API", "CI/CD", "Terraform", "Linux", "Git", "Agile", "Scrum",
        "Java", "C++", "C#", ".NET", "Ruby", "Rails", "PHP", "Swift", "Kotlin",
        "Android", "iOS", "React Native", "Flutter", "Vue.js", "Angular",
        "HTML", "CSS", "SASS", "Tailwind", "Figma", "UI/UX", "DevOps",
        "Data Science", "Data Engineering", "Blockchain", "Solidity",
    ]
    found = []
    text_lower = text.lower()
    for skill in skills_list:
        if skill.lower() in text_lower:
            found.append(skill)
    return found[:10]

def parse_date(date_str) -> Optional[datetime]:
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except:
        return datetime.now(timezone.utc)
