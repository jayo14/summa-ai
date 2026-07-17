# Summa AI — Security Report

## Critical

### 1. Live-looking API credentials hardcoded in source at `apps/api/app/routes/chat.py:17-19`

```python
ZAI_API_KEY = "Z.ai"
ZAI_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...pWpT01NAB2O82ch_exOjca4k6dwbRCAtfi6NSZRs-E4"
ZAI_USER_ID = "bcceee70-68ac-453c-a452-4402bef78c31"
```

This is a decoded-JWT-shaped bearer token, a user ID, and an API key literally committed to the repository and used directly in an `Authorization`/`X-Token` header against `https://internal-api.z.ai/v1`. Regardless of whether this specific token is still valid:

- **If this repository is public or becomes public, this token is exposed to anyone.**
- Even in a private repo, it's exposed to every collaborator, every AI coding agent given repo access, and every backup/clone, with no rotation mechanism since it isn't an env var.
- This should be treated as compromised now — rotate/revoke it at the Z.ai side regardless of what else happens — and moved to an environment variable immediately, not as part of a larger refactor.

**This is the single highest-priority item across both repos in this entire audit round.** Fix this before anything else, including before running any other prompt in this pack.

### 2. `JWT_SECRET_KEY` defaults to a placeholder with no production guard

`config.py`: `JWT_SECRET_KEY: str = "change-me-in-production"`. The `is_production` property exists but nothing in the codebase checks `JWT_SECRET_KEY != "change-me-in-production"` and refuses to boot in production if it hasn't been overridden. If this service is ever deployed with the default `.env` (or no `.env`), every issued token is forgeable by anyone who reads this file — which, per finding #1, they may already have reason to.

## High

### 3. Two disconnected identity systems
NextAuth (frontend, Google OAuth) and a self-issued JWT backend with no confirmed bridge between them. Until traced, assume a student could have a valid frontend session with no corresponding valid backend identity, or vice versa — an inconsistent auth state is itself a security-relevant gap (unclear enforcement boundary), independent of whether it's currently exploitable.

### 4. Silent failure on LLM stream errors
`_stream_zai`'s exception handler swallows the real error and streams a generic canned response instead. This isn't a vulnerability by itself, but it actively hides the signal you'd want if credential rotation (per #1) or an outage were happening — a masked failure mode makes incident detection slower right when you need it fastest.

## Medium

- **In-memory Cognee fallback activates silently** whenever `COGNEE_API_KEY` is unset, with no environment guard preventing this in production — a student's "persistent memory" would silently stop persisting across restarts with no error surfaced anywhere.
- **No dependency vulnerability scan performed** in this pass (same caveat as the SummaStudy report).

## Immediate action, in order

1. Rotate/revoke the Z.ai token today, independent of any other work.
2. Move `ZAI_API_KEY`, `ZAI_TOKEN`, `ZAI_USER_ID`, and `ZAI_API_BASE` into environment variables, reading through the existing `Settings` class in `config.py` rather than as module-level literals.
3. Add a startup check that refuses to run with `JWT_SECRET_KEY == "change-me-in-production"` when `is_production` is true.
4. Only after 1-3: proceed to the architecture/integration work in `INTEGRATION_STRATEGY.md`.
