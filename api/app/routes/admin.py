"""Admin & RBAC Router — management endpoints for Summa AI platform monitoring,
role assignment, account status, usage telemetry, and security audit logs.
"""

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.config import settings
from app.core.rbac import UserRole, require_admin
from app.services.user_store import UserStore
from app.services.supabase_auth import SupabaseAuthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

_system_settings: Dict[str, Any] = {
    "platform_name": "Summa AI",
    "default_currency": "NGN",
    "maintenance_mode": False,
    "websocket_enabled": True,
    "hybrid_memory_enabled": True,
    "summastudy_enabled": False,
}


class UpdateRoleRequest(BaseModel):
    role: str


class UpdateStatusRequest(BaseModel):
    status: str


class CreateUserRequest(BaseModel):
    """Admin-created user — role is ALWAYS server-controlled."""
    name: str
    email: str
    password: str
    institution: Optional[str] = None


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


@router.post("/users", summary="Create or invite new user via Supabase Auth")
async def create_admin_user(
    payload: CreateUserRequest,
    current_user: dict = Depends(require_admin),
):
    """Creates a new user via Supabase Auth and syncs their application profile.

    User creation MUST go through Supabase Auth — no synthetic IDs are manufactured.
    Role is always server-derived — admins cannot assign privileged roles via signup.
    """
    auth_service = SupabaseAuthService()
    try:
        result = await auth_service.signup(
            email=payload.email,
            password=payload.password,
            data={"name": payload.name},
        )
    except Exception as exc:
        logger.error("Supabase signup failed for admin-created user %s: %s", payload.email, exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = (result.get("data") or {}).get("user") or {}
    user_id = user_data.get("id")
    if not user_id:
        logger.error("Supabase returned no user ID for admin-created user %s", payload.email)
        raise HTTPException(status_code=502, detail="Authentication service returned invalid response")

    user_store = UserStore()
    # Role is server-derived — admin-created users get 'user' role by default.
    # Role changes must go through the separate PATCH /admin/users/{id}/role endpoint.
    new_user = {
        "id": user_id,
        "email": payload.email.lower().strip(),
        "name": payload.name,
        "role": "user",
        "status": "active",
        "email_verified": False,
        "onboarded": False,
        "onboarding_data": {"institution": payload.institution or "General"},
    }
    created = await user_store.save_user(user_id, new_user)
    return {"success": True, "user": created}


@router.get("/users/{user_id}", summary="Get detailed user profile and learning metrics")
async def get_admin_user_detail(
    user_id: str,
    current_user: dict = Depends(require_admin),
):
    """Returns full details, learning progress, and session summary for a user."""
    user_store = UserStore()
    user = await user_store.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user": user}


@router.patch("/users/{user_id}/role", summary="Update user RBAC role")
async def update_user_role(
    user_id: str,
    payload: UpdateRoleRequest,
    current_user: dict = Depends(require_admin),
):
    """Updates target user's RBAC role (admin vs user) and records audit trail."""
    new_role = payload.role.lower().strip()
    if new_role not in (UserRole.ADMIN.value, UserRole.USER.value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin' or 'user'.",
        )

    standardized_role = UserRole.ADMIN.value if new_role == "admin" else UserRole.USER.value

    user_store = UserStore()
    actor_id = current_user.get("id", "system")
    updated = await user_store.update_user_role(actor_id, user_id, standardized_role)
    if not updated:
        raise HTTPException(status_code=404, detail="Target user not found")

    logger.info("User %s role updated to %s by admin %s", user_id, standardized_role, actor_id)
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


@router.get("/logs", summary="Get detailed AI request tracking logs & traces")
async def get_tracking_logs(current_user: dict = Depends(require_admin)):
    """Returns real-time AI execution logs with latency, token breakdown, and prompt/response traces."""
    user_store = UserStore()
    logs = await user_store.get_tracking_logs()
    return {"success": True, "logs": logs, "count": len(logs)}


@router.get("/feedback", summary="Get user feedback & quality analysis")
async def get_feedback_analysis(current_user: dict = Depends(require_admin)):
    """Returns satisfaction ratings, positive/negative feedback, and flagged responses."""
    user_store = UserStore()
    feedback = await user_store.get_feedback_analysis()
    return {"success": True, "data": feedback}


@router.get("/system-health", summary="Get AI infrastructure & service health status")
async def get_system_health(current_user: dict = Depends(require_admin)):
    """Returns operational status for LLM engine, Vector DB, DB pool, and Cache."""
    user_store = UserStore()
    health = await user_store.get_system_health()
    return {"success": True, "data": health}


_registered_institutions: List[Dict[str, Any]] = []


class CreateInstitutionRequest(BaseModel):
    name: str
    type: str = "Federal"
    plan: str = "Enterprise"
    domain: Optional[str] = None


@router.get("/institutions", summary="List registered partner institutions")
async def list_institutions(current_user: dict = Depends(require_admin)):
    """Returns registered partner institutions."""
    return {"success": True, "institutions": _registered_institutions, "count": len(_registered_institutions)}


@router.post("/institutions", summary="Register new partner institution")
async def create_institution(
    payload: CreateInstitutionRequest,
    current_user: dict = Depends(require_admin),
):
    """Adds a new institution partner with custom domain and license quota."""
    import uuid
    from datetime import datetime, timezone
    new_inst = {
        "id": f"inst-{uuid.uuid4().hex[:6]}",
        "name": payload.name,
        "type": payload.type,
        "domain": payload.domain,
        "users": 0,
        "active": 0,
        "plan": payload.plan,
        "status": "active",
        "joined": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }
    _registered_institutions.append(new_inst)
    return {"success": True, "institution": new_inst}


class UpdateSettingsRequest(BaseModel):
    platform_name: Optional[str] = None
    default_currency: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    websocket_enabled: Optional[bool] = None
    hybrid_memory_enabled: Optional[bool] = None
    summastudy_enabled: Optional[bool] = None


@router.get("/settings", summary="Get global platform settings & feature flags")
async def get_platform_settings(current_user: dict = Depends(require_admin)):
    """Returns global platform settings, operational switches, and feature flags."""
    _system_settings["websocket_enabled"] = settings.WEBSOCKET_ENABLED
    _system_settings["hybrid_memory_enabled"] = settings.HYBRID_MEMORY_ENABLED
    _system_settings["summastudy_enabled"] = settings.SUMMASTUDY_ENABLED
    return {"success": True, "settings": _system_settings}


@router.patch("/settings", summary="Update global platform settings & feature flags")
async def update_platform_settings(
    payload: UpdateSettingsRequest,
    current_user: dict = Depends(require_admin),
):
    """Updates runtime feature flags (WebSocket, Hybrid Memory, SummaStudy) and platform settings."""
    actor_id = current_user.get("id", "system")
    actor_email = current_user.get("email", "admin@summa.ai")

    updates = payload.model_dump(exclude_unset=True)

    if "websocket_enabled" in updates and updates["websocket_enabled"] is not None:
        settings.WEBSOCKET_ENABLED = bool(updates["websocket_enabled"])
        _system_settings["websocket_enabled"] = settings.WEBSOCKET_ENABLED

    if "hybrid_memory_enabled" in updates and updates["hybrid_memory_enabled"] is not None:
        settings.HYBRID_MEMORY_ENABLED = bool(updates["hybrid_memory_enabled"])
        _system_settings["hybrid_memory_enabled"] = settings.HYBRID_MEMORY_ENABLED

    if "summastudy_enabled" in updates and updates["summastudy_enabled"] is not None:
        settings.SUMMASTUDY_ENABLED = bool(updates["summastudy_enabled"])
        _system_settings["summastudy_enabled"] = settings.SUMMASTUDY_ENABLED

    if "platform_name" in updates and updates["platform_name"]:
        _system_settings["platform_name"] = str(updates["platform_name"])

    if "default_currency" in updates and updates["default_currency"]:
        _system_settings["default_currency"] = str(updates["default_currency"])

    if "maintenance_mode" in updates and updates["maintenance_mode"] is not None:
        _system_settings["maintenance_mode"] = bool(updates["maintenance_mode"])

    # Log to audit trail
    user_store = UserStore()
    user_store._audit_logs.append({
        "id": f"audit-{len(user_store._audit_logs) + 1}",
        "actor_id": actor_id,
        "actor_email": actor_email,
        "action": "SYSTEM_POLICY_UPDATED",
        "target_user_id": "SYSTEM",
        "target_email": "system@summa.ai",
        "details": f"Updated platform settings & feature flags: {updates}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    logger.info("Platform settings updated by admin %s: %s", actor_id, updates)
    return {"success": True, "settings": _system_settings}


class BulkDeleteRequest(BaseModel):
    user_ids: List[str]


class BulkDeletePatternRequest(BaseModel):
    email_pattern: str


@router.post("/users/bulk-delete", summary="Bulk delete users by IDs")
async def bulk_delete_users(
    payload: BulkDeleteRequest,
    current_user: dict = Depends(require_admin),
):
    """Delete multiple users by their IDs from both Supabase Auth and user_profiles."""
    from app.services.supabase_auth import SupabaseAuthService
    from app.services.db_pool import get_pool

    auth_service = SupabaseAuthService()
    pool = await get_pool()
    deleted = []
    errors = []

    for uid in payload.user_ids:
        try:
            # Delete from user_profiles first
            await pool.execute("DELETE FROM summa_ai.user_profiles WHERE id = $1", uid)
            # Delete from Supabase Auth
            await auth_service.admin_delete_user(uid)
            deleted.append(uid)
        except Exception as exc:
            errors.append({"id": uid, "error": str(exc)})
            logger.warning("Failed to delete user %s: %s", uid, exc)

    # Audit log
    user_store = UserStore()
    actor_id = current_user.get("sub", "admin")
    actor_email = current_user.get("email", "admin@summa.ai")
    user_store._audit_logs.append({
        "id": f"audit-{len(user_store._audit_logs) + 1}",
        "actor_id": actor_id,
        "actor_email": actor_email,
        "action": "BULK_USER_DELETE",
        "target_user_id": "MULTIPLE",
        "target_email": "",
        "details": f"Deleted {len(deleted)} users: {deleted}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {"success": True, "deleted": deleted, "errors": errors}


@router.post("/users/delete-by-pattern", summary="Delete users matching email pattern")
async def delete_users_by_pattern(
    payload: BulkDeletePatternRequest,
    current_user: dict = Depends(require_admin),
):
    """Delete all users whose email matches a SQL LIKE pattern (e.g. 'test-%@example.com')."""
    from app.services.supabase_auth import SupabaseAuthService
    from app.services.db_pool import get_pool

    auth_service = SupabaseAuthService()
    pool = await get_pool()

    # Find matching users
    rows = await pool.fetch(
        "SELECT id, email FROM summa_ai.user_profiles WHERE email LIKE $1",
        payload.email_pattern,
    )

    if not rows:
        return {"success": True, "deleted": [], "message": "No users matched the pattern"}

    deleted = []
    errors = []
    for row in rows:
        uid = row["id"]
        try:
            await pool.execute("DELETE FROM summa_ai.user_profiles WHERE id = $1", uid)
            await auth_service.admin_delete_user(uid)
            deleted.append({"id": uid, "email": row["email"]})
        except Exception as exc:
            errors.append({"id": uid, "email": row["email"], "error": str(exc)})
            logger.warning("Failed to delete user %s: %s", uid, exc)

    # Audit log
    user_store = UserStore()
    actor_id = current_user.get("sub", "admin")
    actor_email = current_user.get("email", "admin@summa.ai")
    user_store._audit_logs.append({
        "id": f"audit-{len(user_store._audit_logs) + 1}",
        "actor_id": actor_id,
        "actor_email": actor_email,
        "action": "PATTERN_USER_DELETE",
        "target_user_id": "MULTIPLE",
        "target_email": "",
        "details": f"Pattern '{payload.email_pattern}': deleted {len(deleted)} users",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {"success": True, "deleted": deleted, "errors": errors}

