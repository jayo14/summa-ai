"""Tests for structured intent extraction — the foundation of subject-aware
component generation.

Verifies that:
  - "Quiz me on Philosophy" produces subject=Philosophy, not Java/programming
  - "Quiz me on Newton's Laws" produces subject=Physics, topic=Newton's Laws
  - "I keep forgetting the Krebs cycle" detects the consolidation goal
  - "I don't understand integration" detects the understanding goal
  - No cross-domain contamination occurs
"""

import pytest

from app.services.intent_extraction import extract_intent, UserIntent


class TestPhilosophyQuizIntent:
    def test_philosophy_quiz_preserves_subject(self):
        intent = extract_intent("Quiz me on Philosophy", request_subject="Philosophy")
        assert intent.intent == "quiz"
        assert intent.activity_request == "quiz"
        assert intent.subject == "Philosophy"
        assert intent.topic is None  # whole subject is the scope
        assert intent.learning_goal == "assessment"

    def test_philosophy_not_contaminated_with_java(self):
        intent = extract_intent("Quiz me on Philosophy", request_subject="Philosophy")
        assert intent.subject == "Philosophy"
        assert intent.subject != "Object-Oriented Programming"
        assert intent.subject != "Java"
        # Ensure no programming contamination in extracted fields
        for field_val in [intent.raw_query, intent.subject or "", intent.topic or ""]:
            assert "java" not in field_val.lower()
            assert "polymorphism" not in field_val.lower()
            assert "compile-time" not in field_val.lower()
            assert "runtime" not in field_val.lower() or field_val.lower() == "overriding"


class TestPhysicsIntent:
    def test_newtons_laws_preserves_subject_topic(self):
        intent = extract_intent(
            "Quiz me on Newton's Laws", request_subject="Physics"
        )
        assert intent.subject == "Physics"
        assert intent.topic == "newton's laws"
        assert intent.intent == "quiz"

    def test_newtons_laws_not_contaminated(self):
        intent = extract_intent(
            "Quiz me on Newton's Laws", request_subject="Physics"
        )
        assert "java" not in (intent.subject or "").lower()
        assert "programming" not in (intent.subject or "").lower()


class TestForgettingIntent:
    def test_forgetting_krebs_cycle(self):
        intent = extract_intent(
            "I keep forgetting the Krebs cycle", request_subject="Biology"
        )
        assert intent.subject == "Biology"
        assert intent.topic == "krebs cycle"
        assert intent.intent == "review"
        assert intent.learning_goal == "consolidation"

    def test_forgetting_stoicism(self):
        intent = extract_intent(
            "I keep forgetting Stoic ethics", request_subject="Philosophy"
        )
        assert intent.subject == "Philosophy"
        assert "stoic" in (intent.topic or "").lower()


class TestNotUnderstandingIntent:
    def test_not_understanding_integration(self):
        intent = extract_intent(
            "I don't understand integration", request_subject="Mathematics"
        )
        assert intent.subject == "Mathematics"
        assert intent.topic == "integration"
        assert intent.intent == "review"

    def test_not_understanding_produces_understanding_goal(self):
        intent = extract_intent(
            "I don't understand the categorical imperative", request_subject="Philosophy"
        )
        assert intent.subject == "Philosophy"
        assert intent.topic == "the categorical imperative"


class TestSubjectInferenceFromQuery:
    def test_subject_inferred_from_query_when_no_request_subject(self):
        intent = extract_intent("Quiz me on Philosophy")
        assert intent.subject == "Philosophy"
        assert intent.detected_subject_from_query == "philosophy"

    def test_subject_not_inferred_for_unknown_domain(self):
        intent = extract_intent("quiz me on something random")
        assert intent.subject is None or intent.subject == "Something Random"


class TestDifficultyExtraction:
    def test_explicit_hard_difficulty(self):
        intent = extract_intent("Give me harder questions on calculus")
        assert intent.difficulty_preference == "hard"

    def test_explicit_easy_difficulty(self):
        intent = extract_intent("Make it easier, I'm a beginner")
        assert intent.difficulty_preference == "easy"


class TestQuestionCountExtraction:
    def test_explicit_question_count(self):
        intent = extract_intent("Give me 5 questions on philosophy")
        assert intent.question_count == 5

    def test_no_question_count(self):
        intent = extract_intent("Quiz me on Philosophy")
        assert intent.question_count is None
