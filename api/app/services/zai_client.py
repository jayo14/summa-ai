"""Single shared Z.ai (GLM) HTTP client — used to be constructed independently
in chat.py (streaming) and summastudy_memory.py (non-streaming fact extraction),
each with its own ad-hoc timeout. Two call shapes are genuinely different
(long-lived SSE stream vs. a quick blocking completion), so this module keeps
two deliberately-named timeout policies rather than merging them into one.
"""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx

try:
    import instructor
    from openai import AsyncOpenAI
    _has_instructor = True
except ImportError:
    instructor = None
    AsyncOpenAI = None
    _has_instructor = False

from app.config import settings

logger = logging.getLogger(__name__)

# Streaming chat responses can run long (thinking + generation); fail fast on
# connect, tolerate a long read.
STREAM_TIMEOUT = httpx.Timeout(120.0, connect=10.0)

# Non-streaming calls (fact extraction, structured generation) should return
# quickly or not at all.
REQUEST_TIMEOUT = httpx.Timeout(30.0, connect=10.0)

_instructor_client: Any = None


def get_instructor_client() -> Any:
    global _instructor_client
    if not _has_instructor:
        raise RuntimeError("instructor or openai library is not installed in current environment")
    if _instructor_client is None:
        raw_client = AsyncOpenAI(
            api_key=settings.ZAI_API_KEY,
            base_url=settings.ZAI_API_BASE,
            timeout=REQUEST_TIMEOUT,
            default_headers={
                "X-Z-AI-From": "Z",
                "X-Token": settings.ZAI_TOKEN,
                "X-User-Id": settings.ZAI_USER_ID,
            },
        )
        _instructor_client = instructor.from_openai(
            raw_client, mode=instructor.Mode.JSON
        )
    return _instructor_client


def _headers() -> Dict[str, str]:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.ZAI_API_KEY}",
        "X-Z-AI-From": "Z",
        "X-Token": settings.ZAI_TOKEN,
        "X-User-Id": settings.ZAI_USER_ID,
    }


async def stream_completion(
    messages: List[Dict[str, str]],
    system_prompt: str,
    enable_thinking: bool = True,
) -> AsyncGenerator[Dict[str, Any], None]:
    """Yields {"type": "thinking"|"content", "delta": str} chunks, then
    {"type": "done"}, or {"type": "error", "message": str} on failure.
    Caller owns SSE framing.
    """
    try:
        async with httpx.AsyncClient(timeout=STREAM_TIMEOUT) as client:
            async with client.stream(
                "POST",
                f"{settings.ZAI_API_BASE}/chat/completions",
                headers=_headers(),
                json={
                    "model": settings.ZAI_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        *messages,
                    ],
                    "stream": True,
                    "thinking": {"type": "enabled" if enable_thinking else "disabled"},
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    payload = line[6:].strip()
                    if not payload or payload == "[DONE]":
                        continue
                    try:
                        chunk = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    reasoning = (
                        delta.get("reasoning_content")
                        or delta.get("reasoning")
                        or delta.get("thinking")
                    )
                    content = delta.get("content")
                    if reasoning:
                        yield {"type": "thinking", "delta": reasoning}
                    if content:
                        yield {"type": "content", "delta": content}
        yield {"type": "done"}
    except Exception as e:
        error_msg = str(e) or "Z.ai stream failed"
        logger.error("Z.ai stream failed: %s", error_msg)
        yield {"type": "error", "message": error_msg}


async def call_zai_completion(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.2,
    max_tokens: int = 500,
) -> str:
    """Non-streaming completion. Raises on HTTP/network failure — caller decides
    the fallback (never swallow silently)."""
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        resp = await client.post(
            f"{settings.ZAI_API_BASE}/chat/completions",
            headers=_headers(),
            json={
                "model": settings.ZAI_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "stream": False,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
