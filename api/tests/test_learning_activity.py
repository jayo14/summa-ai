"""Tests for LearningActivity model and data store integration."""

from datetime import datetime, timezone
import pytest
from app.models.activity import ActivityCreate, ActivityPayload, LearningActivity
from app.models.components import QuizComponent, QuizQuestion
from app.services.data_store import DataStore


def test_learning_activity_model_instantiation():
    quiz = QuizComponent(
        title="Check Understanding",
        questions=[
            QuizQuestion(
                id="q1",
                question="What is dynamic dispatch?",
                options=["Runtime binding", "Compile time binding"],
                correctIndex=0,
                explanation="Resolved at runtime based on actual object type",
            )
        ],
    )
    activity = LearningActivity(
        id="act-101",
        user_id="user-test-1",
        title="Dynamic Dispatch Assessment",
        type="quiz",
        purpose="Verify core OOP concept",
        concept_ids=["con-dynamic-dispatch"],
        difficulty="medium",
        estimated_minutes=5,
        learning_signals={"target_score": 80},
        component=quiz,
    )

    assert activity.id == "act-101"
    assert activity.purpose == "Verify core OOP concept"
    assert activity.concept_ids == ["con-dynamic-dispatch"]
    assert activity.difficulty == "medium"
    assert activity.estimated_minutes == 5
    assert activity.component.type == "quiz"


@pytest.mark.asyncio
async def test_data_store_learning_activity_round_trip():
    store = DataStore()
    user_id = "user-activity-roundtrip"

    create_data = {
        "title": "Interactive Memory Graph",
        "type": "graph",
        "purpose": "Map cognitive load",
        "concept_ids": ["concept-1", "concept-2"],
        "difficulty": "hard",
        "estimated_minutes": 15,
        "learning_signals": {"mastery_threshold": 0.85},
    }

    created = await store.create_activity(user_id, create_data)
    assert created["id"] is not None
    assert created["title"] == "Interactive Memory Graph"
    assert created["purpose"] == "Map cognitive load"
    assert created["concept_ids"] == ["concept-1", "concept-2"]
    assert created["difficulty"] == "hard"
    assert created["estimated_minutes"] == 15
    assert created["learning_signals"] == {"mastery_threshold": 0.85}

    fetched = await store.get_artifact(created["id"], user_id)
    assert fetched is not None
    assert fetched["title"] == "Interactive Memory Graph"
    assert fetched["purpose"] == "Map cognitive load"
