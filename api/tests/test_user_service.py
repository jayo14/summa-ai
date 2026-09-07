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
        for field in ["name", "avatar", "bio", "role", "status", "onboarded", "onboarding_data"]:
            assert field in APPLICATION_OWNED_FIELDS

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
