"""Tests for DataStore — artifact, conversation, timeline, material, and concept CRUD."""
import json
from unittest.mock import AsyncMock, MagicMock
from app.services.data_store import DataStore


def _mock_pool(store):
    pool = AsyncMock()
    conn = AsyncMock()
    pool.acquire.return_value.__aenter__.return_value = conn
    pool.acquire.return_value.__aexit__.return_value = None
    store._pool = pool
    return pool, conn


def test_list_artifacts_empty():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetch.return_value = []
    assert store.list_artifacts("user-1") == []


def test_create_artifact():
    store = DataStore()
    pool, conn = _mock_pool(store)
    row = {"id": "a1", "user_id": "user-1", "title": "Test", "type": "notes", "current_version": 1}
    conn.fetchrow.return_value = row
    result = store.create_artifact("user-1", {"title": "Test", "type": "notes", "component": None})
    assert result["id"] == "a1"


def test_get_artifact_found():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "a1"}
    assert store.get_artifact("a1") == {"id": "a1"}


def test_get_artifact_missing():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = None
    assert store.get_artifact("missing") is None


def test_update_artifact():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "a1", "title": "Updated", "current_version": 2}
    result = store.update_artifact("a1", {"title": "Updated"})
    assert result["title"] == "Updated"


def test_delete_artifact_success():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.execute.return_value = "DELETE 1"
    assert store.delete_artifact("a1") is True


def test_delete_artifact_missing():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.execute.return_value = "DELETE 0"
    assert store.delete_artifact("missing") is False


def test_toggle_pin_artifact():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "a1", "pinned": True}
    result = store.toggle_pin_artifact("a1")
    assert result["pinned"] is True


def test_list_conversations():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetch.return_value = [{"id": "c1", "message_count": 2}]
    result = store.list_conversations("user-1")
    assert len(result) == 1


def test_create_conversation():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "c1", "title": "New chat"}
    result = store.create_conversation("user-1", title="New chat")
    assert result["id"] == "c1"


def test_get_conversation():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "c1"}
    assert store.get_conversation("c1") == {"id": "c1"}


def test_delete_conversation():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.execute.return_value = "DELETE 1"
    assert store.delete_conversation("c1") is True


def test_list_messages():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetch.return_value = [{"id": "m1", "role": "user"}]
    result = store.list_messages("c1")
    assert result[0]["id"] == "m1"


def test_add_message():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "m1"}
    result = store.add_message("c1", "user", "Hello")
    assert result["id"] == "m1"


def test_list_timeline_events():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetch.return_value = [{"id": "t1"}]
    result = store.list_timeline_events("user-1")
    assert result[0]["id"] == "t1"


def test_create_timeline_event():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "t1"}
    result = store.create_timeline_event("user-1", "milestone", "Title", "Desc")
    assert result["id"] == "t1"


def test_list_materials():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetch.return_value = [{"id": "mat1"}]
    result = store.list_materials("user-1")
    assert result[0]["id"] == "mat1"


def test_create_material():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "mat1", "status": "processing"}
    result = store.create_material("user-1", {"type": "pdf", "title": "Notes"})
    assert result["status"] == "processing"


def test_delete_material():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.execute.return_value = "DELETE 1"
    assert store.delete_material("mat1") is True


def test_list_concepts():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetch.return_value = [{"id": "con1"}]
    result = store.list_concepts("user-1")
    assert result[0]["id"] == "con1"


def test_create_concept():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = {"id": "con1"}
    result = store.create_concept("user-1", {"name": "Polymorphism"})
    assert result["id"] == "con1"


def test_delete_concept():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.execute.return_value = "DELETE 1"
    assert store.delete_concept("con1") is True


def test_list_artifact_versions():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetch.return_value = [{"id": "v1", "version": 1}]
    result = store.list_artifact_versions("a1")
    assert len(result) == 1


def test_restore_artifact_version_found():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.side_effect = [
        {"id": "v1", "version": 1, "title": "Old", "component": "{}"},
        {"id": "a1", "title": "Old", "current_version": 1},
    ]
    result = store.restore_artifact_version("a1", 1)
    assert result["title"] == "Old"


def test_restore_artifact_version_missing():
    store = DataStore()
    pool, conn = _mock_pool(store)
    conn.fetchrow.return_value = None
    assert store.restore_artifact_version("a1", 99) is None
