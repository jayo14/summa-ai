"""Tests for resource consent and scope management."""

import pytest


class TestChunkText:
    def test_basic_chunking(self):
        from app.routes.resource_routes import _chunk_text
        text = "A" * 1000
        chunks = _chunk_text(text, size=200, overlap=50)
        assert len(chunks) >= 4
        assert all(len(c) <= 250 for c in chunks)

    def test_empty_text(self):
        from app.routes.resource_routes import _chunk_text
        assert _chunk_text("") == []
        assert _chunk_text(None) == []

    def test_short_text_single_chunk(self):
        from app.routes.resource_routes import _chunk_text
        chunks = _chunk_text("Hello", size=500, overlap=100)
        assert len(chunks) == 1
        assert chunks[0] == "Hello"

    def test_overlap_preserves_continuity(self):
        from app.routes.resource_routes import _chunk_text
        text = "ABCDEFGHIJ" * 50
        chunks = _chunk_text(text, size=30, overlap=10)
        for i in range(len(chunks) - 1):
            assert chunks[i][-10:] in chunks[i + 1] or chunks[i][-5:] in chunks[i + 1][:15]


class TestConsentModels:
    def test_consent_update_model(self):
        from app.routes.resource_routes import ConsentUpdate
        c = ConsentUpdate(consent_status="granted", scope="subject")
        assert c.consent_status == "granted"
        assert c.scope == "subject"

    def test_scope_update_model(self):
        from app.routes.resource_routes import ScopeUpdate
        s = ScopeUpdate(resource_id="res-1", scope="always")
        assert s.resource_id == "res-1"
        assert s.scope == "always"

    def test_permission_grant_model(self):
        from app.routes.resource_routes import PermissionGrant
        p = PermissionGrant(resource_id="r1", scope="session")
        assert p.scope == "session"
