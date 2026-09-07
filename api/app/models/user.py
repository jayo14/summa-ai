"""User & Settings models."""

from datetime import datetime
from typing import Any, Dict, Literal, Optional, Union
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Password policy — single source of truth, matches Supabase defaults
# ---------------------------------------------------------------------------
MIN_PASSWORD_LENGTH = 6


class User(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    provider: Optional[str] = None
    email_verified: bool = False
    role: str = "user"
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


# ---------------------------------------------------------------------------
# Auth request/response models
# ---------------------------------------------------------------------------

class AuthSignupRequest(BaseModel):
    """Signup request — role is NEVER accepted from the client."""
    email: str
    password: str
    name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("Invalid email address")
        return v


class CredentialsLoginRequest(BaseModel):
    """Credentials login — email + password only. No provider field."""
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class OAuthCallbackRequest(BaseModel):
    """OAuth token exchange — accepts an id_token from a Supabase OAuth flow."""
    provider: str
    id_token: str
    access_token: Optional[str] = None


class AuthSessionResponse(BaseModel):
    """Returned when authentication succeeds and a session exists."""
    status: Literal["authenticated"] = "authenticated"
    access_token: str
    token_type: str = "bearer"
    user: User


class AuthVerificationRequiredResponse(BaseModel):
    """Returned when signup succeeds but email verification is pending."""
    status: Literal["verification_required"] = "verification_required"
    user: User


AuthLoginResponse = Union[AuthSessionResponse, AuthVerificationRequiredResponse]


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordRequest(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
        return v


class VerifyOtpRequest(BaseModel):
    email: str
    token: str
    type: str = "signup"

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class ResendOtpRequest(BaseModel):
    email: str
    type: str = "signup"

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class VerifyTokenRequest(BaseModel):
    """Request to verify a Supabase access token (e.g. from email confirmation callback)."""
    access_token: str
