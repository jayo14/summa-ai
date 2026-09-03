"""Admin & RBAC Router — management endpoints for Summa AI platform monitoring,
role assignment, account status, usage telemetry, and security audit logs.
"""

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.rbac import require_admin, require_instructor
from app.services.user_store import UserStore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


class UpdateRoleRequest(BaseModel):
    role: str


class UpdateStatusRequest(BaseModel):
    status: str


@router.get("/stats", summary="Get platform usage statistics & telemetry")
async def get_admin_stats(current_user: dict = Depends(require_admin)):
    """Returns aggregate application metrics, DAU, token usage, latency, and popular learning topics."""
    user_store = UserStore()
    stats = await user_store.get_admin_stats()
    return {"success": True, "data": stats}


@router.get("/users", summary="List all registered users with roles & status")
async def list_admin_users(current_user: dict = Depends(require_admin)):
    """Returns all registered users with RBAC roles, onboarding degree data, and activity timestamps."""
    user_store = UserStore()
    users = await user_store.list_all_users()
    return {"success": True, "users": users, "count": len(users)}


@router.patch("/users/{user_id}/role", summary="Update user RBAC role")
async def update_user_role(
    user_id: str,
    payload: UpdateRoleRequest,
    current_user: dict = Depends(require_admin),
):
    """Updates target user's RBAC role (admin, instructor, student) and records audit trail."""
    new_role = payload.role.lower().strip()
    if new_role not in ("admin", "instructor", "student"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin', 'instructor', or 'student'.",
        )

    user_store = UserStore()
    actor_id = current_user.get("id", "system")
    updated = await user_store.update_user_role(actor_id, user_id, new_role)
    if not updated:
        raise HTTPException(status_code=404, detail="Target user not found")

    logger.info("User %s role updated to %s by admin %s", user_id, new_role, actor_id)
    return {"success": True, "user": updated}


@router.patch("/users/{user_id}/status", summary="Update user account status (active/suspended)")
async def update_user_status(
    user_id: str,
    payload: UpdateStatusRequest,
    current_user: dict = Depends(require_admin),
):
    """Activates or suspends a target user account."""
    new_status = payload.status.lower().strip()
    if new_status not in ("active", "suspended"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'active' or 'suspended'.",
        )

    user_store = UserStore()
    actor_id = current_user.get("id", "system")
    updated = await user_store.update_user_status(actor_id, user_id, new_status)
    if not updated:
        raise HTTPException(status_code=404, detail="Target user not found")

    logger.info("User %s status updated to %s by admin %s", user_id, new_status, actor_id)
    return {"success": True, "user": updated}


@router.get("/audit-logs", summary="List RBAC & security audit logs")
async def list_audit_logs(current_user: dict = Depends(require_admin)):
    """Returns security audit log history."""
    user_store = UserStore()
    logs = user_store.get_audit_logs()
    return {"success": True, "audit_logs": logs, "count": len(logs)}
