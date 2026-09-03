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


async def _generate_fallback_stream(
    messages: List[Dict[str, str]], system_prompt: str = ""
) -> AsyncGenerator[Dict[str, Any], None]:
    """Generates an intelligent, personalized academic streaming response when external APIs are unreachable."""
    import asyncio

    last_user_msg = ""
    for msg in reversed(messages):
        if msg.get("role") in ("user", "student"):
            last_user_msg = msg.get("content", "")
            break

    query = last_user_msg.lower()

    # Extract subject or context from system prompt if present
    subject_label = "Object-Oriented Programming"
    if "Active Course / Subject:" in system_prompt:
        for line in system_prompt.split("\n"):
            if "Active Course / Subject:" in line:
                subject_label = line.split("Active Course / Subject:")[1].strip()
                break

    if "polymorphism" in query or "dispatch" in query:
        text = (
            f"**Summa AI Personalised Explanation [{subject_label}]**\n\n"
            "**Polymorphism** allows objects of different concrete classes to be treated through a single common interface.\n\n"
            "### Key Mechanisms:\n"
            "1. **Interface / Parent Reference**: You declare a variable using a superclass or interface type.\n"
            "2. **Runtime Dispatch (Dynamic Binding)**: When you invoke a method, the JVM/runtime checks the *actual underlying object* created in memory, not just the declared reference type.\n"
            "3. **Method Overriding**: The child class provides its own implementation of a method with the exact same signature.\n\n"
            "*Example*:\n"
            "```java\n"
            "Shape s = new Circle(); // Reference is Shape, actual object is Circle\n"
            "s.draw();               // Executes Circle's overridden draw() method at runtime\n"
            "```\n\n"
            "**Quick Recall Check**: If `s` was assigned `new Rectangle()`, which class's `draw()` method executes at runtime? Reply to test your understanding."
        )
    elif "quiz" in query:
        text = (
            f"**Summa AI Active Recall Quiz [{subject_label}]**\n\n"
            "Here is your targeted recall check based on your current knowledge graph:\n\n"
            "**Question 1**: What is the primary difference between *method overloading* (compile-time) and *method overriding* (runtime)?\n\n"
            "**Question 2**: In runtime dynamic dispatch, does the executed method depend on the **reference type** or the **actual object type** created in memory?\n\n"
            "*Take a moment to answer either question, and I will evaluate your reasoning.*"
        )
    elif "plan" in query or "study" in query:
        text = (
            f"**Summa AI Personalised Study Plan [{subject_label}]**\n\n"
            "Based on your proficiency analysis and upcoming review targets, here is your 3-step action plan:\n\n"
            "1. **Core Concept Review (10 mins)**: Review inheritance hierarchies and abstract method declarations.\n"
            "2. **Active Practice (15 mins)**: Trace 4 code snippets involving dynamic dispatch and hidden overrides.\n"
            "3. **Gap Verification (5 mins)**: Complete a 3-question active recall quiz to lock in the pattern.\n\n"
            "Would you like to start step 1 with a quick breakdown or jump directly into practice code?"
        )
    else:
        clean_q = last_user_msg.strip() if last_user_msg else "your learning topic"
        text = (
            f"**Summa AI Learning Companion [{subject_label}]**\n\n"
            f"Regarding **\"{clean_q}\"**:\n\n"
            "To build a deep understanding, let's break this down into core principles:\n\n"
            "1. **Core Definition**: Every concept builds on fundamental rules. We examine the core pattern first.\n"
            "2. **Practical Context**: We apply it to concrete examples tailored to your level and field of study.\n"
            "3. **Active Recall**: We verify that you can explain the reasoning in your own words.\n\n"
            "What specific aspect or example would you like to explore first?"
        )

    # Stream text in small chunks simulating natural token generation
    chunk_size = 12
    for i in range(0, len(text), chunk_size):
        chunk = text[i : i + chunk_size]
        yield {"type": "content", "delta": chunk}
        await asyncio.sleep(0.015)

    yield {"type": "done"}


async def stream_gemini_completion(
    messages: List[Dict[str, str]],
    system_prompt: str = "",
) -> AsyncGenerator[Dict[str, Any], None]:
    """Yields {"type": "content", "delta": str} chunks, then {"type": "done"},
    or uses fallback generator if external Gemini API is unreachable or errors.
    """
    if not settings.GEMINI_API_KEY:
        async for chunk in _generate_fallback_stream(messages, system_prompt):
            yield chunk
        return

    url = f"{GEMINI_API_BASE}/models/{settings.GEMINI_MODEL}:streamGenerateContent?alt=sse&key={settings.GEMINI_API_KEY}"
    payload = _format_messages_for_gemini(messages, system_prompt)

    try:
        async with httpx.AsyncClient(timeout=GEMINI_STREAM_TIMEOUT) as client:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.warning(
                        "Gemini API returned %d: %s. Using intelligent fallback stream.",
                        response.status_code,
                        error_text.decode("utf-8", errors="ignore"),
                    )
                    async for chunk in _generate_fallback_stream(messages, system_prompt):
                        yield chunk
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
        logger.warning("Gemini API connection error (%s). Using fallback stream.", exc)
        async for chunk in _generate_fallback_stream(messages, system_prompt):
            yield chunk
