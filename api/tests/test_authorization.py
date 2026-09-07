"""Tests for Prompt 0.3 — Resource ownership and authorization checks."""

import pytest
from unittest.mock import MagicMock
from app.services.data_store import DataStore
from app.core.security import current_user_id


@pytest.fixture(autouse=True)
def reset_store_instance():
    DataStore._instance = None
    yield
    DataStore._instance = None


class _AsyncContextManager:
    def __init__(self, value):
        self.value = value

    async def __aenter__(self):
        return self.value

    async def __aexit__(self, *args):
        return None


def _mock_pool(store):
    pool = MagicMock()
    conn = MagicMock()
    conn.execute = MagicMock(return_value="DELETE 0")
    conn.fetchrow = MagicMock(return_value=None)
    conn.fetchval = MagicMock(return_value=None)
    
    async def async_execute(*args, **kwargs):
        return conn.execute(*args, **kwargs)
        
    async def async_fetchrow(*args, **kwargs):
        return conn.fetchrow(*args, **kwargs)

    async def async_fetchval(*args, **kwargs):
        return conn.fetchval(*args, **kwargs)

    conn_mock = MagicMock()
    conn_mock.execute = async_execute
    conn_mock.fetchrow = async_fetchrow
    conn_mock.fetchval = async_fetchval
    pool.acquire = MagicMock(return_value=_AsyncContextManager(conn_mock))
    store._pool = pool
    return pool, conn


@pytest.mark.asyncio
async def test_artifact_ownership_isolation():
    store = DataStore()
    user_a = "user-a"
    user_b = "user-b"

    art = await store.create_artifact(user_a, {"title": "User A Activity", "type": "quiz"})
    aid = art["id"]

    # User A can get, update, delete
    assert await store.get_artifact(aid, user_a) is not None
    assert await store.update_artifact(aid, user_a, {"title": "Updated"}) is not None

    # User B gets 404/None
    assert await store.get_artifact(aid, user_b) is None
    assert await store.update_artifact(aid, user_b, {"title": "Hacked"}) is None
    assert await store.delete_artifact(aid, user_b) is False

    # User A can delete
    assert await store.delete_artifact(aid, user_a) is True


@pytest.mark.asyncio
async def test_conversation_and_messages_ownership_isolation():
    store = DataStore()
    user_a = "user-a"
    user_b = "user-b"

    conv = await store.create_conversation(user_a, title="Private Chat")
    cid = conv["id"]

    assert await store.get_conversation(cid, user_a) is not None
    assert await store.get_conversation(cid, user_b) is None

    # Adding message as user B fails
    msg_b = await store.add_message(cid, user_b, "user", "Hello")
    assert msg_b is None

    # Listing messages as user B returns empty
    assert await store.list_messages(cid, user_b) == []

    # Deleting conversation as user B fails
    assert await store.delete_conversation(cid, user_b) is False
    assert await store.delete_conversation(cid, user_a) is True


@pytest.mark.asyncio
async def test_study_plan_flashcard_exam_ownership_isolation():
    store = DataStore()
    pool, conn = _mock_pool(store)

    user_a = "user-a"
    user_b = "user-b"

    # Mock DB query behavior for ownership check
    conn.fetchrow.return_value = None
    conn.execute.return_value = "DELETE 0"

    assert await store.update_study_plan("plan-1", user_b, {"title": "X"}) is None
    assert await store.delete_study_plan("plan-1", user_b) is False

    assert await store.update_flashcard("fc-1", user_b, {"mastered": True}) is None
    assert await store.delete_flashcard("fc-1", user_b) is False

    assert await store.update_exam("exam-1", user_b, {"name": "X"}) is None
    assert await store.delete_exam("exam-1", user_b) is False


@pytest.mark.asyncio
async def test_material_and_concept_ownership_isolation():
    store = DataStore()
    user_a = "user-a"
    user_b = "user-b"

    mat = await store.create_material(user_a, {"title": "doc.pdf", "type": "pdf"})
    mid = mat["id"]
    concept = await store.create_concept(user_a, {"name": "Recursion", "category": "CS"})
    cid = concept["id"]

    # User B cannot delete User A's material or concept
    assert await store.delete_material(mid, user_b) is False
    assert await store.delete_concept(cid, user_b) is False

    # User A can delete
    assert await store.delete_material(mid, user_a) is True
    assert await store.delete_concept(cid, user_a) is True


def test_rbac_admin_role_security():
    from app.core.rbac import get_user_role, UserRole

    # Substring in email must NOT grant admin
    user_with_admin_substring = {"email": "notadmin@gmail.com", "role": "user"}
    assert get_user_role(user_with_admin_substring) == UserRole.USER.value

    user_with_administrator = {"email": "administrator@x.com"}
    assert get_user_role(user_with_administrator) == UserRole.USER.value

    # Removed hardcoded emails without role="admin" must NOT get admin
    user_hardcoded_email = {"email": "codegallantx@gmail.com", "role": "user"}
    assert get_user_role(user_hardcoded_email) == UserRole.USER.value

    # Explicit admin role in profile must return admin
    user_real_admin = {"email": "user@domain.com", "role": "admin"}
    assert get_user_role(user_real_admin) == UserRole.ADMIN.value


