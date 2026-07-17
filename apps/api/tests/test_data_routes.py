"""HTTP integration tests for data routes using FastAPI TestClient."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
from app.core.security import current_user_id, current_jwt_token


client = TestClient(app)


def _auth_headers():
    return {"Authorization": "Bearer valid-token"}


class TestHealthCheck:
    def test_health_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "summa-ai-api"


class TestArtifacts:
    @patch("app.routes.data_routes._store")
    def test_list_artifacts(self, mock_store):
        mock_store.list_artifacts.return_value = [{"id": "a1"}]
        response = client.get("/api/v1/artifacts", headers=_auth_headers())
        assert response.status_code == 200
        assert response.json() == [{"id": "a1"}]

    @patch("app.routes.data_routes._store")
    def test_get_artifact_not_found(self, mock_store):
        mock_store.get_artifact.return_value = None
        response = client.get("/api/v1/artifacts/missing", headers=_auth_headers())
        assert response.status_code == 404

    @patch("app.routes.data_routes._store")
    def test_delete_artifact_success(self, mock_store):
        mock_store.delete_artifact.return_value = True
        response = client.delete("/api/v1/artifacts/a1", headers=_auth_headers())
        assert response.status_code == 200

    @patch("app.routes.data_routes._store")
    def test_list_versions(self, mock_store):
        mock_store.list_artifact_versions.return_value = [{"version": 1}]
        response = client.get("/api/v1/artifacts/a1/versions", headers=_auth_headers())
        assert response.status_code == 200
        assert response.json() == [{"version": 1}]

    @patch("app.routes.data_routes._store")
    def test_restore_version_success(self, mock_store):
        mock_store.restore_artifact_version.return_value = {"id": "a1", "title": "Restored"}
        response = client.post("/api/v1/artifacts/a1/versions", headers=_auth_headers(), json={"version": 1})
        assert response.status_code == 200

    @patch("app.routes.data_routes._store")
    def test_restore_version_not_found(self, mock_store):
        mock_store.restore_artifact_version.return_value = None
        response = client.post("/api/v1/artifacts/a1/versions", headers=_auth_headers(), json={"version": 99})
        assert response.status_code == 404


class TestConversations:
    @patch("app.routes.data_routes._store")
    def test_list_conversations(self, mock_store):
        mock_store.list_conversations.return_value = [{"id": "c1"}]
        response = client.get("/api/v1/conversations", headers=_auth_headers())
        assert response.status_code == 200

    @patch("app.routes.data_routes._store")
    def test_create_conversation(self, mock_store):
        mock_store.create_conversation.return_value = {"id": "c1"}
        response = client.post("/api/v1/conversations", headers=_auth_headers(), json={"title": "Chat"})
        assert response.status_code == 201

    @patch("app.routes.data_routes._store")
    def test_delete_conversation_success(self, mock_store):
        mock_store.delete_conversation.return_value = True
        response = client.delete("/api/v1/conversations/c1", headers=_auth_headers())
        assert response.status_code == 200


class TestTimeline:
    @patch("app.routes.data_routes._store")
    def test_list_timeline(self, mock_store):
        mock_store.list_timeline_events.return_value = [{"id": "t1"}]
        response = client.get("/api/v1/timeline", headers=_auth_headers())
        assert response.status_code == 200

    @patch("app.routes.data_routes._store")
    def test_create_timeline_event(self, mock_store):
        mock_store.create_timeline_event.return_value = {"id": "t1"}
        response = client.post("/api/v1/timeline", headers=_auth_headers(), json={"type": "milestone", "title": "T", "description": "D"})
        assert response.status_code == 201


class TestMaterials:
    @patch("app.routes.data_routes._store")
    def test_list_materials(self, mock_store):
        mock_store.list_materials.return_value = [{"id": "m1"}]
        response = client.get("/api/v1/materials", headers=_auth_headers())
        assert response.status_code == 200

    @patch("app.routes.data_routes._store")
    def test_create_material(self, mock_store):
        mock_store.create_material.return_value = {"id": "m1", "status": "processing"}
        response = client.post("/api/v1/materials", headers=_auth_headers(), json={"type": "pdf", "title": "Notes"})
        assert response.status_code == 201
        assert response.json()["status"] == "processing"


class TestConcepts:
    @patch("app.routes.data_routes._store")
    def test_list_concepts(self, mock_store):
        mock_store.list_concepts.return_value = [{"id": "con1"}]
        response = client.get("/api/v1/concepts", headers=_auth_headers())
        assert response.status_code == 200

    @patch("app.routes.data_routes._store")
    def test_create_concept(self, mock_store):
        mock_store.create_concept.return_value = {"id": "con1"}
        response = client.post("/api/v1/concepts", headers=_auth_headers(), json={"name": "Polymorphism"})
        assert response.status_code == 201


class TestAnalytics:
    @patch("app.routes.data_routes._store")
    def test_get_analytics(self, mock_store):
        mock_store._get_pool.return_value.acquire.return_value.__aenter__.return_value.fetchrow.return_value = {"total": 10, "mastered": 5}
        mock_store._get_pool.return_value.acquire.return_value.__aenter__.return_value.fetch.return_value = []
        response = client.get("/api/v1/analytics", headers=_auth_headers())
        assert response.status_code == 200
        data = response.json()
        assert "hexagon_dimensions" in data
        assert "summary" in data
