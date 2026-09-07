"""User service — canonical profile synchronization with Supabase Auth.

Single source of truth for application profile data.
Authentication-owned fields come from Supabase.
Application-owned fields are preserved across logins.
Roles are server-controlled via derive_initial_role().
"""

import logging
from typing import Any, Dict, Optional

from app.services.user_store import UserStore
from app.core.rbac import derive_initial_role

logger = logging.getLogger(__name__)

# Field ownership definitions — used for filtering updates
AUTH_OWNED_FIELDS = frozenset({"id", "email", "email_verified", "provider"})

APPLICATION_OWNED_FIELDS = frozenset({
    "name", "avatar", "bio", "status",
    "onboarded", "onboarding_data", "preferences", "subscription",
})


class UserService:
    def __init__(self):
        self.user_store = UserStore()

    async def sync_user_profile(self, supabase_user: Dict[str, Any]) -> Dict[str, Any]:
        """Synchronize application profile with Supabase user data.

        This is the CANONICAL function for profile creation and updates.
        Called after every successful authentication event (signup, login, OTP, token verification).

        Invariants:
        - Requires a real Supabase user ID (never manufactures identities)
        - Preserves all application-owned fields
        - Never overwrites user-edited name, avatar, bio, etc.
        - Role is server-controlled (derive_initial_role for new users)
        - email_verified comes ONLY from Supabase (never defaults to True)
        """
        # Require real Supabase user ID
        supabase_user_id = supabase_user.get("id")
        if not supabase_user_id:
            logger.error("Missing Supabase user ID in sync_user_profile")
            raise ValueError("Supabase user ID is required")

        # Extract email
        email = (supabase_user.get("email") or "").lower().strip()
        if not email:
            logger.error("Missing email for Supabase user %s", supabase_user_id)
            raise ValueError("Email is required")

        # Read existing application profile
        existing_profile = await self.user_store.get_user_by_id(supabase_user_id)

        # Determine email verification state from Supabase data ONLY
        email_verified = bool(
            supabase_user.get("email_confirmed_at")
            or supabase_user.get("confirmed_at")
        )

        # Determine provider
        provider = supabase_user.get("app_metadata", {}).get("provider", "credentials")

        # Build user object with proper field ownership
        user_obj: Dict[str, Any] = {
            "id": supabase_user_id,
            "email": email,
            # Auth-owned fields — always from Supabase
            "email_verified": email_verified,
            "provider": provider,
            # Application-owned fields — preserve existing, fallback to metadata, then default
            "name": self._resolve_field("name", supabase_user, existing_profile),
            "avatar": self._resolve_field("avatar", supabase_user, existing_profile),
            "bio": self._resolve_field("bio", supabase_user, existing_profile, default=""),
            "onboarded": self._resolve_field("onboarded", supabase_user, existing_profile, default=False),
            "onboarding_data": self._resolve_field("onboarding_data", supabase_user, existing_profile, default={}),
            "status": self._resolve_field("status", supabase_user, existing_profile, default="active"),
        }

        # Role — server-controlled, never from client
        if existing_profile and existing_profile.get("role"):
            # Preserve existing role (admin can change it)
            user_obj["role"] = existing_profile["role"]
        else:
            # New user — derive from email
            user_obj["role"] = derive_initial_role(email)

        # Save to UserStore (handles DB upsert and local caching)
        saved = await self.user_store.save_user(supabase_user_id, user_obj)
        fresh = await self.user_store.get_user_by_id(supabase_user_id) or saved

        logger.debug("Synced profile for user %s", supabase_user_id)
        return self.user_store.serialize_user(fresh)

    def _resolve_field(
        self,
        field_name: str,
        supabase_user: Dict[str, Any],
        existing_profile: Optional[Dict[str, Any]],
        default: Any = None,
    ) -> Any:
        """Resolve an application-owned field value.

        Priority:
        1. Existing profile value (preserves user edits and admin changes)
        2. Supabase user_metadata value (initial signup data)
        3. Default value
        """
        if existing_profile and existing_profile.get(field_name) is not None:
            return existing_profile[field_name]

        user_metadata = supabase_user.get("user_metadata", {})
        if field_name in user_metadata and user_metadata[field_name] is not None:
            return user_metadata[field_name]

        return default

    async def get_profile_by_supabase_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get application profile by Supabase user ID."""
        user = await self.user_store.get_user_by_id(user_id)
        if user:
            return self.user_store.serialize_user(user)
        return None

    async def update_application_fields(
        self,
        user_id: str,
        updates: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update application-owned fields only.

        Filters out any auth-owned fields to prevent injection.
        """
        app_updates = {
            k: v for k, v in updates.items()
            if k in APPLICATION_OWNED_FIELDS
        }

        if not app_updates:
            logger.warning("No application-owned fields to update for user %s", user_id)
            return None

        updated = await self.user_store.update_user(user_id, app_updates)
        if updated:
            return self.user_store.serialize_user(updated)
        return None
