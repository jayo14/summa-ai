"""Server-side Fernet encryption for API keys stored in the database.

The encryption key is derived from the MODEL_KEY_ENCRYPTION_KEY env var.
If not set, a key is auto-generated on first run and persisted to a file
so it survives restarts. This is acceptable for development; production
should set the env var explicitly.
"""

from __future__ import annotations

import base64
import hashlib
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

_KEY_FILE = Path(__file__).resolve().parent.parent.parent / ".model_encryption_key"


def _get_or_create_key() -> bytes:
    raw = os.getenv("MODEL_KEY_ENCRYPTION_KEY", "")
    if raw:
        # Derive a valid Fernet key (32 url-safe base64-encoded bytes)
        return base64.urlsafe_b64encode(hashlib.sha256(raw.encode()).digest())

    # Try loading from file
    if _KEY_FILE.exists():
        return _KEY_FILE.read_bytes().strip()

    # Generate and persist
    from cryptography.fernet import Fernet
    key = Fernet.generate_key()
    _KEY_FILE.write_bytes(key)
    logger.info("Generated new model encryption key at %s", _KEY_FILE)
    return key


_fernet_key: bytes | None = None


def _fernet():
    global _fernet_key
    if _fernet_key is None:
        _fernet_key = _get_or_create_key()
    from cryptography.fernet import Fernet
    return Fernet(_fernet_key)


def encrypt_api_key(plaintext: str) -> str:
    """Encrypt a plaintext API key. Returns base64-encoded ciphertext."""
    if not plaintext:
        return ""
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt_api_key(ciphertext: str) -> str:
    """Decrypt an encrypted API key. Returns plaintext."""
    if not ciphertext:
        return ""
    try:
        return _fernet().decrypt(ciphertext.encode()).decode()
    except Exception as exc:
        logger.warning("Failed to decrypt API key: %s", exc)
        return ""
