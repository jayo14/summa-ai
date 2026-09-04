"""Tests for Phase 4 Resource Ingestion, Permissions, and Grounding."""

from unittest.mock import patch
import pytest


@pytest.mark.asyncio
async def test_resource_permissions_and_search():
    from app.routes.resource_routes import grant_permission, search_resources, PermissionGrant, ResourceSearchRequest
    
    user_id = "user-phase4-test"
    with patch("app.routes.resource_routes.resolve_user_id", return_value=user_id):
        p_res = await grant_permission(PermissionGrant(resource_id="res-101", scope="session"))
        assert p_res["status"] == "success"
        assert p_res["scope"] == "session"

        s_res = await search_resources(ResourceSearchRequest(query="polymorphism"))
        assert isinstance(s_res, list)
