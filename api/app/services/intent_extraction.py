"""Structured user intent extraction for the learning pipeline.

Converts a raw user message (plus any explicit ChatRequest fields like
``subject`` and ``proficiency_level``) into a structured ``UserIntent`` that
the LearningOrchestrator uses to decide the next action.

This replaces the previous keyword-only ``detect_intent`` approach with a
model that captures subject, topic, activity, difficulty, and goal — so the
system can never silently switch domains (e.g. Philosophy -> Java).
"""

from __future__ import annotations

import re
from typing import List, Optional

from pydantic import BaseModel, Field


KNOWN_SUBJECTS = [
    "philosophy", "mathematics", "physics", "chemistry", "biology",
    "history", "literature", "programming", "economics", "psychology",
    "statistics", "computer science", "english", "spanish", "french",
    "german", "art", "music", "geography", "astronomy", "medicine",
    "law", "engineering", "data science", "calculus", "algebra",
    "stoicism", "kant", "plato", "ethics", "logic", "politics",
]

ACTIVITY_MAP = {
    "quiz": "quiz",
    "test": "quiz",
    "exam": "quiz",
    "question": "quiz",
    "questions": "quiz",
    "flashcard": "flashcards",
    "flash card": "flashcards",
    "flashcards": "flashcards",
    "card": "flashcards",
}

DIFFICULTY_MAP = {
    "easy": "easy",
    "simple": "easy",
    "beginner": "easy",
    "medium": "medium",
    "intermediate": "medium",
    "hard": "hard",
    "difficult": "hard",
    "advanced": "hard",
}


class UserIntent(BaseModel):
    """Structured representation of what the user is asking for."""

    intent: str = Field(
        default="general",
        description="Primary learning activity intent: quiz, flashcards, study-plan, teach, recall, practice, explain, assess",
    )
    activity_request: Optional[str] = Field(
        default=None,
        description="The named activity the user explicitly requested (e.g. 'quiz', 'flashcards', 'study plan')",
    )
    subject: Optional[str] = Field(
        default=None,
        description="The explicit subject the user mentioned (e.g. 'Philosophy', 'Physics'). Must come from ChatRequest.subject or the query.",
    )
    topic: Optional[str] = Field(
        default=None,
        description="A narrower subtopic within the subject (e.g. 'Stoicism', 'Kant's categorical imperative').",
    )
    learning_goal: Optional[str] = Field(
        default=None,
        description="The user's stated learning objective (e.g. 'assessment', 'understanding', 'review')",
    )
    difficulty_preference: Optional[str] = Field(
        default=None,
        description="Preferred difficulty: easy, medium, hard, or null",
    )
    question_count: Optional[int] = Field(
        default=None,
        description="Number of questions or items requested, if explicitly stated",
    )
    raw_query: str = Field(default="", description="The original user message")
    detected_subject_from_query: Optional[str] = Field(
        default=None,
        description="Subject extracted from the query text itself, if any",
    )


_SUBJECT_PATTERNS = [
    re.compile(r"\b(philosophy|philosophical)\b", re.I),
    re.compile(r"\b(plato|kant|aristotle|necksche|stoicism|stoic|epicurus|socrates)\b", re.I),
    re.compile(r"\b(microeconomics|macroeconomics|econometrics)\b", re.I),
    re.compile(r"\b(calculus|derivative|integral|algebra|geometry|statistics)\b", re.I),
    re.compile(r"\b(physics|mechanics|thermodynamics|quantum|relativity)\b", re.I),
    re.compile(r"\b(chemistry|organic|stoichiometry|atom)\b", re.I),
    re.compile(r"\b(biology|biology|genetics|anatomy|physiology)\b", re.I),
    re.compile(r"\b(history|hist|world war|WWII|WWI|medieval)\b", re.I),
    re.compile(r"\b(literature|novel|shakespeare|poetry)\b", re.I),
    re.compile(r"\b(programming|coding|python|java|javascript|rust|go\b|c\+\+|c#)\b", re.I),
    re.compile(r"\b(psychology|psychological|cognitive)\b", re.I),
    re.compile(r"\b(engineering|software|civil|mechanical|electrical)\b", re.I),
    re.compile(r"\b(data science|machine learning|ai\b|artificial intelligence)\b", re.I),
]


