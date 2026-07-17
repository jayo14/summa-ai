"""Tests for auth routes — signup and login proxy to Supabase."""
import json
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
import pytest
from app.routes.auth import signup, login
from app.models.user import AuthLoginRequest


@pytest.mark.asyncio
async def test_signup_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "access_token": "token-123",
        "user": {"id": "u1", "email": "a@b.com", "user_metadata": {"name": "A", "avatar": "av"}},
    }
    with patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        result = await signup(AuthLoginRequest(email="a@b.com", password="pass123", name="A", avatar="av"))
        assert result["access_token"] == "token-123"
        assert result["user"]["name"] == "A"


@pytest.mark.asyncio
async def test_signup_missing_email():
    with pytest.raises(HTTPException) as exc:
        await signup(AuthLoginRequest(email="", password="pass123"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_signup_missing_password():
    with pytest.raises(HTTPException) as exc:
        await signup(AuthLoginRequest(email="a@b.com", password=""))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_signup_supabase_error():
    mock_resp = MagicMock()
    mock_resp.status_code = 422
    mock_resp.json.return_value = {"msg": "User already registered"}
    with patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        with pytest.raises(HTTPException) as exc:
            await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
        assert exc.value.status_code == 422


@pytest.mark.asyncio
async def test_login_credentials_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "access_token": "token-456",
        "user": {"id": "u2", "email": "a@b.com", "user_metadata": {}},
    }
    with patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        result = await login(AuthLoginRequest(email="a@b.com", password="pass123", provider="credentials"))
        assert result["access_token"] == "token-456"
        assert result["user"]["provider"] == "credentials"


@pytest.mark.asyncio
async def test_login_missing_email():
    with pytest.raises(HTTPException) as exc:
        await login(AuthLoginRequest(email="", password="pass123"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_login_missing_password_credentials():
    with pytest.raises(HTTPException) as exc:
        await login(AuthLoginRequest(email="a@b.com", password="", provider="credentials"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_login_supabase_error():
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.json.return_value = {"error_description": "Invalid credentials"}
    with patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        with pytest.raises(HTTPException) as exc:
            await login(AuthLoginRequest(email="a@b.com", password="wrong", provider="credentials"))
        assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_login_id_token_provider():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "access_token": "token-789",
        "user": {"id": "u3", "email": "a@b.com", "user_metadata": {}},
    }
    with patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        result = await login(AuthLoginRequest(email="a@b.com", password="id-token", provider="google"))
        assert result["user"]["provider"] == "google"


@pytest.mark.asyncio
async def test_signup_missing_supabase_url():
    with patch("app.routes.auth.settings") as mock_settings:
        mock_settings.SUPABASE_URL = ""
        mock_settings.SUPABASE_ANON_KEY = ""
        with patch("app.routes.auth.httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__.return_value.post.side_effect = Exception("Invalid URL")
            with pytest.raises(Exception):
                await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
