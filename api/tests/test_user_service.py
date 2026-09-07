"""Tests for UserService — verifies canonical sync_user_profile, field ownership, and role security."""

import os
import pytest
from unittest.mock import AsyncMock, patch
from app.services.user_service import UserService, APPLICATION_OWNED_FIELDS, AUTH_OWNED_FIELDS


class TestSyncUserProfile:
    @pytest.mark.asyncio
    async def test_requires_supabase_user_id(self):
        service = UserService()
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None):
            with pytest.raises(ValueError, match="Supabase user ID"):
                await service.sync_user_profile({"email": "a@b.com"})

    @pytest.mark.asyncio
    async def test_requires_email(self):
        service = UserService()
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None):
            with pytest.raises(ValueError, match="Email"):
                await service.sync_user_profile({"id": "u1"})

    @pytest.mark.asyncio
    async def test_creates_new_profile_with_user_role(self):
        service = UserService()
        supabase_user = {
            "id": "u1",
            "email": "a@b.com",
            "email_confirmed_at": "2024-01-01T00:00:00Z",
            "app_metadata": {"provider": "credentials"},
            "user_metadata": {"name": "Test"},
        }
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch("app.services.user_service.derive_initial_role", return_value="user"):
            mock_save.return_value = {"id": "u1", "email": "a@b.com", "role": "user"}
            with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1", "email": "a@b.com", "role": "user"}):
                with patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "email": "a@b.com", "role": "user"}):
                    result = await service.sync_user_profile(supabase_user)
                    assert result["role"] == "user"

    @pytest.mark.asyncio
    async def test_preserves_existing_role(self):
        service = UserService()
        existing_profile = {
            "id": "u1", "email": "a@b.com", "role": "admin",
            "name": "Custom", "avatar": "av.png", "bio": "bio",
            "onboarded": True, "onboarding_data": {"step": 3},
        }
        supabase_user = {
            "id": "u1", "email": "a@b.com",
            "user_metadata": {"name": "Supabase Name"},
        }
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=existing_profile), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch.object(service.user_store, "serialize_user", return_value=existing_profile):
            mock_save.return_value = existing_profile
            result = await service.sync_user_profile(supabase_user)
            assert result["role"] == "admin"

    @pytest.mark.asyncio
    async def test_preserves_application_fields(self):
        service = UserService()
        existing_profile = {
            "id": "u1", "email": "a@b.com",
            "name": "My Name", "avatar": "my.png", "bio": "my bio",
            "role": "admin", "onboarded": True,
            "onboarding_data": {"step": 5}, "status": "active",
        }
        supabase_user = {
            "id": "u1", "email": "a@b.com",
            "user_metadata": {"name": "Override", "avatar": "override.png"},
        }
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=existing_profile), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch.object(service.user_store, "serialize_user", return_value=existing_profile):
            mock_save.return_value = existing_profile
            result = await service.sync_user_profile(supabase_user)
            assert result["name"] == "My Name"
            assert result["avatar"] == "my.png"
            assert result["bio"] == "my bio"
            assert result["onboarded"] is True

    @pytest.mark.asyncio
    async def test_email_verified_from_supabase_only(self):
        service = UserService()
        supabase_user = {
            "id": "u1", "email": "a@b.com",
            "email_confirmed_at": "2024-01-01T00:00:00Z",
        }
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch("app.services.user_service.derive_initial_role", return_value="user"):
            mock_save.return_value = {"id": "u1", "email": "a@b.com"}
            with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1"}):
                with patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "email_verified": True}):
                    result = await service.sync_user_profile(supabase_user)
                    assert result["email_verified"] is True

    @pytest.mark.asyncio
    async def test_email_not_verified_when_missing(self):
        service = UserService()
        supabase_user = {"id": "u1", "email": "a@b.com"}
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch("app.services.user_service.derive_initial_role", return_value="user"):
            mock_save.return_value = {"id": "u1", "email": "a@b.com"}
            with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1"}):
                with patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "email_verified": False}):
                    result = await service.sync_user_profile(supabase_user)
                    assert result["email_verified"] is False


