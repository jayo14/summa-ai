"""Tests for application config — Settings defaults and derived properties."""

import os
import pytest
from unittest.mock import patch
from app.config import Settings


class TestSettingsDefaults:
    def test_default_api_v1_str(self):
        s = Settings()
        assert s.API_V1_STR == "/api/v1"

    def test_default_environment(self):
        s = Settings()
        assert s.ENVIRONMENT == "development"

    def test_default_zai_model(self):
        s = Settings()
        assert s.ZAI_MODEL == "glm-4.5"

    def test_default_hybrid_memory_enabled(self):
        s = Settings()
        assert s.HYBRID_MEMORY_ENABLED is True

    def test_default_summastudy_disabled(self):
        s = Settings()
        assert s.SUMMASTUDY_ENABLED is False


class TestSettingsDerived:
    def test_is_production_true(self):
        s = Settings(ENVIRONMENT="production")
        assert s.is_production is True

    def test_is_production_false(self):
        s = Settings(ENVIRONMENT="development")
        assert s.is_production is False

    def test_is_production_case_insensitive(self):
        s = Settings(ENVIRONMENT="PROD")
        assert s.is_production is True

    def test_get_cors_origins_default(self):
        s = Settings(
            BACKEND_CORS_ORIGINS=["http://localhost:3000"], ENVIRONMENT="development"
        )
        assert s.get_cors_origins() == ["http://localhost:3000"]

    def test_get_cors_origins_production_with_frontend_url(self):
        with patch.dict(os.environ, {"FRONTEND_URL": "https://app.example.com"}):
            s = Settings(
                BACKEND_CORS_ORIGINS=["http://localhost:3000"],
                ENVIRONMENT="production",
            )
            assert "https://app.example.com" in s.get_cors_origins()

    def test_get_cors_origins_production_with_render_url(self):
        with patch.dict(
            os.environ, {"RENDER_EXTERNAL_URL": "https://summa-ai-backend.onrender.com"}
        ):
            s = Settings(
                BACKEND_CORS_ORIGINS=["http://localhost:3000"],
                ENVIRONMENT="production",
            )
            origins = s.get_cors_origins()
            assert any("summa-ai-frontend" in o for o in origins)
