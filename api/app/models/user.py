"""User & Settings models."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class User(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    provider: Optional[str] = None
    onboarded: bool = False
    onboarding_data: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    onboarded: Optional[bool] = None
    onboarding_data: Optional[Dict[str, Any]] = None


class UserSettings(BaseModel):
    user_id: str
    theme: str = "system"
    font_size: int = 14
    density: str = "comfortable"
    exam_reminders: bool = True
    proactive_check_ins: bool = True
    weekly_progress: bool = True
    email_notifications: bool = True
    thinking_mode: bool = True
    response_style: str = "balanced"
    share_progress: bool = False
    analytics: bool = True
    cognee_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    font_size: Optional[int] = None
    density: Optional[str] = None
    exam_reminders: Optional[bool] = None
    proactive_check_ins: Optional[bool] = None
    weekly_progress: Optional[bool] = None
    email_notifications: Optional[bool] = None
    thinking_mode: Optional[bool] = None
    response_style: Optional[str] = None
    share_progress: Optional[bool] = None
    analytics: Optional[bool] = None
    cognee_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None


class AuthLoginRequest(BaseModel):
    email: str
    password: Optional[str] = None
    provider: str = "credentials"
    name: Optional[str] = None
    avatar: Optional[str] = None


class AuthLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User
