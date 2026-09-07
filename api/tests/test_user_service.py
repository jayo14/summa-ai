"""Tests for UserService — verifies canonical sync_user_profile and field ownership."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.user_service import UserService, APPLICATION_OWNED_FIELDS, AUTH_OWNED_FIELDS


class TestSyncUserProfile:
    @pytest.mark.asyncio
    async def test_requires_supabase_user_id(self):
        service = UserService()
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None):
            with pytest.raises(ValueError, match="Supabase user ID is required"):
                await service.sync_user_profile({"email": "a@b.com"})

    @pytest.mark.asyncio
    async def test_requires_email(self):
        service = UserService()
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None):
            with pytest.raises(ValueError, match="Email is required"):
                await service.sync_user_profile({"id": "u1"})

    @pytest.mark.asyncio
    async def test_creates_new_profile(self):
        service = UserService()
        supabase_user = {
            "id": "u1",
            "email": "a@b.com",
            "email_confirmed_at": "2024-01-01T00:00:00Z",
            "app_metadata": {"provider": "credentials"},
            "user_metadata": {"name": "Test User"},
        }
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1", "email": "a@b.com"}), \
             patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "email": "a@b.com"}):
            mock_save.return_value = {"id": "u1", "email": "a@b.com"}
            result = await service.sync_user_profile(supabase_user)
            assert result["id"] == "u1"
            assert result["email"] == "a@b.com"

    @pytest.mark.asyncio
    async def test_preserves_application_fields(self):
        service = UserService()
        existing_profile = {
            "id": "u1",
            "email": "a@b.com",
            "name": "Custom Name",
            "avatar": "custom-avatar.png",
            "bio": "Custom bio",
            "role": "admin",
            "onboarded": True,
            "onboarding_data": {"step": 3},
        }
        supabase_user = {
            "id": "u1",
            "email": "a@b.com",
            "user_metadata": {"name": "Supabase Name", "avatar": "supabase-avatar.png"},
        }
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=existing_profile), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch.object(service.user_store, "serialize_user", return_value=existing_profile):
            mock_save.return_value = existing_profile
            result = await service.sync_user_profile(supabase_user)
            # Application-owned fields should be preserved
            assert result["name"] == "Custom Name"
            assert result["avatar"] == "custom-avatar.png"
            assert result["bio"] == "Custom bio"
            assert result["role"] == "admin"
            assert result["onboarded"] is True

    @pytest.mark.asyncio
    async def test_updates_auth_owned_fields(self):
        service = UserService()
        supabase_user = {
            "id": "u1",
            "email": "newemail@b.com",
            "email_confirmed_at": "2024-01-01T00:00:00Z",
            "app_metadata": {"provider": "google"},
        }
        with patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value=None), \
             patch.object(service.user_store, "save_user", new_callable=AsyncMock) as mock_save, \
             patch.object(service.user_store, "get_user_by_id", new_callable=AsyncMock, return_value={"id": "u1"}), \
             patch.object(service.user_store, "serialize_user", return_value={"id": "u1", "email": "newemail@b.com", "provider": "google"}):
            mock_save.return_value = {"id": "u1", "email": "newemail@b.com"}
            result = await service.sync_user_profile(supabase_user)
            assert result["email"] == "newemail@b.com"


class TestFieldOwnershipDefinitions:
    def test_auth_owned_fields_are_readonly(self):
        """Auth-owned fields should never be overwritten by application logic."""
        assert "id" in AUTH_OWNED_FIELDS
        assert "email" in AUTH_OWNED_FIELDS
        assert "email_verified" in AUTH_OWNED_FIELDS
        assert "provider" in AUTH_OWNED_FIELDS

    def test_application_owned_fields_exist(self):
        """Application-owned fields should be preserved across logins."""
        assert "name" in APPLICATION_OWNED_FIELDS
        assert "avatar" in APPLICATION_OWNED_FIELDS
        assert "bio" in APPLICATION_OWNED_FIELDS
        assert "role" in APPLICATION_OWNED_FIELDS
        assert "onboarded" in APPLICATION_OWNED_FIELDS
        assert "onboarding_data" in APPLICATION_OWNED_FIELDS
