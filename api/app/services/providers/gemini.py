"""Gemini (Google AI) provider adapter — wraps google_ai.py."""

from __future__ import annotations

import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

from app.services import google_ai

logger = logging.getLogger(__name__)


class GeminiProvider:
    def __init__(self, api_key: str = "", model: str = ""):
        self._api_key = api_key or google_ai.settings.GEMINI_API_KEY
        self._model = model or google_ai.settings.GEMINI_MODEL

    @property
    def name(self) -> str:
        return "gemini"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        enable_thinking: bool = True,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        async for chunk in google_ai.stream_gemini_completion(messages, system_prompt):
            yield chunk

    async def generate_json(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        json_schema: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        return await google_ai.generate_gemini_json(messages, system_prompt, json_schema)

    async def health_check(self) -> bool:
        return self.is_configured
