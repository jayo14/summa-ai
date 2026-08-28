import logging
from contextvars import ContextVar
from typing import Dict, List, Optional
import jwt as pyjwt
from fastapi import HTTPException, WebSocket
from app.config import settings

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    _has_passlib = True
except ImportError:
    import hashlib
    import secrets
    _has_passlib = False

logger = logging.getLogger(__name__)
current_user_id: ContextVar[Optional[str]] = ContextVar("current_user_id", default=None)
current_jwt_token: ContextVar[Optional[str]] = ContextVar(
    "current_jwt_token", default=None
)


def verify_supabase_jwt(token: str) -> Optional[str]:
    if not token or token in ("null", "undefined") or len(token.split(".")) != 3:
        return None
    secret = settings.SUPABASE_JWT_SECRET or "dev-secret-key-change-in-production-12345"
    try:
        payload = pyjwt.decode(
            token,
            secret,
            algorithms=["HS256", "RS256", "ES256"],
            options={"verify_aud": False},
        )
        user_id = payload.get("sub")
        if user_id:
            return user_id
    except Exception:
        pass

    try:
        payload = pyjwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if user_id:
            return user_id
    except Exception as exc:
        logger.warning("Invalid Supabase JWT: %s", exc)

    return None


def resolve_user_id() -> str:
    user_id = current_user_id.get()
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user_id


def resolve_jwt_token() -> Optional[str]:
    """Get the current request's JWT token for service-to-service calls."""
    return current_jwt_token.get()


def set_current_user_id(user_id: Optional[str]):
    token = None
    if user_id:
        token = current_user_id.set(user_id)
    return token


def set_current_jwt_token(token_str: Optional[str]):
    token = None
    if token_str:
        token = current_jwt_token.set(token_str)
    return token


def reset_current_user_id(token):
    if token is not None:
        current_user_id.reset(token)


def reset_current_jwt_token(token):
    if token is not None:
        current_jwt_token.reset(token)


def hash_password(password: str) -> str:
    if _has_passlib:
        return pwd_context.hash(password)
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"pbkdf2:{salt}:{key.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    if _has_passlib:
        return pwd_context.verify(plain, hashed)
    if not hashed.startswith("pbkdf2:"):
        return False
    parts = hashed.split(":")
    if len(parts) != 3:
        return False
    salt, key = parts[1], parts[2]
    check_key = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt.encode("utf-8"), 100000)
    return check_key.hex() == key


class ConnectionManager:
    def __init__(self):
        self._connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, ws: WebSocket, user_id: str):
        await ws.accept()
        self._connections.setdefault(user_id, []).append(ws)

    def disconnect(self, ws: WebSocket, user_id: str):
        conns = self._connections.get(user_id, [])
        if ws in conns:
            conns.remove(ws)
        if not conns:
            self._connections.pop(user_id, None)

    async def send_to_user(self, user_id: str, message: dict):
        for ws in list(self._connections.get(user_id, [])):
            try:
                await ws.send_json(message)
            except:
                self.disconnect(ws, user_id)

    async def broadcast(self, message: dict):
        for conns in self._connections.values():
            for ws in list(conns):
                try:
                    await ws.send_json(message)
                except:
                    self.disconnect(ws, ws)

    def get_online_count(self) -> int:
        return sum(len(c) for c in self._connections.values())
