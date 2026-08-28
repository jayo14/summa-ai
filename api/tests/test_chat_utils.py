"""Tests for chat utility functions: detect_intent, _section, knowledge gaps."""

import pytest
from app.routes.chat import detect_intent, _section


class TestDetectIntent:
    def test_quiz_intent(self):
        assert detect_intent("Can you quiz me on NLP?") == "quiz"
        assert detect_intent("test me on transformers") == "quiz"

    def test_flashcards_intent(self):
        assert detect_intent("make flashcards for me") == "flashcards"
        assert detect_intent("show me flash cards") == "flashcards"

    def test_study_plan_intent(self):
        assert detect_intent("create a study plan") == "study-plan"
        assert detect_intent("I need exam prep") == "study-plan"

    def test_hexagon_intent(self):
        assert detect_intent("my progress") == "hexagon"
        assert detect_intent("hexagon chart") == "hexagon"
        assert detect_intent("proficien") == "hexagon"

    def test_graph_intent(self):
        assert detect_intent("show knowledge graph") == "graph"

    def test_timeline_intent(self):
        assert detect_intent("what's my schedule") == "timeline"
        assert detect_intent("show timeline") == "timeline"
        assert detect_intent("calendar view") == "timeline"

    def test_gap_analysis_intent(self):
        assert detect_intent("what is my gap") == "gap-analysis"
        assert detect_intent("missing prerequisites") == "gap-analysis"
        assert detect_intent("need to learn calculus") == "gap-analysis"

    def test_no_intent(self):
        assert detect_intent("hello") is None
        assert detect_intent("") is None
        assert detect_intent("tell me about attention") is None


class TestSection:
    def test_short_text_not_truncated(self):
        text = "short text"
        assert _section(text, max_chars=100) == text

    def test_long_text_truncated(self):
        text = "a" * 5000
        result = _section(text, max_chars=1000)
        assert len(result) == 1000 + len("\n...]")
        assert result.endswith("\n...]")

    def test_exact_boundary_no_truncation(self):
        text = "a" * 100
        result = _section(text, max_chars=100)
        assert result == text
