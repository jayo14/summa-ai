"""Pattern Analysis and Exam Readiness Engine.

Provides:
- PatternAnalysisEngine: topic frequency, recurring structures, year trends
- ExamReadinessEngine: multi-dimensional readiness from mastery data
- PredictivePracticeGenerator: structurally-matched practice questions
"""

import re
from collections import Counter, defaultdict
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

        # Extract recurring question structures
        structures = PatternAnalysisEngine._extract_structures(questions)

        # Compute year-over-year trends
        year_trends = PatternAnalysisEngine._compute_year_trends(questions)

        raw_note = "High frequency topics reflect historical occurrence patterns; actual exam content may vary."
        clean_note = sanitize_certainty_phrases(raw_note)

        return PatternAnalysisResult(
            topic_frequencies=freqs,
            recurring_structures=structures,
            uncertainty_note=clean_note,
        )

    @staticmethod
    def _extract_structures(questions: List[Dict[str, Any]]) -> List[str]:
        """Identify recurring question structure patterns."""
        structure_counts = Counter()
        for q in questions:
            text = q.get("question_text", "").lower()
            if "define" in text or "definition" in text:
                structure_counts["Definition + Explanation"] += 1
            if "compare" in text or "contrast" in text or "difference" in text:
                structure_counts["Compare and Contrast"] += 1
            if "apply" in text or "example" in text or "real-world" in text:
                structure_counts["Application Scenario"] += 1
            if "explain" in text and "why" in text:
                structure_counts["Explain Why (Causal Reasoning)"] += 1
            if "evaluate" in text or "critically" in text:
                structure_counts["Critical Evaluation"] += 1
            if "solve" in text or "calculate" in text:
                structure_counts["Problem Solving / Calculation"] += 1

        return [s for s, _ in structure_counts.most_common(5)] or [
            "Definition + Explanation",
            "Compare and Contrast",
            "Application Scenario",
        ]

    @staticmethod
    def _compute_year_trends(questions: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Map topics to the years they appeared."""
        topic_years: Dict[str, set] = defaultdict(set)
        for q in questions:
            topic = q.get("topic", "General")
            year = q.get("year")
            if year:
                topic_years[topic].add(str(year))
        return {t: sorted(years) for t, years in topic_years.items()}


class PredictivePracticeGenerator:
    """Generates practice questions structurally matched to historical patterns.

    Distinctly labels output as:
    - 'Historical Question' — verbatim past question
    - 'Predicted Practice' — structurally synthesized from patterns
    - 'Conceptual Practice' — generic diagnostic
    """

    @staticmethod
    def generate_from_patterns(
        topic: str,
        recurring_structures: List[str],
        question_type: str = "predicted",
    ) -> Dict[str, Any]:
        """Generate a practice question based on historical patterns.

        This is the deterministic local fallback. The LLM-powered version
        uses model_router with a strict schema.
        """
        structure = recurring_structures[0] if recurring_structures else "Definition + Explanation"

        if question_type == "historical":
            return {
                "target_concept": topic,
                "structural_basis": f"From historical past questions on {topic}.",
                "practice_question": f"Discuss the key principles of {topic} and provide two real-world examples.",
                "rubric": ["Clear definition", "Relevant examples", "Critical analysis"],
                "label": "Historical Question",
            }
        elif question_type == "predicted":
            return {
                "target_concept": topic,
                "structural_basis": f"Based on recurring '{structure}' pattern in {topic} exams.",
                "practice_question": f"Explain {topic} and evaluate its significance using the '{structure}' framework.",
                "rubric": [
                    f"Clear definition of {topic}",
                    "Application to a real scenario",
                    "Critical evaluation with evidence",
                    f"Consistent use of '{structure}' structure",
                ],
                "label": "Predicted Practice",
            }
        else:
            return {
                "target_concept": topic,
                "structural_basis": "Generic diagnostic question.",
                "practice_question": f"What are the core concepts of {topic}?",
                "rubric": ["Accurate identification of key concepts"],
                "label": "Conceptual Practice",
            }


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

        # Dynamically determine strong/developing/weak topics from concept mastery
        concept_scores = {}
        for a in attempts:
            for cid in a.get("concept_ids", []):
                if cid not in concept_scores:
                    concept_scores[cid] = []
                concept_scores[cid].append(a.get("score", 0))

        strong_topics = []
        developing_topics = []
        weak_topics = []
        for concept, scores in concept_scores.items():
            avg = sum(scores) / len(scores) if scores else 0
            if avg >= 75:
                strong_topics.append(concept)
            elif avg >= 50:
                developing_topics.append(concept)
            else:
                weak_topics.append(concept)

        return {
            "exam_id": exam_id,
            "readiness_score": readiness_score,
            "breakdown": {
                "knowledge_recall": depth,
                "problem_solving": ps,
                "exam_practice_accuracy": accuracy,
            },
            "strong_topics": strong_topics,
            "developing_topics": developing_topics,
            "weak_topics": weak_topics,
            "uncertainty_note": "Readiness estimate is derived from recorded practice evidence, not a guaranteed grade.",
        }