def _extract_subject_from_query(query: str) -> Optional[str]:
    """Try to find a known subject mention in the raw query text."""
    query_lower = query.lower()
    for pattern in _SUBJECT_PATTERNS:
        match = pattern.search(query_lower)
        if match:
            return match.group(1).lower() if match.lastindex else match.group().lower()
    return None


def extract_intent(
    query: str,
    request_subject: Optional[str] = None,
    request_proficiency: Optional[str] = None,
) -> UserIntent:
    """Extract a structured UserIntent from the user's message.

    Priority for subject:
      1. ChatRequest.subject (explicitly passed by frontend)
      2. Subject mentioned in the query text
      3. None (unknown)
    """
    query_lower = query.lower()

    # Determine subject
    subject = request_subject
    detected_from_query = _extract_subject_from_query(query)
    if not subject and detected_from_query:
        subject = detected_from_query

    # Determine activity request / intent
    activity = None
    intent = "general"
    for keyword, activity_val in ACTIVITY_MAP.items():
        if keyword in query_lower:
            activity = activity_val
            intent = activity_val
            break

    if "plan" in query_lower or "schedule" in query_lower:
        activity = "study-plan"
        intent = "study-plan"
    elif "teach" in query_lower or "explain" in query_lower:
        intent = "teach"
    elif "recall" in query_lower or "remember" in query_lower:
        intent = "recall"
    elif "practice" in query_lower or "apply" in query_lower:
        intent = "practice"
    elif "compare" in query_lower or "contrast" in query_lower:
        intent = "compare"
    elif "forget" in query_lower or "struggling" in query_lower or "don't understand" in query_lower:
        intent = "review"

    # Extract topic (narrower than subject, e.g. "Stoicism", "categorical imperative")
    topic = None
    if subject:
        # Look for "quiz/test me on <topic>" patterns
        on_match = re.search(r"\b(?:quiz|test) me on (.+?)(?:\?|$|\.)", query_lower)
        if on_match:
            potential_topic = on_match.group(1).strip()
            # If the topic IS the subject (e.g. "Quiz me on Philosophy"), topic is None
            # because the whole subject is the scope; topic is the narrower sub-area.
            if potential_topic.lower() != subject.lower():
                topic = potential_topic

        # Look for "forgetting <topic>" / "don't understand <topic>" patterns
        if not topic:
            for pattern in [
                r"\bforget(?:ting)?\s+(?:the\s+)?(.+?)(?:\?|$|\.|!)",
                r"\b(?:don't|cant|cannot|can not|struggling with)\s+(?:understand|get|the\s+)?(.+?)(?:\?|$|\.|!)",
            ]:
                forget_match = re.search(pattern, query_lower)
                if forget_match:
                    potential_topic = forget_match.group(1).strip()
                    if potential_topic.lower() != subject.lower():
                        topic = potential_topic
                    break

    # Extract difficulty preference
    difficulty = None
    for keyword, diff in DIFFICULTY_MAP.items():
        if re.search(rf"\b{keyword}\b", query_lower):
            difficulty = diff
            break
    if request_proficiency:
        prof_lower = request_proficiency.lower()
        if "beginner" in prof_lower or "intro" in prof_lower:
            difficulty = "easy"
        elif "advanced" in prof_lower or "expert" in prof_lower:
            difficulty = "hard"
        elif "intermediate" in prof_lower:
            difficulty = "medium"

    # Extract question count
    count = None
    count_match = re.search(r"\b(\d+)\s*(?:questions?|items?|problems?|exercises?)\b", query_lower)
    if count_match:
        count = int(count_match.group(1))

    # Detect learning goal
    goal = None
    if "quiz" in query_lower or "test" in query_lower or "assess" in query_lower:
        goal = "assessment"
    elif "review" in query_lower or "remember" in query_lower or "forget" in query_lower:
        goal = "consolidation"
    elif "learn" in query_lower or "understand" in query_lower or "explain" in query_lower:
        goal = "understanding"
    elif "practice" in query_lower or "apply" in query_lower:
        goal = "application"

    return UserIntent(
        intent=intent,
        activity_request=activity,
        subject=subject,
        topic=topic,
        learning_goal=goal,
        difficulty_preference=difficulty or (request_proficiency or "medium" if request_proficiency else None),
        question_count=count,
        raw_query=query,
        detected_subject_from_query=detected_from_query,
    )
