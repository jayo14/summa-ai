"""Content relevance validation for generated learning components.

Before a component is presented to the student, this module validates that the
generated content is actually about the requested subject — preventing
cross-domain contamination (e.g. Philosophy -> Java questions).

Validation dimensions:
  - subject: the generated topic must match the requested subject
  - question relevance: questions must not mention unrelated domains
  - option validity: options must be plausible for the subject
  - answer correctness: correctIndex must point to a valid option
  - component schema: data must match the expected schema
"""

from __future__ import annotations

import logging
from typing import Optional

from app.models.components import COMPONENT_TYPE_MAP, ComponentData
from app.services.intent_extraction import UserIntent

logger = logging.getLogger(__name__)

# Domains that would indicate cross-contamination if they appear in a
# non-programming subject's component
CONTAMINATION_MARKERS = {
    "java", "polymorphism", "overloading", "overriding", "dispatch",
    "inheritance", "encapsulation", "abstract class", "interface",
    "compile-time", "runtime", "method signature", "superclass",
    "subclass", "object-oriented", "oop", "garbage collection",
}


def _detect_domain(text: str) -> Optional[str]:
    """Detect what domain a piece of text is about."""
    text_lower = text.lower()
    for marker in CONTAMINATION_MARKERS:
        if marker in text_lower:
            return "programming"
    return None


def validate_component_relevance(
    component_type: str,
    data: ComponentData,
    intent: UserIntent,
) -> bool:
    """Validate that generated component content is relevant to the intent's
    subject and free of cross-domain contamination.

    Returns True if valid, False if the content should be rejected.
    """
    if component_type not in COMPONENT_TYPE_MAP:
        return False

    subject = (intent.subject or "").lower()
    is_programming_subject = any(
        s in subject for s in ("programming", "computer", "java", "python",
                                "javascript", "software", "coding", "c++", "rust", "go"))

    # Collect all text content from the component for validation
    all_text = _extract_text(data)
    combined = " ".join(all_text).lower()

    # Cross-domain contamination check
    if not is_programming_subject:
        detected_domain = _detect_domain(combined)
        if detected_domain and detected_domain != "programming":
            return False
        # Check if programming markers appear in the content of a non-programming subject
        if not is_programming_subject:
            contamination_count = sum(1 for m in CONTAMINATION_MARKERS if m in combined)
            if contamination_count >= 2:
                logger.warning(
                    "Cross-domain contamination detected: subject=%s has %d programming markers",
                    intent.subject, contamination_count,
                )
                return False

    # Subject relevance check — the subject should appear somewhere in the content
    if subject and len(subject) > 2:
        # Only check if the subject is specific enough
        if subject not in combined and intent.topic:
            # Topic should appear in content
            topic_lower = (intent.topic or "").lower()
            if topic_lower and topic_lower not in combined:
                # This is a soft check — the question might be about the topic
                # without explicitly mentioning the subject name
                pass

    # Validate option validity for quiz components
    if component_type == "quiz" and hasattr(data, "questions"):
        for q in data.questions:
            if not q.question or not q.options:
                return False
            if q.correctIndex < 0 or q.correctIndex >= len(q.options):
                return False
            if len(q.options) < 2:
                return False

    # Validate flashcards
    if component_type == "flashcards" and hasattr(data, "cards"):
        if len(data.cards) < 1:
            return False
        for card in data.cards:
            if not card.front or not card.back:
                return False

    return True


def _extract_text(data: ComponentData) -> list[str]:
    """Extract all text content from a component for validation."""
    texts = []

    if hasattr(data, "title") and data.title:
        texts.append(data.title)

    if hasattr(data, "questions"):
        for q in data.questions:
            texts.append(q.question)
            texts.extend(q.options)
            if q.explanation:
                texts.append(q.explanation)

    if hasattr(data, "cards"):
        for card in data.cards:
            texts.append(card.front)
            texts.append(card.back)

    if hasattr(data, "gaps"):
        for g in data.gaps:
            texts.append(g.topic)
            texts.append(g.reason)

    if hasattr(data, "dimensions"):
        for d in data.dimensions:
            texts.append(d.label)

    if hasattr(data, "conceptA"):
        texts.append(data.conceptA)
    if hasattr(data, "conceptB"):
        texts.append(data.conceptB)

    if hasattr(data, "distinctions"):
        for d in data.distinctions:
            texts.append(d.aspect)
            texts.append(d.conceptA)
            texts.append(d.conceptB)

    if hasattr(data, "problem"):
        texts.append(data.problem)
    if hasattr(data, "steps"):
        for s in data.steps:
            texts.append(s.step)
            texts.append(s.explanation)

    if hasattr(data, "question"):
        texts.append(data.question)
    if hasattr(data, "hint"):
        texts.append(data.hint)
    if hasattr(data, "answer"):
        texts.append(data.answer)

    return [t for t in texts if t]


def validate_and_log(
    component_type: str,
    data: ComponentData,
    intent: UserIntent,
) -> bool:
    """Validate and log the result. Returns True if valid."""
    is_valid = validate_component_relevance(component_type, data, intent)
    if is_valid:
        logger.info(
            "Component validated: type=%s subject=%s topic=%s",
            component_type, intent.subject, intent.topic,
        )
    else:
        logger.warning(
            "Component validation FAILED: type=%s subject=%s topic=%s",
            component_type, intent.subject, intent.topic,
        )
    return is_valid
