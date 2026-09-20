"""Tests for multi-dimensional mastery engine with recency decay."""

import math
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.mastery_engine import MasteryEngine


@pytest.fixture(autouse=True)
def _reset_singleton():
    """Reset MasteryEngine singleton between tests."""
    orig_local = MasteryEngine._instance
    MasteryEngine._instance = None
    yield
    MasteryEngine._instance = orig_local


class TestMasteryDecay:
    @pytest.mark.asyncio
    async def test_recent_attempt_high_weight(self):
        engine = MasteryEngine()
        with patch.object(engine, "_get_pool", return_value=None):
            await engine.record_attempt(
                user_id="user-decay",
                activity_id="a1",
                concept_ids=["Recursion"],
                correct=True,
                score=90.0,
                difficulty="medium",
            )
            mastery = await engine.compute_mastery("user-decay", "Recursion")
            assert mastery["depth"] is not None
            assert mastery["depth"] > 80

    @pytest.mark.asyncio
    async def test_old_attempt_decays_relative_to_recent(self):
        engine = MasteryEngine()
        from datetime import datetime, timezone, timedelta
        old_time = datetime.now(timezone.utc) - timedelta(days=20)
        recent_time = datetime.now(timezone.utc) - timedelta(days=1)
        # Old attempt: 95% but 20 days old (decayed weight)
        engine._local_attempts.append({
            "id": "old-1",
            "activity_id": "a1",
            "user_id": "user-old",
            "concept_ids": ["Old Concept"],
            "correct": True,
            "score": 95.0,
            "difficulty": "medium",
            "response_time_ms": None,
            "confidence_rating": None,
            "created_at": old_time,
        })
        # Recent attempt: 50% but 1 day old (high weight)
        engine._local_attempts.append({
            "id": "recent-1",
            "activity_id": "a2",
            "user_id": "user-old",
            "concept_ids": ["Old Concept"],
            "correct": True,
            "score": 50.0,
            "difficulty": "medium",
            "response_time_ms": None,
            "confidence_rating": None,
            "created_at": recent_time,
        })
        mastery = await engine.compute_mastery("user-old", "Old Concept")
        assert mastery["stale"] is False  # recent attempt keeps it fresh
        assert mastery["depth"] is not None
        # Recent 50% should pull mastery below 95% due to higher recency weight
        assert mastery["depth"] < 80

    @pytest.mark.asyncio
    async def test_stale_flag_after_14_days(self):
        engine = MasteryEngine()
        from datetime import datetime, timezone, timedelta
        old_time = datetime.now(timezone.utc) - timedelta(days=15)
        engine._local_attempts.append({
            "id": "stale-1",
            "activity_id": "a1",
            "user_id": "user-stale",
            "concept_ids": ["Stale Topic"],
            "correct": True,
            "score": 80.0,
            "difficulty": "medium",
            "response_time_ms": None,
            "confidence_rating": None,
            "created_at": old_time,
        })
        mastery = await engine.compute_mastery("user-stale", "Stale Topic")
        assert mastery["stale"] is True


class TestMasteryDimensions:
    @pytest.mark.asyncio
    async def test_speed_dimension(self):
        engine = MasteryEngine()
        with patch.object(engine, "_get_pool", return_value=None):
            await engine.record_attempt(
                user_id="user-speed",
                activity_id="a1",
                concept_ids=["Quick Topic"],
                correct=True,
                score=90.0,
                response_time_ms=3000,
            )
            mastery = await engine.compute_mastery("user-speed", "Quick Topic")
            assert mastery["speed"] is not None
            assert mastery["speed"] > 80

    @pytest.mark.asyncio
    async def test_confidence_dimension(self):
        engine = MasteryEngine()
        with patch.object(engine, "_get_pool", return_value=None):
            await engine.record_attempt(
                user_id="user-conf",
                activity_id="a1",
                concept_ids=["Conf Topic"],
                correct=True,
                score=85.0,
                confidence_rating=5,
            )
            mastery = await engine.compute_mastery("user-conf", "Conf Topic")
            assert mastery["confidence"] is not None
            assert mastery["confidence"] == 100.0

    @pytest.mark.asyncio
    async def test_consistency_dimension(self):
        engine = MasteryEngine()
        with patch.object(engine, "_get_pool", return_value=None):
            for score in [85, 87, 83, 86, 84]:
                await engine.record_attempt(
                    user_id="user-consist",
                    activity_id="a1",
                    concept_ids=["Consistent Topic"],
                    correct=True,
                    score=float(score),
                )
            mastery = await engine.compute_mastery("user-consist", "Consistent Topic")
            assert mastery["consistency"] is not None
            assert mastery["consistency"] > 90

    @pytest.mark.asyncio
    async def test_no_evidence_returns_none(self):
        engine = MasteryEngine()
        mastery = await engine.compute_mastery("nobody", "nonexistent")
        assert mastery["depth"] is None
        assert mastery["evidence_count"] == 0


class TestCourseMastery:
    @pytest.mark.asyncio
    async def test_course_mastery_aggregation(self):
        engine = MasteryEngine()
        with patch.object(engine, "_get_pool", return_value=None):
            for concept, score in [("Ethics", 80), ("Logic", 60), ("Epistemology", 90)]:
                await engine.record_attempt(
                    user_id="user-course",
                    activity_id="a1",
                    concept_ids=[concept],
                    correct=True,
                    score=float(score),
                )
            result = await engine.get_course_mastery("user-course", ["Ethics", "Logic", "Epistemology"])
            assert result["composite_mastery"] is not None
            assert result["total_concepts"] == 3
            assert result["concepts_with_evidence"] == 3
            assert result["stale_count"] == 0

    @pytest.mark.asyncio
    async def test_course_mastery_empty_concepts(self):
        engine = MasteryEngine()
        result = await engine.get_course_mastery("nobody", [])
        assert result["composite_mastery"] is None

    @pytest.mark.asyncio
    async def test_get_concept_mastery(self):
        engine = MasteryEngine()
        with patch.object(engine, "_get_pool", return_value=None):
            await engine.record_attempt(
                user_id="user-single",
                activity_id="a1",
                concept_ids=["Single Concept"],
                correct=True,
                score=75.0,
            )
            m = await engine.get_concept_mastery("user-single", "Single Concept")
            assert m["concept_id"] == "Single Concept"
            assert m["depth"] is not None
