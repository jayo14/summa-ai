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
    USER = "user"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"


import os

def get_user_role(user: dict) -> str:
    """Extracts role for a user dict based strictly on stored role or INITIAL_ADMIN_EMAIL env var."""
    if not user:
        return UserRole.USER.value

    # Check explicit role field first
    explicit_role = str(user.get("role", "")).lower().strip()
    if explicit_role == UserRole.ADMIN.value:
        return UserRole.ADMIN.value
    if explicit_role in (UserRole.USER.value, "student", "instructor"):
        return UserRole.USER.value

    # Optional initial admin bootstrap via environment variable
    email = (user.get("email") or "").lower().strip()
    initial_admin = (os.getenv("INITIAL_ADMIN_EMAIL") or "").lower().strip()
    if initial_admin and email and email == initial_admin:
        return UserRole.ADMIN.value

    return UserRole.USER.value


async def get_current_user_with_role(request: Request) -> dict:
    """Dependency that fetches the active user and attaches role & status."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    user_store = UserStore()
    user = await user_store.get_user_by_id(str(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

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
        user_role = current_user.get("role", UserRole.USER.value)
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
require_user = require_roles([UserRole.ADMIN, UserRole.USER])
