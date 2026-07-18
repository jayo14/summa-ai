"""Tests for CogneeService — recall cache, remember/forget, and in-memory fallback."""

import pytest
from unittest.mock import AsyncMock, patch
from app.services.cognee_service import CogneeService, _TTLCache


class TestTTLCache:
    def test_get_miss_returns_none(self):
        cache = _TTLCache(ttl=60)
        assert cache.get("key") is None

    def test_set_and_get(self):
        cache = _TTLCache(ttl=60)
        cache.set("value", "key")
        assert cache.get("key") == "value"

    def test_ttl_expiry(self):
        cache = _TTLCache(ttl=0)
        cache.set("value", "key")
        assert cache.get("key") is None

    def test_multiple_keys(self):
        cache = _TTLCache(ttl=60)
        cache.set("v1", "k1")
        cache.set("v2", "k2")
        assert cache.get("k1") == "v1"
        assert cache.get("k2") == "v2"

    def test_overwrite_existing_key(self):
        cache = _TTLCache(ttl=60)
        cache.set("old", "key")
        cache.set("new", "key")
        assert cache.get("key") == "new"

    def test_key_with_args_and_kwargs(self):
        cache = _TTLCache(ttl=60)
        cache.set("value", "a", "b", x=1)
        assert cache.get("a", "b", x=1) == "value"

    def test_clear(self):
        cache = _TTLCache(ttl=60)
        cache.set("v", "k")
        cache.clear()
        assert cache.get("k") is None


class TestCogneeService:
    def test_singleton(self):
        s1 = CogneeService()
        s2 = CogneeService()
        assert s1 is s2

    @patch("app.services.cognee_service.settings")
    def test_fallback_when_no_keys(self, mock_settings):
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.LLM_API_KEY = ""
        mock_settings.COGNEE_API_KEY = ""
        service = CogneeService()
        assert service._cognee is None

    @pytest.mark.asyncio
    @patch("app.services.cognee_service.settings")
    async def test_recall_context_uses_cache(self, mock_settings):
        mock_settings.OPENAI_API_KEY = "key"
        mock_settings.LLM_API_KEY = ""
        mock_settings.COGNEE_API_KEY = ""
        service = CogneeService()
        service._cognee = AsyncMock()
        service._cognee.recall.return_value = [{"text": "memory"}]
        service._recall_cache.clear()
        result1 = await service.recall_context("user-99", "query")
        result2 = await service.recall_context("user-99", "query")
        assert result1 == result2
        assert service._cognee.recall.call_count == 1

    @pytest.mark.asyncio
    @patch("app.services.cognee_service.settings")
    async def test_remember_conversation_stores_in_memory(self, mock_settings):
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.LLM_API_KEY = ""
        mock_settings.COGNEE_API_KEY = ""
        service = CogneeService()
        await service.remember_conversation(
            "user-1", "query", "response", session_id="s1"
        )
        assert "user_user-1_conversations" in service._memory
        assert len(service._memory["user_user-1_conversations"]) == 1

    @pytest.mark.asyncio
    @patch("app.services.cognee_service.settings")
    async def test_forget_topic_removes_from_memory(self, mock_settings):
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.LLM_API_KEY = ""
        mock_settings.COGNEE_API_KEY = ""
        service = CogneeService()
        await service.remember_conversation("user-1", "query", "response")
        await service.forget_topic("user-1", "query", dataset_name="conversations")
        assert len(service._memory.get("user_user-1_conversations", [])) == 0

    @pytest.mark.asyncio
    @patch("app.services.cognee_service.settings")
    async def test_improve_memory_returns_status(self, mock_settings):
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.LLM_API_KEY = ""
        mock_settings.COGNEE_API_KEY = ""
        service = CogneeService()
        result = await service.improve_memory("user-1", "main")
        assert result.get("status") in ("success", "improved", "skipped")

    @pytest.mark.asyncio
    @patch("app.services.cognee_service.settings")
    async def test_recall_learning_progress_parses_scores(self, mock_settings):
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.LLM_API_KEY = ""
        mock_settings.COGNEE_API_KEY = ""
        service = CogneeService()
        service._recall_cache.clear()
        with patch.object(
            service,
            "_recall",
            AsyncMock(
                return_value=[
                    {"text": "loops", "metadata": {"topic": "loops", "score": 30}},
                    {
                        "text": "functions",
                        "metadata": {"topic": "functions", "score": 80},
                    },
                ]
            ),
        ):
            result = await service.recall_learning_progress("user-42")
            assert len(result.get("progress", [])) == 2

    @pytest.mark.asyncio
    @patch("app.services.cognee_service.settings")
    async def test_get_hexagon_dimensions_returns_scores(self, mock_settings):
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.LLM_API_KEY = ""
        mock_settings.COGNEE_API_KEY = ""
        service = CogneeService()
        service._memory["user_user-42_progress"] = [
            {"text": "loops", "metadata": {"topic": "loops", "score": 30}},
        ]
        service._recall_cache.clear()
        result = await service.get_hexagon_dimensions("user-42")
        assert isinstance(result, dict)
        assert "depth" in result
