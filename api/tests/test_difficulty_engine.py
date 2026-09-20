"""Tests for difficulty engine and adaptive scaling."""

import pytest
from app.services.difficulty_engine import DifficultyEngine, AdaptiveScaler


class TestDifficultyEngine:
    def test_empty_attempts_defaults_medium(self):
        engine = DifficultyEngine()
        result = engine.compute_difficulty([])
        assert result["suggested"] == "medium"
        assert result["confidence"] == "low"

    def test_strong_performance_steps_up(self):
        engine = DifficultyEngine(window=5)
        attempts = [{"correct": True, "response_time_ms": 3000} for _ in range(5)]
        result = engine.compute_difficulty(attempts, current_difficulty="medium")
        assert result["suggested"] in ("hard", "exam-level")
        assert result["metrics"]["accuracy"] == 1.0

    def test_weak_performance_steps_down(self):
        engine = DifficultyEngine(window=5)
        attempts = [{"correct": False} for _ in range(5)]
        result = engine.compute_difficulty(attempts, current_difficulty="hard")
        assert result["suggested"] in ("easy", "medium")

    def test_stable_performance_maintains(self):
        engine = DifficultyEngine(window=6)
        attempts = [
            {"correct": True}, {"correct": True}, {"correct": True},
            {"correct": False}, {"correct": True}, {"correct": True},
        ]  # 83% accuracy — above threshold but no streak, should step up
        result = engine.compute_difficulty(attempts, current_difficulty="medium")
        assert result["suggested"] in ("medium", "hard")  # 83% triggers step-up to hard

    def test_streak_override(self):
        engine = DifficultyEngine()
        result = engine.compute_difficulty(
            [{"correct": True}],
            current_difficulty="easy",
            streak_override="hard",
        )
        assert result["suggested"] == "hard"

    def test_fast_high_accuracy_promotes(self):
        engine = DifficultyEngine(window=4)
        attempts = [{"correct": True, "response_time_ms": 2000} for _ in range(4)]
        result = engine.compute_difficulty(attempts, current_difficulty="easy")
        assert result["suggested"] in ("medium", "hard", "exam-level")


class TestAdaptiveScaler:
    def test_first_call_returns_suggested(self):
        scaler = AdaptiveScaler(cooldown=3)
        result = scaler.scale("hard", "medium")
        assert result == "hard"

    def test_cooldown_prevents_oscillation(self):
        scaler = AdaptiveScaler(cooldown=3)
        # Build history of "medium"
        for _ in range(3):
            scaler.scale("medium", "medium")
        # Now suggest change
        result = scaler.scale("hard", "medium")
        # Should allow change after cooldown
        assert result == "hard"

    def test_cooldown_blocks_immediate_change(self):
        scaler = AdaptiveScaler(cooldown=3)
        scaler.scale("medium", "medium")
        # Try to change immediately
        result = scaler.scale("hard", "medium")
        assert result == "medium"  # Blocked by cooldown

    def test_reset_clears_history(self):
        scaler = AdaptiveScaler(cooldown=3)
        scaler.scale("medium", "medium")
        scaler.scale("medium", "medium")
        scaler.reset()
        result = scaler.scale("hard", "medium")
        assert result == "hard"  # Fresh start allows change
