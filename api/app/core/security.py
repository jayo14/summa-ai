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

# ---------------------------------------------------------------------------
# JWKS cache — fetched once per process, refreshed on key miss
# ---------------------------------------------------------------------------
_jwks_cache: Optional[Dict] = None


async def _fetch_jwks() -> Optional[Dict]:
    """Fetch Supabase's public JWKS and cache it in-process."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    if not settings.SUPABASE_URL:
        return None

    jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    try:
        import httpx

        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(jwks_url)
            if resp.status_code == 200:
                _jwks_cache = resp.json()
                return _jwks_cache
    except Exception as exc:
        logger.warning("Failed to fetch Supabase JWKS from %s: %s", jwks_url, exc)
    return None


current_user_claims: ContextVar[Optional[Dict]] = ContextVar("current_user_claims", default=None)


def verify_supabase_jwt(token: str) -> Optional[str]:
    """
    Verify a Supabase JWT and return the user's ``sub`` claim on success.
    Also stores payload claims in contextvar.
    """
    if not token or token in ("null", "undefined") or len(token.split(".")) != 3:
        return None

    try:
        header = pyjwt.get_unverified_header(token)
    except Exception as exc:
        logger.warning("Failed to decode JWT header: %s", exc)
        return None

    alg = header.get("alg", "")
    if alg == "none":
        logger.warning("Rejected JWT with alg: none")
        return None

    payload = None
    # 1. HS256 verification via SUPABASE_JWT_SECRET
    if alg == "HS256":
        if not settings.SUPABASE_JWT_SECRET:
            logger.warning("Received HS256 JWT but SUPABASE_JWT_SECRET is not set")
            return None
        try:
            payload = pyjwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            aud = payload.get("aud")
            if aud and aud not in ("authenticated", "anon"):
                logger.warning("Rejected JWT with invalid aud: %s", aud)
                return None
        except pyjwt.ExpiredSignatureError:
            logger.warning("JWT has expired (HS256)")
            return None
        except Exception as exc:
            logger.warning("JWT HS256 decode error: %s", exc)
            return None

    # 2. RS256 / ES256 verification via JWKS
    elif alg in ("RS256", "ES256"):
        from app.core.jwks import get_cached_jwks, invalidate_jwks_cache

        jwks = get_cached_jwks()
        if not jwks:
            logger.warning("JWKS not cached; cannot verify asymmetric JWT '%s'", alg)
            return None

        kid = header.get("kid")
        keys = jwks.get("keys", [])
        matching_key = None
        for k in keys:
            if kid is None or k.get("kid") == kid:
                matching_key = k
                break

        if matching_key is None:
            # kid not in cache — treat as possible key rotation, invalidate so
            # the next request triggers a fresh fetch via ensure_jwks_loaded().
            invalidate_jwks_cache()
            logger.warning("JWT kid '%s' not found in JWKS; cache invalidated for refresh", kid)
            return None

        try:
            # PyJWK is the canonical high-level key loader in PyJWT >= 2.4.
            # It handles EC/RSA/OKP internally and doesn't require calling
            # algorithm classes directly, which vary by PyJWT version.
            jwk_obj = pyjwt.PyJWK(matching_key)
            payload = pyjwt.decode(
                token,
                jwk_obj,
                algorithms=[alg],
                options={"verify_aud": False},
            )
        except pyjwt.ExpiredSignatureError:
            logger.warning("JWT has expired (asymmetric)")
            return None
        except Exception as exc:
            logger.warning("JWT asymmetric decode error: %s", exc)
            return None

    if payload and isinstance(payload, dict):
        user_id = payload.get("sub")
        current_user_claims.set(payload)
        return user_id

    # Reached only for algorithms that are neither HS256 nor RS256/ES256
    logger.warning(
        "verify_supabase_jwt: unrecognised algorithm '%s' — token rejected. "
        "Expected HS256 (symmetric) or RS256/ES256 (JWKS). "
        "Check SUPABASE_JWT_SECRET and SUPABASE_URL.",
        alg,
    )
    return None


async def load_jwks_at_startup() -> None:
    """Eagerly fetch Supabase JWKS during app startup so the first request
    doesn't have to wait for an async HTTP call."""
    from app.core.jwks import fetch_jwks
    await fetch_jwks()


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
        for user_id, conns in list(self._connections.items()):
            for ws in list(conns):
                try:
                    await ws.send_json(message)
                except Exception:
                    self.disconnect(ws, user_id)

    def get_online_count(self) -> int:
        return sum(len(c) for c in self._connections.values())
