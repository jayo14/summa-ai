"""Tests for misconception detection and correction loop."""

import pytest
from app.services.misconception_engine import MisconceptionEngine, MisconceptionClassification


@pytest.fixture(autouse=True)
def reset_engine():
    """Reset singleton state between tests."""
    engine = MisconceptionEngine()
    engine._local_misconceptions.clear()
    yield


class TestMisconceptionEngine:
    @pytest.mark.asyncio
    async def test_record_and_retrieve(self):
        engine = MisconceptionEngine()
        result = await engine.record_misconception(
            user_id="test-user",
            concept_id="polymorphism",
            description="Confusing overloading with overriding",
            confidence="high",
        )
        assert result["concept_id"] == "polymorphism"
        assert result["occurrences"] == 1

        active = await engine.get_active_misconceptions("test-user")
        assert len(active) == 1
        assert active[0]["concept_id"] == "polymorphism"

    @pytest.mark.asyncio
    async def test_duplicate_increments_occurrences(self):
        engine = MisconceptionEngine()
        await engine.record_misconception("u1", "scope", "Variable scope confusion", "medium")
        await engine.record_misconception("u1", "scope", "Variable scope confusion", "medium")

        active = await engine.get_active_misconceptions("u1")
        assert len(active) == 1
        assert active[0]["occurrences"] == 2

    @pytest.mark.asyncio
    async def test_correction_recommendations_empty(self):
        engine = MisconceptionEngine()
        recs = await engine.get_correction_recommendations("no-user")
        assert recs == []

    @pytest.mark.asyncio
    async def test_correction_recommendations_populated(self):
        engine = MisconceptionEngine()
        await engine.record_misconception("u2", "encapsulation", "Direct field access", "medium")
        await engine.record_misconception("u2", "encapsulation", "Direct field access", "medium")
        await engine.record_misconception("u2", "encapsulation", "Direct field access", "medium")

        recs = await engine.get_correction_recommendations("u2")
        assert len(recs) == 1
        assert recs[0]["priority"] == "high"
        assert "encapsulation" in recs[0]["concept_id"]

    @pytest.mark.asyncio
    async def test_record_correction_attempt(self):
        engine = MisconceptionEngine()
        m = await engine.record_misconception("u3", "inheritance", "is-a vs has-a", "medium")
        mid = m["id"]

        record = await engine.record_correction_attempt("u3", mid, True)
        assert record["correct"] is True

        # Misconception should be marked resolved locally
        active = await engine.get_active_misconceptions("u3")
        for item in active:
            if item["id"] == mid:
                assert item.get("resolved") is True
                break

    @pytest.mark.asyncio
    async def test_analyze_insufficient_attempts_returns_none(self):
        engine = MisconceptionEngine()
        result = await engine.analyze_and_record(
            user_id="u4",
            concept_ids=["test"],
            recent_attempts=[{"correct": True}],
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_empty_user_returns_nothing(self):
        engine = MisconceptionEngine()
        active = await engine.get_active_misconceptions("nonexistent-user")
        assert active == []
