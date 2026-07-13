"""SQLite-backed user store for auth and onboarding state."""
from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import urlparse

from app.config import settings
from app.core.security import hash_password, verify_password


def _database_path() -> Path:
    parsed = urlparse(settings.DATABASE_URL)
    if parsed.scheme != "sqlite":
        raise RuntimeError("Only sqlite DATABASE_URL values are supported in this hackathon build")
    raw_path = parsed.path or "./db/custom.db"
    if raw_path.startswith("/"):
        raw_path = raw_path[1:]
    path = Path(raw_path)
    if not path.is_absolute():
        path = Path.cwd() / path
    return path


class UserStore:
    _instance: Optional["UserStore"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._db_path = _database_path()
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_schema(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    name TEXT,
                    avatar TEXT,
                    bio TEXT,
                    provider TEXT,
                    password_hash TEXT,
                    onboarded INTEGER NOT NULL DEFAULT 0,
                    onboarding_data TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _serialize(row: sqlite3.Row | Dict[str, Any] | None) -> Optional[Dict[str, Any]]:
        if row is None:
            return None
        data = dict(row)
        onboarding_raw = data.get("onboarding_data") or "{}"
        try:
            onboarding_data = json.loads(onboarding_raw)
        except json.JSONDecodeError:
            onboarding_data = {}
        data["onboarded"] = bool(data.get("onboarded"))
        data["onboarding_data"] = onboarding_data
        data.pop("password_hash", None)
        return data

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return self._serialize(row)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()
        return self._serialize(row)

    def _upsert_user(
        self,
        *,
        email: str,
        name: Optional[str] = None,
        avatar: Optional[str] = None,
        bio: Optional[str] = None,
        provider: str = "credentials",
        password: Optional[str] = None,
    ) -> Dict[str, Any]:
        normalized_email = email.lower().strip()
        existing = self.get_user_by_email(normalized_email)
        now = self._now()

        if existing is None:
            if provider == "credentials" and not password:
                raise ValueError("Password is required for credential sign-in")

            user_id = f"usr-{uuid.uuid4().hex}"
            password_hash = hash_password(password) if password else None
            onboarding_data = json.dumps({})
            with self._connect() as conn:
                conn.execute(
                    """
                    INSERT INTO users (id, email, name, avatar, bio, provider, password_hash, onboarded, onboarding_data, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
                    """,
                    (user_id, normalized_email, name, avatar, bio, provider, password_hash, onboarding_data, now, now),
                )
                conn.commit()
            created = self.get_user_by_id(user_id)
            if created is None:
                raise RuntimeError("Failed to create user")
            return created

        current_password_hash = self._raw_password_hash(existing["id"])
        if provider == "credentials":
            if not password:
                raise ValueError("Password is required for credential sign-in")
            if current_password_hash:
                if not verify_password(password, current_password_hash):
                    raise ValueError("Invalid credentials")
            else:
                self._update_columns(existing["id"], {"password_hash": hash_password(password)})

        updates: Dict[str, Any] = {"provider": provider, "updated_at": now}
        if name is not None:
            updates["name"] = name
        if avatar is not None:
            updates["avatar"] = avatar
        if bio is not None:
            updates["bio"] = bio
        self._update_columns(existing["id"], updates)
        updated = self.get_user_by_id(existing["id"])
        if updated is None:
            raise RuntimeError("Failed to load user after upsert")
        return updated

    def _raw_password_hash(self, user_id: str) -> Optional[str]:
        with self._connect() as conn:
            row = conn.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,)).fetchone()
        if row is None:
            return None
        return row["password_hash"]

    def _update_columns(self, user_id: str, updates: Dict[str, Any]) -> None:
        if not updates:
            return
        columns = ", ".join(f"{key} = ?" for key in updates.keys())
        values = list(updates.values()) + [user_id]
        with self._connect() as conn:
            conn.execute(f"UPDATE users SET {columns} WHERE id = ?", values)
            conn.commit()

    def update_user(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        current = self.get_user_by_id(user_id)
        if current is None:
            raise ValueError("User not found")

        updates: Dict[str, Any] = {"updated_at": self._now()}
        if "email" in data and isinstance(data["email"], str) and data["email"].strip():
            updates["email"] = data["email"].lower().strip()
        for key in ("name", "avatar", "bio"):
            if key in data:
                updates[key] = data[key]
        if "onboarded" in data:
            updates["onboarded"] = 1 if data["onboarded"] else 0
        if "onboarding_data" in data:
            updates["onboarding_data"] = json.dumps(data["onboarding_data"])
        self._update_columns(user_id, updates)
        updated = self.get_user_by_id(user_id)
        if updated is None:
            raise RuntimeError("Failed to update user")
        return updated

    def create_user(self, email: str, password: str, name: Optional[str] = None, avatar: Optional[str] = None) -> Dict[str, Any]:
        normalized = email.lower().strip()
        existing = self.get_user_by_email(normalized)
        if existing:
            raise ValueError("User already exists")
        user_id = f"usr-{uuid.uuid4().hex}"
        now = self._now()
        with self._connect() as conn:
            conn.execute(
                """INSERT INTO users (id, email, name, avatar, bio, provider, password_hash,
                                      onboarded, onboarding_data, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 0, '{}', ?, ?)""",
                (user_id, normalized, name, avatar, None, "credentials",
                 hash_password(password), now, now),
            )
            conn.commit()
        created = self.get_user_by_id(user_id)
        if created is None:
            raise RuntimeError("Failed to create user")
        return created

    def set_onboarding_data(self, user_id: str, data: Dict[str, Any], onboarded: bool = False) -> Dict[str, Any]:
        return self.update_user(user_id, {"onboarding_data": data, "onboarded": onboarded})

    def authenticate_credentials(self, email: str, password: str, name: Optional[str] = None, avatar: Optional[str] = None) -> Dict[str, Any]:
        return self._upsert_user(email=email, password=password, name=name, avatar=avatar, provider="credentials")

    def authenticate_oauth(self, provider: str, email: str, name: Optional[str] = None, avatar: Optional[str] = None) -> Dict[str, Any]:
        return self._upsert_user(email=email, name=name, avatar=avatar, provider=provider)

    def serialize_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name"),
            "avatar": user.get("avatar"),
            "bio": user.get("bio"),
            "provider": user.get("provider"),
            "onboarded": bool(user.get("onboarded")),
            "onboarding_data": user.get("onboarding_data") or {},
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at"),
        }
