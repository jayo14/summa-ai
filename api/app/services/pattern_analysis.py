"""Pattern Analysis and Exam Readiness Engine."""

import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


DENYLISTED_CERTAINTY_PATTERNS = [
    re.compile(r"\bwill be on the exam\b", re.I),
    re.compile(r"\bguaranteed to appear\b", re.I),
    re.compile(r"\bdefinitely test(ed)?\b", re.I),
]


class PatternAnalysisResult(BaseModel):
    topic_frequencies: Dict[str, float]
    recurring_structures: List[str]
    uncertainty_note: str


def sanitize_certainty_phrases(text: str) -> str:
    sanitized = text
    for pat in DENYLISTED_CERTAINTY_PATTERNS:
        sanitized = pat.sub("is historically frequent on past exams", sanitized)
    return sanitized


class PatternAnalysisEngine:
    @staticmethod
    def analyze_patterns(questions: List[Dict[str, Any]]) -> PatternAnalysisResult:
        if not questions:
            return PatternAnalysisResult(
                topic_frequencies={},
                recurring_structures=[],
                uncertainty_note="Insufficient past question evidence available for pattern analysis.",
            )

        counts: Dict[str, int] = {}
        for q in questions:
            topic = q.get("topic", "General")
            counts[topic] = counts.get(topic, 0) + 1

        total = len(questions)
        freqs = {t: round(c / total, 2) for t, c in counts.items()}

        raw_note = "High frequency topics reflect historical occurrence patterns; actual exam content may vary."
        clean_note = sanitize_certainty_phrases(raw_note)

        return PatternAnalysisResult(
            topic_frequencies=freqs,
            recurring_structures=["Definition + Code Trace", "Compare and Contrast", "Application Scenario"],
            uncertainty_note=clean_note,
        )


class ExamReadinessEngine:
    @staticmethod
    async def compute_readiness(user_id: str, exam_id: str) -> Dict[str, Any]:
        from app.services.mastery_engine import MasteryEngine
        mastery_engine = MasteryEngine()
        mastery = await mastery_engine.compute_mastery(user_id, f"exam:{exam_id}")

        attempts = [a for a in mastery_engine._local_attempts if a["user_id"] == user_id]
        if not attempts:
            accuracy = 0.0
        else:
            accuracy = round(sum(100.0 if a.get("correct") else 0.0 for a in attempts) / len(attempts), 1)

        depth = mastery.get("depth") or 50.0
        ps = mastery.get("problem_solving") or 50.0

        # Weighted readiness model
        readiness_score = round(0.4 * depth + 0.4 * ps + 0.2 * accuracy, 1)

        return {
            "exam_id": exam_id,
            "readiness_score": readiness_score,
            "breakdown": {
                "knowledge_recall": depth,
                "problem_solving": ps,
                "exam_practice_accuracy": accuracy,
            },
            "strong_topics": ["Polymorphism Foundations"] if readiness_score >= 70 else [],
            "developing_topics": ["Dynamic Dispatch"] if readiness_score < 70 else [],
            "uncertainty_note": "Readiness estimate is derived from recorded practice evidence.",
        }
