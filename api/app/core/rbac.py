"""Summa AI Role-Based Access Control (RBAC) System.

Defines user roles, permission checks, and FastAPI dependencies.

Roles are SERVER-CONTROLLED. Clients never select roles.
The only exception is the INITIAL_ADMIN_EMAIL env var bootstrap.
"""

import logging
import os
from enum import Enum
from typing import List
from fastapi import Depends, HTTPException, Request, status

from app.services.user_store import UserStore

logger = logging.getLogger(__name__)


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"


def get_user_role(user: dict) -> str:
    """Determine role from stored profile data only.

    Roles are derived from:
    1. The role field in the application profile (set by admin or sync)
    2. INITIAL_ADMIN_EMAIL env var for bootstrap

    The client NEVER selects roles.
    """
    if not user:
        return UserRole.USER.value

    # Check explicit role field in stored profile
    explicit_role = str(user.get("role", "")).lower().strip()
    if explicit_role == UserRole.ADMIN.value:
        return UserRole.ADMIN.value

    # Only INITIAL_ADMIN_EMAIL can bootstrap admin access
    email = (user.get("email") or "").lower().strip()
    initial_admin = (os.getenv("INITIAL_ADMIN_EMAIL") or "").lower().strip()
    if initial_admin and email and email == initial_admin:
        return UserRole.ADMIN.value

    return UserRole.USER.value


def derive_initial_role(email: str) -> str:
    """Determine the initial role for a newly created user.

    Called during profile sync. Only INITIAL_ADMIN_EMAIL gets admin.
    All other users get 'user'. The client never controls this.
    """
    email_clean = (email or "").lower().strip()
    initial_admin = (os.getenv("INITIAL_ADMIN_EMAIL") or "").lower().strip()
    if initial_admin and email_clean and email_clean == initial_admin:
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

    # Role is always resolved from the stored profile — never from the request
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
