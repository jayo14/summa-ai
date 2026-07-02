"""Security, JWT verification, and WebSocket utilities."""
from contextvars import ContextVar
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException
from app.config import settings
import logging
from typing import Dict, List
from fastapi import WebSocket

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)
current_user_id: ContextVar[Optional[str]] = ContextVar("current_user_id", default=None)

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    return jwt.encode({"exp": expire, "sub": subject}, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_access_token(token: str) -> Optional[str]:
    try: return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]).get("sub")
    except JWTError: return None

def resolve_user_id() -> str:
    user_id = current_user_id.get()
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user_id

def set_current_user_id(user_id: Optional[str]):
    token = None
    if user_id:
        token = current_user_id.set(user_id)
    return token

def reset_current_user_id(token):
    if token is not None:
        current_user_id.reset(token)

def hash_password(password: str) -> str: return pwd_context.hash(password)
def verify_password(plain: str, hashed: str) -> bool: return pwd_context.verify(plain, hashed)

class ConnectionManager:
    def __init__(self): self._connections: Dict[str, List[WebSocket]] = {}
    async def connect(self, ws: WebSocket, user_id: str):
        await ws.accept(); self._connections.setdefault(user_id, []).append(ws)
    def disconnect(self, ws: WebSocket, user_id: str):
        conns = self._connections.get(user_id, [])
        if ws in conns: conns.remove(ws)
        if not conns: self._connections.pop(user_id, None)
    async def send_to_user(self, user_id: str, message: dict):
        for ws in list(self._connections.get(user_id, [])):
            try: await ws.send_json(message)
            except: self.disconnect(ws, user_id)
    def get_online_count(self) -> int: return sum(len(c) for c in self._connections.values())
