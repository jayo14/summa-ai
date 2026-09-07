"""User service — handles application profile data and synchronization with Supabase Auth."""

import logging
from typing import Dict, Optional, Any
import json

from app.services.user_store import UserStore
from app.core.rbac import get_user_role

logger = logging.getLogger(__name__)

# Field ownership definitions
AUTH_OWNED_FIELDS = {
    "id", "email", "email_verified", "provider"
}

APPLICATION_OWNED_FIELDS = {
    "name", "avatar", "bio", "role", "status", "onboarded", "onboarding_data"
}

class UserService:
    def __init__(self):
        self.user_store = UserStore()

    async def sync_user_profile(self, supabase_user: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synchronize application profile with Supabase user data.

        Args:
            supabase_user: User object from Supabase Auth containing:
                - id: Supabase user ID (required)
                - email: User email
                - email_confirmed_at: Email verification timestamp
                - app_metadata: Provider info
                - user_metadata: Name, avatar, etc.

        Returns:
            Canonical application user object
        """
        # Require real Supabase user ID
        supabase_user_id = supabase_user.get("id")
        if not supabase_user_id:
            logger.error("Missing Supabase user ID in user data: %s", supabase_user)
            raise ValueError("Supabase user ID is required")

        # Extract email
        email = supabase_user.get("email", "").lower().strip()
        if not email:
            logger.error("Missing email in Supabase user data for ID: %s", supabase_user_id)
            raise ValueError("Email is required")

        # Read existing application profile
        existing_profile = await self.user_store.get_user_by_id(supabase_user_id)

        # Determine email verification state
        email_verified = bool(
            supabase_user.get("email_confirmed_at") or
            supabase_user.get("confirmed_at")
        )

        # Build user object with proper field ownership
        user_obj = {
            "id": supabase_user_id,
            "email": email,
            # Application-owned fields - preserve existing values
            "name": self._get_application_field(
                "name", supabase_user, existing_profile
            ),
            "avatar": self._get_application_field(
                "avatar", supabase_user, existing_profile
            ),
            "bio": self._get_application_field(
                "bio", supabase_user, existing_profile, default=""
            ),
            # Authentication-owned fields
            "email_verified": email_verified,
            "provider": supabase_user.get("app_metadata", {}).get("provider", "credentials"),
            # Application-owned fields with defaults
            "role": self._get_application_field(
                "role", supabase_user, existing_profile,
                default=get_user_role({"email": email})
            ),
            "status": self._get_application_field(
                "status", supabase_user, existing_profile, default="active"
            ),
            "onboarded": self._get_application_field(
                "onboarded", supabase_user, existing_profile, default=False
            ),
            "onboarding_data": self._get_application_field(
                "onboarding_data", supabase_user, existing_profile, default={}
            ),
        }

        # Save to UserStore (handles DB upsert and local caching)
        saved = await self.user_store.save_user(supabase_user_id, user_obj)
        fresh = await self.user_store.get_user_by_id(supabase_user_id) or saved

        logger.debug("Synced profile for user %s", supabase_user_id)
        return self.user_store.serialize_user(fresh)

    def _get_application_field(
        self,
        field_name: str,
        supabase_user: Dict[str, Any],
        existing_profile: Optional[Dict[str, Any]],
        default: Any = None
    ) -> Any:
        """
        Get application-owned field value, preserving existing application data.

        Priority:
        1. Existing profile value (preserves user edits)
        2. Supabase user_metadata value (if provided)
        3. Default value
        """
        # If we have an existing profile, preserve its value
        if existing_profile and existing_profile.get(field_name) is not None:
            return existing_profile[field_name]

        # Otherwise, try to get from Supabase user_metadata
        user_metadata = supabase_user.get("user_metadata", {})
        if field_name in user_metadata and user_metadata[field_name] is not None:
            return user_metadata[field_name]

        # Fall back to default
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
        updates: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update application-owned fields only.

        Args:
            user_id: Supabase user ID
            updates: Dictionary of fields to update (should only contain application-owned fields)

        Returns:
            Updated user profile or None if user not found
        """
        # Filter to only application-owned fields
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