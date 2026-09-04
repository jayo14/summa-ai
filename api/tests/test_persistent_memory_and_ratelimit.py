import pytest
from unittest.mock import MagicMock
from app.services.cognee_service import CogneeService


class _AsyncContextManager:
    def __init__(self, value):
        self.value = value

    async def __aenter__(self):
        return self.value

    async def __aexit__(self, *args):
        return None


@pytest.mark.asyncio
async def test_remember_text_recalls_across_new_instance():
    user_id = "test-user-persistent-05"

    db_entries = []

    conn = MagicMock()
    async def mock_execute(sql, *args):
        if "INSERT INTO summa_ai.memory_entries" in sql:
            db_entries.append({
                "id": args[0],
                "user_id": args[1],
                "dataset": args[2],
                "text": args[3],
                "metadata": args[4],
                "created_at": "2026-09-04T00:00:00Z",
            })
        return "INSERT 0 1"

    async def mock_fetch(sql, *args):
        dataset = args[0]
        return [e for e in db_entries if e["dataset"] == dataset]

    conn.execute = mock_execute
    conn.fetch = mock_fetch

    pool = MagicMock()
    pool.acquire = MagicMock(return_value=_AsyncContextManager(conn))

    with pytest.MonkeyPatch.context() as mp:
        async def mock_get_pool():
            return pool
        mp.setattr("app.services.cognee_service.get_pool", mock_get_pool)
        mp.setattr("app.services.db_pool.get_pool", mock_get_pool)

        # Instance 1 remembers text
        service1 = CogneeService()
        await service1.remember_text("Fact: Python 3.12 introduced per-interpreter GIL", user_id, dataset_name="main")

        # Clear in-process singleton/cache simulating process restart
        CogneeService._instance = None
        CogneeService._memory = {}
        service1._recall_cache.clear()

        # Instance 2 recalls text
        service2 = CogneeService()
        recalled = await service2.recall_context(user_id, "Python 3.12")
        results = recalled.get("results", [])

        assert any("Python 3.12" in r.get("text", "") for r in results)