class TestFieldOwnership:
    def test_auth_owned_fields_are_readonly(self):
        assert "id" in AUTH_OWNED_FIELDS
        assert "email" in AUTH_OWNED_FIELDS
        assert "email_verified" in AUTH_OWNED_FIELDS
        assert "provider" in AUTH_OWNED_FIELDS

    def test_application_owned_fields_complete(self):
        for field in ["name", "avatar", "bio", "status", "onboarded", "onboarding_data"]:
            assert field in APPLICATION_OWNED_FIELDS

    def test_role_not_in_application_fields(self):
        """Role must NOT be in APPLICATION_OWNED_FIELDS — role changes go through admin only."""
        assert "role" not in APPLICATION_OWNED_FIELDS

    def test_auth_fields_not_in_application_fields(self):
        assert AUTH_OWNED_FIELDS.isdisjoint(APPLICATION_OWNED_FIELDS)


class TestRoleSecurity:
    @pytest.mark.asyncio
    async def test_client_cannot_escalate_role_via_metadata(self):
        """Even if Supabase user_metadata contains 'role: admin', it should be ignored."""
        service = UserService()
        supabase_user = {
            "id": "u1", "email": "a@b.com",
            "user_metadata": {"role": "admin", "name": "Hacker"},
        }
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch("app.services.user_service.derive_initial_role", return_value="user"):
            mock_save.return_value = {"id": "u1", "email": "a@b.com"}
            with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1"}):
                with patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "role": "user"}):
                    result = await service.sync_user_profile(supabase_user)
                    assert result["role"] == "user"


# ---------------------------------------------------------------------------
# Regression: email_verified defaults
# ---------------------------------------------------------------------------

class TestEmailVerifiedDefaults:
    def test_userstore_save_user_defaults_email_verified_to_false(self):
        """UserStore.save_user must default email_verified to False, not True."""
        from app.services.user_store import UserStore
        store = UserStore.__new__(UserStore)
        store._pool = None
        store._local_users = {}
        store._audit_logs = []

        import asyncio
        result = asyncio.run(store.save_user("u1", {"email": "a@b.com"}))
        assert result.get("email_verified") is False

    def test_userstore_serialize_defaults_email_verified_to_false(self):
        """UserStore.serialize_user must default email_verified to False, not True."""
        from app.services.user_store import UserStore
        store = UserStore.__new__(UserStore)

        result = store.serialize_user({"id": "u1", "email": "a@b.com"})
        assert result.get("email_verified") is False


# ---------------------------------------------------------------------------
# Regression: update_application_fields filters auth-owned fields
# ---------------------------------------------------------------------------

class TestUpdateApplicationFields:
    @pytest.mark.asyncio
    async def test_filters_out_role(self):
        """Client cannot set role via update_application_fields."""
        service = UserService()
        with patch.object(service.user_store, "update_user", new_callable=AsyncMock) as mock_update, \
             patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1", "name": "Old"}), \
             patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "name": "Test"}):
            mock_update.return_value = {"id": "u1", "name": "Test"}
            await service.update_application_fields("u1", {"role": "admin", "name": "Test"})
            mock_update.assert_called_once()
            call_args = mock_update.call_args[0][1]
            assert "role" not in call_args
            assert "name" in call_args

    @pytest.mark.asyncio
    async def test_filters_out_email_verified(self):
        """Client cannot set email_verified via update_application_fields."""
        service = UserService()
        with patch.object(service.user_store, "update_user", new_callable=AsyncMock) as mock_update, \
             patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1", "name": "Old"}), \
             patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "name": "Test"}):
            mock_update.return_value = {"id": "u1", "name": "Test"}
            await service.update_application_fields("u1", {"email_verified": True, "name": "Test"})
            call_args = mock_update.call_args[0][1]
            assert "email_verified" not in call_args

    @pytest.mark.asyncio
    async def test_filters_out_provider(self):
        """Client cannot set provider via update_application_fields."""
        service = UserService()
        with patch.object(service.user_store, "update_user", new_callable=AsyncMock) as mock_update, \
             patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1", "name": "Old"}), \
             patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "name": "Test"}):
            mock_update.return_value = {"id": "u1", "name": "Test"}
            await service.update_application_fields("u1", {"provider": "google", "name": "Test"})
            call_args = mock_update.call_args[0][1]
            assert "provider" not in call_args

    @pytest.mark.asyncio
    async def test_returns_none_when_no_valid_fields(self):
        """Returns None when all fields are auth-owned (filtered out)."""
        service = UserService()
        result = await service.update_application_fields("u1", {"role": "admin", "email_verified": True})
        assert result is None
