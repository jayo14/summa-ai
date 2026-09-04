"""Tests for Mastery Engine evidence aggregation, difficulty weighting, and decay check."""

from datetime import datetime, timedelta, timezone
import pytest
from app.services.mastery_engine import MasteryEngine


@pytest.mark.asyncio
async def test_compute_mastery_no_evidence_returns_nones():
    engine = MasteryEngine()
    mastery = await engine.compute_mastery("user-no-data", "non-existent-concept")

    assert mastery["depth"] is None
    assert mastery["problem_solving"] is None
    assert mastery["speed"] is None
    assert mastery["consistency"] is None
    assert mastery["confidence"] is None
    assert mastery["creativity"] is None
    assert mastery["evidence_count"] == 0
    assert mastery["stale"] is False


@pytest.mark.asyncio
async def test_difficulty_weighting_affects_mastery_deltas():
    engine = MasteryEngine()
    user_easy = "user-easy-attempts"
    user_hard = "user-hard-attempts"
    concept = "polymorphism"

    # Seed easy correct attempt
    await engine.record_attempt(
        user_id=user_easy,
        activity_id="act-easy",
        concept_ids=[concept],
        correct=True,
        difficulty="easy",
        score=100.0,
    )
    mastery_easy = await engine.compute_mastery(user_easy, concept)

    # Seed hard correct attempt
    await engine.record_attempt(
        user_id=user_hard,
        activity_id="act-hard",
        concept_ids=[concept],
        correct=True,
        difficulty="hard",
        score=100.0,
    )
    mastery_hard = await engine.compute_mastery(user_hard, concept)

    assert mastery_easy["depth"] is not None
    assert mastery_hard["depth"] is not None
    assert mastery_hard["problem_solving"] > mastery_easy["problem_solving"]


@pytest.mark.asyncio
async def test_decay_check_flags_stale_evidence():
    engine = MasteryEngine()
    user_id = "user-stale-test"
    concept = "recursion"

    old_time = datetime.now(timezone.utc) - timedelta(days=20)
    engine._local_attempts.append({
        "id": "att-old",
        "activity_id": "act-old",
        "user_id": user_id,
        "concept_ids": [concept],
        "correct": True,
        "score": 100.0,
        "difficulty": "medium",
        "response_time_ms": 10000,
        "confidence_rating": 4,
        "created_at": old_time,
    })

    mastery = await engine.compute_mastery(user_id, concept)
    assert mastery["stale"] is True

    is_stale = await engine.decay_check(user_id, concept, decay_window_days=14)
    assert is_stale is True
