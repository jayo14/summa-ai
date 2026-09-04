"""Tests for Prompt 0.5 — Persistent memory and rate limit state."""

import pytest
from app.services.cognee_service import CogneeService


@pytest.mark.asyncio
async def test_remember_text_recalls_across_new_instance():
    user_id = "test-user-persistent-05"

    # Instance 1 remembers text
    service1 = CogneeService()
    await service1.remember_text("Fact: Python 3.12 introduced per-interpreter GIL", user_id, dataset_name="main")

    # Clear in-process singleton/cache simulating process restart
    CogneeService._instance = None
    CogneeService._memory = {}
    CogneeService._recall_cache.clear()

    # Instance 2 recalls text
    service2 = CogneeService()
    recalled = await service2.recall_context(user_id, "Python 3.12")
    results = recalled.get("results", [])

    assert any("Python 3.12" in r.get("text", "") for r in results)
