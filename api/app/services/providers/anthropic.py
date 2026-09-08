"""Anthropic (Claude) provider adapter — direct HTTP, no SDK dependency."""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

ANTHROPIC_API_BASE = "https://api.anthropic.com/v1"
STREAM_TIMEOUT = httpx.Timeout(120.0, connect=10.0)
REQUEST_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


class AnthropicProvider:
    def __init__(self, api_key: str = "", model: str = ""):
        self._api_key = api_key
        self._model = model or "claude-sonnet-4-20250514"

    @property
    def name(self) -> str:
        return "anthropic"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    def _headers(self) -> Dict[str, str]:
        return {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        enable_thinking: bool = True,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        if not self._api_key:
            yield {"type": "error", "message": "Anthropic API key not configured"}
            return

        # Anthropic uses separate system param, not in messages
        formatted = []
        for msg in messages:
            role = msg.get("role", "user")
            if role in ("assistant", "summa"):
                formatted.append({"role": "assistant", "content": msg.get("content", "")})
            else:
                formatted.append({"role": "user", "content": msg.get("content", "")})

        body: Dict[str, Any] = {
            "model": self._model,
            "messages": formatted,
            "max_tokens": 2048,
            "stream": True,
        }
        if system_prompt:
            body["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=STREAM_TIMEOUT) as client:
                async with client.stream(
                    "POST",
                    f"{ANTHROPIC_API_BASE}/messages",
                    headers=self._headers(),
                    json=body,
                ) as response:
                    if response.status_code != 200:
                        raw = (await response.aread()).decode("utf-8", errors="ignore")
                        logger.warning("Anthropic API error %d: %s", response.status_code, raw[:200])
                        if response.status_code == 429:
                            raise QuotaExhausted("Anthropic rate limit exceeded")
                        yield {"type": "error", "message": f"Anthropic error {response.status_code}"}
                        return

                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        payload = line[6:].strip()
                        if not payload:
                            continue
                        try:
                            event = json.loads(payload)
                            evt_type = event.get("type", "")
                            if evt_type == "content_block_delta":
                                delta = event.get("delta", {})
                                text = delta.get("text", "")
                                if text:
                                    yield {"type": "content", "delta": text}
                            elif evt_type == "message_stop":
                                break
                        except json.JSONDecodeError:
                            continue

            yield {"type": "done"}

        except QuotaExhausted:
            raise
        except Exception as exc:
            logger.warning("Anthropic stream error: %s", exc)
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
        for msg in messages:
            role = msg.get("role", "user")
            if role in ("assistant", "summa"):
                formatted.append({"role": "assistant", "content": msg.get("content", "")})
            else:
                formatted.append({"role": "user", "content": msg.get("content", "")})

        # Anthropic doesn't have native JSON mode; we instruct via system prompt
        json_instruction = "\n\nRespond ONLY with valid JSON. No markdown, no explanation."
        sys = (system_prompt or "") + json_instruction

        body: Dict[str, Any] = {
            "model": self._model,
            "messages": formatted,
            "max_tokens": 4096,
            "system": sys,
        }

        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                res = await client.post(
                    f"{ANTHROPIC_API_BASE}/messages",
                    headers=self._headers(),
                    json=body,
                )
                if res.status_code != 200:
                    logger.warning("Anthropic JSON error %d: %s", res.status_code, res.text[:200])
                    if res.status_code == 429:
                        raise QuotaExhausted("Anthropic rate limit exceeded")
                    return None
                data = res.json()
                content = data.get("content", [{}])[0].get("text", "")
                # Strip markdown fences if present
                if content.startswith("```"):
                    import re
                    content = re.sub(r"^```(?:json)?\n?", "", content, flags=re.I)
                    content = re.sub(r"\n?```$", "", content)
                return json.loads(content.strip())
        except QuotaExhausted:
            raise
        except Exception as exc:
            logger.warning("Anthropic JSON generation failed: %s", exc)
            return None

    async def health_check(self) -> bool:
        if not self._api_key:
            return False
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                res = await client.get(
                    f"{ANTHROPIC_API_BASE}/models",
                    headers=self._headers(),
                )
                # Anthropic returns 200 for models list
                return res.status_code == 200
        except Exception:
            return False


class QuotaExhausted(Exception):
    """Raised when a provider's quota or rate limit is hit."""
    pass
