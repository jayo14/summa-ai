"""Tests for SummaStudyMemoryClient — noise detection, fact extraction parsing."""
import json
import pytest
from app.services.summastudy_memory import SummaStudyMemoryClient


class TestNoiseDetection:
    def setup_method(self):
        self.client = SummaStudyMemoryClient()

    def test_short_message_is_noise(self):
        assert self.client._is_noise("Hi") is True

    def test_greeting_is_noise(self):
        assert self.client._is_noise("hello") is True
        assert self.client._is_noise("thanks") is True
        assert self.client._is_noise("good morning") is True

    def test_long_message_not_noise(self):
        msg = "I really struggle with understanding polymorphism in Python classes"
        assert self.client._is_noise(msg) is False

    def test_message_at_noise_boundary(self):
        """Messages exactly 39 chars should be noise, 40+ should not."""
        short = "x" * 39
        long = "x" * 40
        assert self.client._is_noise(short) is True
        assert self.client._is_noise(long) is False

    def test_punctuation_stripped_for_greeting_check(self):
        assert self.client._is_noise("Hello!") is True
        assert self.client._is_noise("Thanks, ") is True


class TestFactExtraction:
    def setup_method(self):
        self.client = SummaStudyMemoryClient()

    def test_parse_valid_json_facts(self):
        facts = self.client._parse_facts(
            json.dumps([{"content": "I like short summaries", "type": "preference"}])
        )
        assert len(facts) == 1
        assert facts[0]["content"] == "I like short summaries"
        assert facts[0]["type"] == "preference"

    def test_parse_fenced_json(self):
        facts = self.client._parse_facts(
            '```json\n[{"content": "Test", "type": "fact"}]\n```'
        )
        assert len(facts) == 1
        assert facts[0]["content"] == "Test"

    def test_parse_empty_array(self):
        facts = self.client._parse_facts("[]")
        assert facts == []

    def test_parse_invalid_json_returns_empty(self):
        facts = self.client._parse_facts("not json at all")
        assert facts == []

    def test_parse_filters_empty_content(self):
        facts = self.client._parse_facts(
            json.dumps([
                {"content": "valid", "type": "fact"},
                {"content": "", "type": "preference"},
                {"type": "goal"},
            ])
        )
        assert len(facts) == 1
        assert facts[0]["content"] == "valid"


class TestMemorySummary:
    def setup_method(self):
        self.client = SummaStudyMemoryClient()

    def test_empty_summary(self):
        assert self.client._summarize_facts([]) == {"total": 0, "by_type": {}}

    def test_summary_counts_by_type(self):
        facts = [
            {"content": "a", "type": "preference"},
            {"content": "b", "type": "preference"},
            {"content": "c", "type": "goal"},
        ]
        summary = self.client._summarize_facts(facts)
        assert summary["total"] == 3
        assert summary["by_type"]["preference"] == 2
        assert summary["by_type"]["goal"] == 1
