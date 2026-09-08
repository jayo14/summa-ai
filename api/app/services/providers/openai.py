"""OpenAI provider adapter — direct HTTP, no SDK dependency."""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

OPENAI_API_BASE = "https://api.openai.com/v1"
STREAM_TIMEOUT = httpx.Timeout(120.0, connect=10.0)
REQUEST_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


class OpenAIProvider:
    def __init__(self, api_key: str = "", model: str = ""):
        self._api_key = api_key
        self._model = model or "gpt-4o-mini"

    @property
    def name(self) -> str:
        return "openai"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        enable_thinking: bool = True,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        if not self._api_key:
            yield {"type": "error", "message": "OpenAI API key not configured"}
            return

        formatted = []
        if system_prompt:
            formatted.append({"role": "system", "content": system_prompt})
        formatted.extend(messages)

        try:
            async with httpx.AsyncClient(timeout=STREAM_TIMEOUT) as client:
                async with client.stream(
                    "POST",
                    f"{OPENAI_API_BASE}/chat/completions",
                    headers=self._headers(),
                    json={
                        "model": self._model,
                        "messages": formatted,
                        "stream": True,
                        "temperature": 0.7,
                        "max_tokens": 2048,
                    },
                ) as response:
                    if response.status_code != 200:
                        body = (await response.aread()).decode("utf-8", errors="ignore")
                        logger.warning("OpenAI API error %d: %s", response.status_code, body[:200])
                        if response.status_code == 429:
                            raise QuotaExhausted("OpenAI quota/rate limit exceeded")
                        yield {"type": "error", "message": f"OpenAI error {response.status_code}"}
                        return

                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        payload = line[6:].strip()
                        if not payload or payload == "[DONE]":
                            continue
                        try:
                            chunk = json.loads(payload)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content")
                            if content:
                                yield {"type": "content", "delta": content}
                        except json.JSONDecodeError:
                            continue

            yield {"type": "done"}

        except QuotaExhausted:
            raise
        except Exception as exc:
            logger.warning("OpenAI stream error: %s", exc)
            yield {"type": "error", "message": str(exc)}

    async def generate_json(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        json_schema: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        if not self._api_key:
            return None

        formatted = []
        if system_prompt:
            formatted.append({"role": "system", "content": system_prompt})
        formatted.extend(messages)

        body: Dict[str, Any] = {
            "model": self._model,
            "messages": formatted,
            "temperature": 0.7,
            "max_tokens": 4096,
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                res = await client.post(
                    f"{OPENAI_API_BASE}/chat/completions",
                    headers=self._headers(),
                    json=body,
                )
                if res.status_code != 200:
                    logger.warning("OpenAI JSON generation error %d: %s", res.status_code, res.text[:200])
                    if res.status_code == 429:
                        raise QuotaExhausted("OpenAI quota/rate limit exceeded")
                    return None
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        except QuotaExhausted:
            raise
        except Exception as exc:
            logger.warning("OpenAI JSON generation failed: %s", exc)
            return None

    async def health_check(self) -> bool:
        if not self._api_key:
            return False
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                res = await client.get(
                    f"{OPENAI_API_BASE}/models",
                    headers=self._headers(),
                )
                return res.status_code == 200
        except Exception:
            return False


class QuotaExhausted(Exception):
    """Raised when a provider's quota or rate limit is hit."""
    pass
