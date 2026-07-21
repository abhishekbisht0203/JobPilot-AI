import os
from typing import Optional
from openai import AsyncOpenAI
import google.generativeai as genai
from anthropic import AsyncAnthropic
from ...core.config import settings

class AIClient:
    def __init__(self, provider: str = "openai"):
        self.provider = provider
        self.openai_client = None
        self.gemini_client = None
        self.anthropic_client = None
        self._init_clients()

    def _init_clients(self):
        if settings.OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.gemini_client = genai
        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def generate(self, prompt: str, system: str = "", temperature: float = 0.7) -> str:
        if self.provider == "openai" and self.openai_client:
            return await self._openai(prompt, system, temperature)
        elif self.provider == "gemini" and self.gemini_client:
            return await self._gemini(prompt)
        elif self.provider == "anthropic" and self.anthropic_client:
            return await self._anthropic(prompt, system, temperature)
        else:
            return await self._openai(prompt, system, temperature)

    async def _openai(self, prompt: str, system: str, temperature: float) -> str:
        if not self.openai_client:
            return "OpenAI client not configured."
        response = await self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
        )
        return response.choices[0].message.content or ""

    async def _gemini(self, prompt: str) -> str:
        if not self.gemini_client:
            return "Gemini client not configured."
        model = self.gemini_client.GenerativeModel("gemini-1.5-pro")
        response = await model.generate_content_async(prompt)
        return response.text

    async def _anthropic(self, prompt: str, system: str, temperature: float) -> str:
        if not self.anthropic_client:
            return "Anthropic client not configured."
        response = await self.anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            system=system,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=4096,
        )
        return response.content[0].text if response.content else ""

ai_client = AIClient()
