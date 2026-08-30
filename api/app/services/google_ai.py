"""Google AI (Gemini) API Service — provides direct streaming & completion support
using Google AI REST/SDK endpoint with fallback and multi-turn context support.
"""

import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

GEMINI_STREAM_TIMEOUT = httpx.Timeout(120.0, connect=10.0)
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


def is_gemini_configured() -> bool:
    return bool(settings.GEMINI_API_KEY)


def _format_messages_for_gemini(
    messages: List[Dict[str, str]], system_prompt: Optional[str] = None
) -> Dict[str, Any]:
    contents = []
    for msg in messages:
        role = msg.get("role", "user")
        # Gemini expects "user" or "model"
        gemini_role = "model" if role in ("assistant", "summa", "model") else "user"
        contents.append({
            "role": gemini_role,
            "parts": [{"text": msg.get("content", "")}]
        })

    payload: Dict[str, Any] = {"contents": contents}
    if system_prompt:
        payload["systemInstruction"] = {
            "parts": [{"text": system_prompt}]
        }
    payload["generationConfig"] = {
        "temperature": 0.7,
        "maxOutputTokens": 2048,
    }
    return payload


async def stream_gemini_completion(
    messages: List[Dict[str, str]],
    system_prompt: str = "",
) -> AsyncGenerator[Dict[str, Any], None]:
    """Yields {"type": "content", "delta": str} chunks, then {"type": "done"},
    or {"type": "error", "message": str} on failure.
    """
    if not settings.GEMINI_API_KEY:
        yield {"type": "error", "message": "GEMINI_API_KEY is not configured"}
        return

    url = f"{GEMINI_API_BASE}/models/{settings.GEMINI_MODEL}:streamGenerateContent?alt=sse&key={settings.GEMINI_API_KEY}"
    payload = _format_messages_for_gemini(messages, system_prompt)

    try:
        async with httpx.AsyncClient(timeout=GEMINI_STREAM_TIMEOUT) as client:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error("Gemini API error (%d): %s", response.status_code, error_text.decode("utf-8", errors="ignore"))
                    yield {"type": "error", "message": f"Google AI error ({response.status_code})"}
                    return

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data_str = line[6:].strip()
                    if not data_str:
                        continue
                    try:
                        data = json.loads(data_str)
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            for part in parts:
                                text_chunk = part.get("text", "")
                                if text_chunk:
                                    yield {"type": "content", "delta": text_chunk}
                    except Exception as parse_err:
                        logger.debug("Failed to parse Gemini chunk: %s", parse_err)

        yield {"type": "done"}

    except Exception as exc:
        logger.error("Gemini streaming exception: %s", exc, exc_info=True)
        yield {"type": "error", "message": str(exc)}
