"""Summa AI Role-Based Access Control (RBAC) System.
Defines user roles (admin, instructor, student), permission checks, and FastAPI dependencies.
"""

import logging
from enum import Enum
from typing import List, Optional
from fastapi import Depends, HTTPException, Request, status

from app.services.user_store import UserStore

logger = logging.getLogger(__name__)


class UserRole(str, Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"


class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"


def get_user_role(user: dict) -> str:
    """Extracts or infers role for a user dict."""
    if not user:
        return UserRole.STUDENT.value

    # Check explicit role field first
    explicit_role = user.get("role")
    if explicit_role and explicit_role in [r.value for r in UserRole]:
        return explicit_role

    # Default admin emails or fallback
    email = (user.get("email") or "").lower()
    if "admin" in email or email in ("alex@summa.ai", "admin@summa.ai", "codegallantx@gmail.com"):
        return UserRole.ADMIN.value

    return UserRole.STUDENT.value


async def get_current_user_with_role(request: Request) -> dict:
    """Dependency that fetches the active user and attaches role & status."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        # Fallback for dev mode
        user_id = "119f677f-cd51-526d-acf3-3bd68d95b57b"

    user_store = UserStore()
    user = await user_store.get_user_by_id(user_id)
    if not user:
        user = {
            "id": user_id,
            "email": "admin@summa.ai",
            "name": "Admin User",
            "role": UserRole.ADMIN.value,
            "status": UserStatus.ACTIVE.value,
        }

    user["role"] = get_user_role(user)
    user["status"] = user.get("status", UserStatus.ACTIVE.value)

    if user["status"] == UserStatus.SUSPENDED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended. Please contact system administrator.",
        )

    return user


def require_roles(allowed_roles: List[UserRole]):
    """FastAPI dependency factory enforcing specified RBAC roles."""

    async def role_checker(current_user: dict = Depends(get_current_user_with_role)):
        user_role = current_user.get("role", UserRole.STUDENT.value)
        allowed_str = [r.value if isinstance(r, UserRole) else str(r) for r in allowed_roles]

        if user_role not in allowed_str:
            logger.warning(
                "Access denied for user %s (%s). Required role in %s, got %s",
                current_user.get("id"),
                current_user.get("email"),
                allowed_str,
                user_role,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires one of roles {allowed_str}",
            )
        return current_user

    return role_checker


require_admin = require_roles([UserRole.ADMIN])
require_instructor = require_roles([UserRole.ADMIN, UserRole.INSTRUCTOR])
