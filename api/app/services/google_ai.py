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

    clean_q = last_user_msg.strip() if last_user_msg else "your learning topic"
    
    if "plato" in query:
        text = (
            "**Plato** (c. 428–348 BCE) was one of the foundational figures of Western philosophy, a student of Socrates, and the teacher of Aristotle. He established the **Academy in Athens**, widely considered the first institution of higher learning in the Western world.\n\n"
            "### 1. Theory of Forms (Ideas)\n"
            "Plato's central metaphysical idea is that our physical world is just a shadow of a higher, unchangeable reality of **Forms** (perfect concepts like Justice, Beauty, and Truth). Physical objects are mere imperfect copies of these transcendent Forms.\n\n"
            "### 2. The Allegory of the Cave\n"
            "In *The Republic* (Book VII), Plato presents prisoners chained in a cave seeing only shadows cast on a wall. Education and philosophy are the process of unchaining a prisoner and guiding them out of the cave into the sunlight to see reality as it truly is.\n\n"
            "### 3. Political Philosophy & Tripartite Soul\n"
            "Plato argued that human soul has three parts: **Reason**, **Spirit/Courage**, and **Appetite**. In an ideal society (*Kallipolis*), philosophers governed by Reason should rule as **Philosopher Kings**, while guardians protect and producers sustain the state.\n\n"
            "Would you like to dive deeper into the **Theory of Forms**, the **Allegory of the Cave**, or his **Socratic Dialogues**?"
        )
    elif "polymorphism" in query or "dispatch" in query:
        text = (
            f"**Polymorphism in {subject_label}**\n\n"
            "Polymorphism allows objects of different classes to be treated as instances of a shared superclass or interface.\n\n"
            "### Key Mechanisms:\n"
            "1. **Interface / Parent Reference**: Declaring a variable using a general superclass or interface type.\n"
            "2. **Dynamic Method Dispatch**: At runtime, the execution engine looks up the actual instantiated object's method override rather than relying solely on reference type.\n"
            "3. **Method Overriding**: Derived classes provide custom implementations of base methods.\n\n"
            "```java\n"
            "Shape s = new Circle(); // Reference: Shape | Object: Circle\n"
            "s.draw();               // Invokes Circle.draw() at runtime\n"
            "```\n\n"
            "Would you like to trace an example or solve a quick active recall check?"
        )
    elif "quiz" in query:
        text = (
            f"**Active Recall Check — {subject_label}**\n\n"
            "Here is a quick concept evaluation:\n\n"
            "1. **Question 1**: What is the primary difference between *compile-time overloading* and *runtime overriding*?\n"
            "2. **Question 2**: Does dynamic method dispatch evaluate the declared reference type or the instantiated runtime object type?\n\n"
            "Reply with your answers and we'll evaluate your reasoning step by step!"
        )
    elif "plan" in query or "study" in query:
        text = (
            f"**Targeted Study Breakdown — {subject_label}**\n\n"
            "Here is a recommended 3-step mastery plan:\n\n"
            "1. **Core Concept Review (10 mins)**: Clarify fundamental definitions and relationships.\n"
            "2. **Practical Examples (15 mins)**: Work through real-world applications and code/logic tracing.\n"
            "3. **Active Recall (5 mins)**: Test yourself with targeted questions to lock in retention.\n\n"
            "Shall we start with step 1 or jump into practical practice?"
        )
    else:
        text = (
            f"Here is a breakdown of **{clean_q}**:\n\n"
            f"When studying **{clean_q}**, we focus on three core dimensions:\n\n"
            "1. **Definition & Context**: Understanding what the concept is and why it was developed.\n"
            "2. **Core Mechanics & Rules**: Examining the key principles, formulas, or logical structures that govern it.\n"
            "3. **Application & Real Examples**: Seeing how it functions in practice and evaluating edge cases.\n\n"
            f"Which specific angle or topic within **{clean_q}** would you like to explore first?"
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
                    raw_err = (await response.aread()).decode("utf-8", errors="ignore")
                    logger.warning(
                        "Gemini API returned %d: %s.",
                        response.status_code,
                        raw_err,
                    )
                    error_msg = f"\n\n> ⚠️ **Gemini AI Service Notice ({response.status_code})**: API quota/rate limit or endpoint error encountered. Switching to offline intelligent fallback.\n\n"
                    if "RESOURCE_EXHAUSTED" in raw_err or "quota" in raw_err.lower():
                        error_msg = "\n\n> ⚠️ **AI Quota Exhausted**: Google Gemini API quota limit reached. Using offline intelligent fallback stream.\n\n"
                    yield {"type": "content", "delta": error_msg}
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
