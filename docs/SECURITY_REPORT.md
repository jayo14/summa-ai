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

### 2. `JWT_SECRET_KEY` defaults to a placeholder with no production guard — ✅ **Fully resolved in Milestone 3**

`config.py` previously had `JWT_SECRET_KEY: str = "change-me-in-production"`. **The entire self-issued JWT system has been replaced** with Supabase Auth in Milestone 3. The backend now verifies Supabase JWTs using `SUPABASE_JWT_SECRET` (configured via environment variable). `JWT_SECRET_KEY`, `JWT_ALGORITHM`, and `ACCESS_TOKEN_EXPIRE_MINUTES` have been removed from `config.py`, `.env.example`, and production env configs. This finding's root cause — self-issued JWTs with no rotation mechanism — no longer exists.

## High

### 3. Two disconnected identity systems
NextAuth (frontend, Google OAuth) and a self-issued JWT backend with no confirmed bridge between them. Until traced, assume a student could have a valid frontend session with no corresponding valid backend identity, or vice versa — an inconsistent auth state is itself a security-relevant gap (unclear enforcement boundary), independent of whether it's currently exploitable.

### 4. Silent failure on LLM stream errors
`_stream_zai`'s exception handler swallows the real error and streams a generic canned response instead. This isn't a vulnerability by itself, but it actively hides the signal you'd want if credential rotation (per #1) or an outage were happening — a masked failure mode makes incident detection slower right when you need it fastest.

## Medium

- **In-memory Cognee fallback activates silently** whenever `COGNEE_API_KEY` is unset, with no environment guard preventing this in production — a student's "persistent memory" would silently stop persisting across restarts with no error surfaced anywhere.
- **No dependency vulnerability scan performed** in this pass (same caveat as the SummaStudy report).

## Follow-up actions (2026-07-17)

1. ✅ Milestone 1: Credentials moved to env vars — Done.
2. ✅ Milestone 1: JWT production guard — Done.
3. ✅ Milestone 2: Provider config aligned with Settings — Done.
4. ✅ **Post-Milestone-2 credential sweep**: Repo-wide grep of apps/api and src/ for additional hardcoded JWT tokens, API keys, bearer tokens, and credential-shaped strings — **No additional findings.** All credential surfaces cleaned.
5. ✅ Milestone 4: LLM error surfacing — `_stream_zai` now emits `{"type":"error"}` events instead of silent happy-path fallback.
6. ✅ Milestone 4: Prompt budget cap — 3k char limit per context section prevents unbounded prompt growth.
7. ✅ Milestone 4: Cognee recall caching — 60s TTL cache avoids redundant API calls.
8. ✅ Milestone 4: Cognee production guard — boot-time hard failure if `COGNEE_API_KEY` missing in production.
9. ⚠️ **Still requires manual action**: Rotate/revoke the old Z.ai token at https://internal-api.z.ai. The code now reads from env vars, but the old committed token may still be valid.

## Immediate action, in order

1. ~~Rotate/revoke the Z.ai token today, independent of any other work.~~ **Manual step — cannot do from code.**
2. ~~Move credentials to environment variables~~ ✅ Done (Milestone 1).
3. ~~Add a startup check for JWT_SECRET_KEY~~ ✅ Done (Milestone 1).
4. ~~Route chat through Settings~~ ✅ Done (Milestone 2).
5. ~~Credential sweep~~ ✅ Done (2026-07-17).
6. ~~Surfaced LLM errors~~ ✅ Done (Milestone 4).
7. ~~Prompt budget cap~~ ✅ Done (Milestone 4).
8. ~~Cognee recall caching~~ ✅ Done (Milestone 4).
9. ~~Cognee production guard~~ ✅ Done (Milestone 4).
10. Proceed to identity/data integration work after token rotation and strategy confirmation.
