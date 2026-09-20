"""Tests for past question pattern analysis and predictive practice generation."""

import pytest
from app.services.pattern_analysis import (
    PatternAnalysisEngine,
    PredictivePracticeGenerator,
    sanitize_certainty_phrases,
)


class TestPatternAnalysis:
    def test_empty_questions_returns_empty(self):
        result = PatternAnalysisEngine.analyze_patterns([])
        assert result.topic_frequencies == {}
        assert result.uncertainty_note != ""

    def test_topic_frequency_calculation(self):
        questions = [
            {"topic": "Ethics", "year": "2023"},
            {"topic": "Ethics", "year": "2024"},
            {"topic": "Logic", "year": "2023"},
        ]
        result = PatternAnalysisEngine.analyze_patterns(questions)
        assert result.topic_frequencies["Ethics"] == pytest.approx(0.67, abs=0.01)
        assert result.topic_frequencies["Logic"] == pytest.approx(0.33, abs=0.01)

    def test_structure_extraction_compare(self):
        questions = [
            {"topic": "Ethics", "question_text": "Compare utilitarianism and deontology"},
            {"topic": "Ethics", "question_text": "What is the difference between them?"},
        ]
        result = PatternAnalysisEngine.analyze_patterns(questions)
        assert any("Compare" in s or "Contrast" in s for s in result.recurring_structures)

    def test_structure_extraction_definition(self):
        questions = [
            {"topic": "Logic", "question_text": "Define propositional logic"},
            {"topic": "Logic", "question_text": "Give a definition of syllogism"},
        ]
        result = PatternAnalysisEngine.analyze_patterns(questions)
        assert any("Definition" in s for s in result.recurring_structures)

    def test_year_trends(self):
        questions = [
            {"topic": "Ethics", "year": "2022"},
            {"topic": "Ethics", "year": "2023"},
            {"topic": "Ethics", "year": "2024"},
            {"topic": "Logic", "year": "2024"},
        ]
        trends = PatternAnalysisEngine._compute_year_trends(questions)
        assert len(trends["Ethics"]) == 3
        assert "2024" in trends["Ethics"]
        assert trends["Logic"] == ["2024"]


class TestCertaintySanitization:
    def test_removes_guaranteed_phrases(self):
        text = "This topic will be on the exam for sure"
        result = sanitize_certainty_phrases(text)
        assert "will be on the exam" not in result
        assert "historically frequent" in result

    def test_removes_definitely_phrases(self):
        text = "This is definitely tested every year"
        result = sanitize_certainty_phrases(text)
        assert "definitely tested" not in result.lower()


class TestPredictivePracticeGenerator:
    def test_predicted_label(self):
        result = PredictivePracticeGenerator.generate_from_patterns(
            topic="Epistemology",
            recurring_structures=["Compare and Contrast"],
            question_type="predicted",
        )
        assert result["label"] == "Predicted Practice"
        assert "Epistemology" in result["target_concept"]
        assert len(result["rubric"]) >= 3

    def test_historical_label(self):
        result = PredictivePracticeGenerator.generate_from_patterns(
            topic="Stoicism",
            recurring_structures=[],
            question_type="historical",
        )
        assert result["label"] == "Historical Question"

    def test_conceptual_label(self):
        result = PredictivePracticeGenerator.generate_from_patterns(
            topic="Logic",
            recurring_structures=[],
            question_type="conceptual",
        )
        assert result["label"] == "Conceptual Practice"

    def test_structure_reflected_in_basis(self):
        result = PredictivePracticeGenerator.generate_from_patterns(
            topic="Ethics",
            recurring_structures=["Critical Evaluation", "Compare and Contrast"],
            question_type="predicted",
        )
        assert "Critical Evaluation" in result["structural_basis"]
