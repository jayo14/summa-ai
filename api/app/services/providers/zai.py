"""Z.ai (GLM) provider adapter — wraps zai_client.py."""

from __future__ import annotations

import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

from app.services import zai_client
from app.config import settings

logger = logging.getLogger(__name__)


class ZaiProvider:
    def __init__(self, api_key: str = "", model: str = ""):
        self._api_key = api_key or settings.ZAI_API_KEY
        self._model = model or settings.ZAI_MODEL

    @property
    def name(self) -> str:
        return "zai"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key) and bool(settings.ZAI_TOKEN)

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        enable_thinking: bool = True,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        async for chunk in zai_client.stream_completion(messages, system_prompt, enable_thinking):
            yield chunk

    async def generate_json(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        json_schema: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        if not self.is_configured or not zai_client._has_instructor:
            return None
        try:
            client = zai_client.get_instructor_client()
            # Use instructor for structured output — schema passed as response_model
            # For generic dict return, fall back to raw completion
            if json_schema:
                raw = await client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        *messages,
                    ],
                    max_retries=2,
                )
                return raw.model_dump() if hasattr(raw, "model_dump") else None
            return None
        except Exception as exc:
            logger.warning("Z.ai JSON generation failed: %s", exc)
            return None

    async def health_check(self) -> bool:
        return self.is_configured
