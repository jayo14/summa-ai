"""Tests for memory routes — Cognee and hybrid SummaStudy endpoints."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from app.main import app
from app.core.security import set_current_user_id, reset_current_user_id

client = TestClient(app)


def _auth_headers():
    return {"Authorization": "Bearer valid-token"}


@pytest.fixture(autouse=True)
def _mock_verify_jwt():
    with patch("app.main.verify_supabase_jwt", return_value="user-1"):
        yield


@pytest.mark.asyncio
async def test_remember_text():
    with patch("app.routes.memory.cognee") as mock_cognee:
        mock_cognee.remember_text = AsyncMock(return_value={"status": "ok"})
        token = set_current_user_id("user-1")
        try:
            response = client.post(
                "/api/v1/memory/remember/text",
                headers=_auth_headers(),
                json={
                    "text": "I like Python",
                    "metadata": {"topic": "programming"},
                },
            )
            assert response.status_code == 200
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_remember_conversation():
    with patch("app.routes.memory.cognee") as mock_cognee:
        mock_cognee.remember_conversation = AsyncMock(return_value={"status": "ok"})
        token = set_current_user_id("user-1")
        try:
            response = client.post(
                "/api/v1/memory/remember/conversation",
                headers=_auth_headers(),
                json={
                    "query": "What is Python?",
                    "response": "Python is a language.",
                },
            )
            assert response.status_code == 200
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_hybrid_extract():
    with patch("app.routes.memory.summastudy_memory") as mock_memory:
        mock_memory.extract_and_store_memories = AsyncMock(
            return_value=[{"content": "likes Python", "type": "preference"}]
        )
        token = set_current_user_id("user-1")
        try:
            response = client.post(
                "/api/v1/memory/hybrid/extract",
                headers=_auth_headers(),
                json={"message": "I really enjoy coding in Python"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["count"] == 1
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_hybrid_facts():
    with patch("app.routes.memory.summastudy_memory") as mock_memory:
        mock_memory.retrieve_relevant_memories = AsyncMock(
            return_value=[{"content": "goal: learn AI", "type": "goal"}]
        )
        token = set_current_user_id("user-1")
        try:
            response = client.get(
                "/api/v1/memory/hybrid/facts?limit=10", headers=_auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert len(data["facts"]) == 1
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_hybrid_summary():
    with patch("app.routes.memory.summastudy_memory") as mock_memory:
        mock_memory.get_memory_summary = AsyncMock(
            return_value={"total": 2, "by_type": {"preference": 2}}
        )
        token = set_current_user_id("user-1")
        try:
            response = client.get(
                "/api/v1/memory/hybrid/summary", headers=_auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_hybrid_context():
    with patch("app.routes.memory.cognee") as mock_cognee, patch(
        "app.routes.memory.summastudy_memory"
    ) as mock_memory:
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.recall_artifacts = AsyncMock(return_value={"artifacts": []})
        mock_memory.retrieve_relevant_memories = AsyncMock(return_value=[])
        token = set_current_user_id("user-1")
        try:
            response = client.get(
                "/api/v1/memory/hybrid/context", headers=_auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert "context" in data
            assert "cognee" in data["context"]
            assert "atomic_facts" in data["context"]
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_memory_forget():
    with patch("app.routes.memory.cognee") as mock_cognee:
        mock_cognee.forget_topic = AsyncMock(return_value={"status": "forgotten"})
        token = set_current_user_id("user-1")
        try:
            response = client.post(
                "/api/v1/memory/forget",
                headers=_auth_headers(),
                json={"topic": "loops"},
            )
            assert response.status_code == 200
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_memory_improve():
    with patch("app.routes.memory.cognee") as mock_cognee:
        mock_cognee.improve_memory = AsyncMock(return_value={"status": "improved"})
        token = set_current_user_id("user-1")
        try:
            response = client.post("/api/v1/memory/improve", headers=_auth_headers())
            assert response.status_code == 200
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_memory_feedback():
    with patch("app.routes.memory.cognee") as mock_cognee:
        mock_cognee.improve_with_feedback = AsyncMock(return_value={"status": "ok"})
        token = set_current_user_id("user-1")
        try:
            response = client.post(
                "/api/v1/memory/feedback",
                headers=_auth_headers(),
                json={
                    "session_id": "s1",
                    "score": 5,
                    "text": "Great session",
                },
            )
            assert response.status_code == 200
        finally:
            reset_current_user_id(token)


@pytest.mark.asyncio
async def test_memory_consolidate():
    with patch("app.routes.memory.cognee") as mock_cognee:
        mock_cognee.improve_memory = AsyncMock(return_value={"status": "improved"})
        token = set_current_user_id("user-1")
        try:
            response = client.post(
                "/api/v1/memory/consolidate", headers=_auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert "datasets" in data
        finally:
            reset_current_user_id(token)
