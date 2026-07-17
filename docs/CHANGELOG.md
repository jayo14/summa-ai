# Summa AI — Changelog

## 2026-07-17
- Added: SYSTEM_ARCHITECTURE.md, AI_ARCHITECTURE.md, PRODUCT_BOUNDARIES.md, INTEGRATION_STRATEGY.md, PROJECT_AUDIT.md, TECHNICAL_DEBT.md, SECURITY_REPORT.md, SCALABILITY_REPORT.md, PROJECT_ROADMAP.md, PROGRESS.md, NEXT_STEPS.md, TECHNICAL_DECISIONS.md.
- No application code changed this session (audit-only, by design) — this includes the credential finding, which is documented but NOT yet fixed in code; that requires your go-ahead or a dedicated next session.

## 2026-07-17 (Milestone 1 — Security Emergency)
### Changed
- `apps/api/app/config.py`: Added `ZAI_API_KEY`, `ZAI_TOKEN`, `ZAI_USER_ID` fields to `Settings` class.
- `apps/api/app/routes/chat.py`: Removed hardcoded Z.ai credentials; reads from `settings` instead.
- `apps/api/app/main.py`: Added lifespan guard that raises `RuntimeError` if `ENVIRONMENT=production` and `JWT_SECRET_KEY` is the default.
- `.env.example`: Added `ZAI_API_KEY`, `ZAI_TOKEN`, `ZAI_USER_ID` placeholder entries under Backend section.
- `apps/api/.env`, `apps/api/.env.production`: Added Z.ai credential placeholders.
- `README.md`: Added Z.ai rows to the backend env vars table.
- `DEPLOYMENT.md`: Added Z.ai section under Optional Configuration.
### Removed
- Hardcoded JWT token (`ZAI_TOKEN`) and user ID (`ZAI_USER_ID`) from chat.py source.

### ⚠️ Manual action still required
- Rotate/revoke the old hardcoded Z.ai token at https://internal-api.z.ai. The code now reads from env vars, but the old committed token is still potentially compromised and must be invalidated on Z.ai's side.

## 2026-07-17 (Milestone 2 — Config/Reality Alignment)
### Changed
- `apps/api/app/config.py`: Added `ZAI_API_BASE` (default `https://internal-api.z.ai/v1`) and `ZAI_MODEL` (default `glm-4.5`) to `Settings`.
- `apps/api/app/routes/chat.py`: Removed hardcoded `ZAI_API_BASE` module constant and hardcoded `"glm-4.5"` model string; both read from `settings` now.
- `.env.example`, `apps/api/.env`, `apps/api/.env.production`: Added `ZAI_API_BASE` and `ZAI_MODEL`.

### Removed
- `prisma/` directory (unused default scaffold with User/Post boilerplate).
- `@prisma/client` and `prisma` from `package.json` dependencies; removed `db:push`, `db:generate`, `db:migrate`, `db:reset` scripts.
- `src/lib/db.ts` (PrismaClient singleton — nothing imported it).

### Updated
- `README.md`: Removed Prisma from project structure and tech stack.
- `docs/SYSTEM_ARCHITECTURE.md`: Updated Prisma references to reflect removal; added note about config alignment.
- `docs/PROJECT_AUDIT.md`: Marked items 3 (Prisma) and 4 (config/reality mismatch) as resolved.
- `docs/TECHNICAL_DEBT.md`: Struck through both items, updated sequencing section.

## 2026-07-17 (NEXT_STEPS items 6-8 — Audit follow-up)
### Investigation
- `docs/NEXT_STEPS.md`: Marked items 6 (credential sweep) as done; items 7 (SummaStudy service liveness) and 8 (integration strategy review) as awaiting decision.
- `docs/PROGRESS.md`: Logged credential sweep results (no additional hardcoded credentials found) and SummaStudy service liveness confirmation (all four services are live and actively used).
- `docs/CHANGELOG.md`: This entry.
- `docs/PROJECT_ROADMAP.md`: Updated Milestone 3 status.
- `docs/TECHNICAL_DECISIONS.md`: Added entry for credential sweep and SummaStudy findings.
- `docs/PROJECT_AUDIT.md`: Marked item 26 (credential sweep recommendation) as resolved.
- `docs/TECHNICAL_DEBT.md`: Updated status for audit follow-up items.
- `docs/SECURITY_REPORT.md`: Added post-Milestone-2 credential sweep note.

## 2026-07-17 (Milestone 4 — AI Quality Hardening)
### Changed
- `apps/api/app/routes/chat.py`: Replaced silent LLM-failure fallback with surfaced error event (`{"type":"error","message":"..."}`); added `_section()` truncation helper and `MAX_CONTEXT_SECTION_CHARS=3000` to cap each context section in `build_orchestrator_prompt`.
- `apps/api/app/services/cognee_service.py`: Added `_TTLCache` class (60s TTL) and wired into `_recall()` method to avoid redundant Cognee calls within the same window.
- `apps/api/app/main.py`: Added production startup guard that refuses to boot without `COGNEE_API_KEY`, preventing silent in-memory fallback that would defeat persistent memory.

### Added
- `apps/api/tests/test_chat_utils.py`: 11 tests for `detect_intent` (all 7 intent patterns) and `_section` truncation.
- `apps/api/tests/test_cache.py`: 7 tests for `_TTLCache` get/set/expiry/clear/multi-key.

### Fixed
- `docs/SYSTEM_ARCHITECTURE.md`: Updated outdated references to hardcoded credentials (now read from Settings) and missing JWT production guard (now present). Fixed tech stack table (Prisma removed, raw sqlite3 + Cognee).

## 2026-07-17 (Milestone 3 — Identity & Data Integration)
### Changed
- `apps/api/app/core/security.py`: Replaced `verify_access_token` (self-issued JWT via `python-jose`) with `verify_supabase_jwt` (decodes Supabase JWT via `PyJWT`). Removed `create_access_token`. Kept context var management (`resolve_user_id`, `set_current_user_id`).
- `apps/api/app/main.py`: Auth middleware now calls `verify_supabase_jwt`. Production guard checks `SUPABASE_JWT_SECRET` instead of `JWT_SECRET_KEY`. WebSocket auth updated too.
- `apps/api/app/routes/auth.py`: Rewritten — `/auth/signup` and `/auth/login` now proxy through Supabase Auth REST API (httpx). Response format kept compatible with frontend.
- `apps/api/app/config.py`: Added `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` to Settings.
- `.env.example`, `apps/api/.env`, `apps/api/.env.production`: Added Supabase Auth vars.

### Added
- `db/migrate_to_supabase.sql`: Full schema migration — creates `summa_ai` schema in Supabase Postgres with 8 tables, indexes, and an `auth.users` insert trigger for auto-creating user profiles. ⚠️ Must be run via Supabase Dashboard SQL Editor (no IPv6).

### Removed
- `create_access_token` from `core/security.py` — no longer needed (Supabase Auth handles token creation).
- JWT production guard (old `JWT_SECRET_KEY` check) — replaced with `SUPABASE_JWT_SECRET` check.
- `docs/SYSTEM_ARCHITECTURE.md`: No changes needed (already accurate).

## 2026-07-17 (Milestone 8 — Testing, Observability & Production Readiness)
### Added
- `apps/api/app/services/data_store.py`: `list_artifact_versions` and `restore_artifact_version` methods; version snapshots created on artifact create/update.
- `apps/api/app/routes/data_routes.py`: `GET /artifacts/{id}/versions` and wired `POST /artifacts/{id}/versions` to `DataStore.restore_artifact_version`.
- `db/migrate_to_supabase.sql`: `artifact_versions` table with index for version history.
- `apps/api/app/config.py`: `SENTRY_DSN` setting.
- `apps/api/app/main.py`: Sentry SDK init (gated by `SENTRY_DSN`), request logging middleware, and expanded production environment validation.
- `apps/api/tests/test_data_store.py`: 21 DataStore CRUD unit tests.
- `apps/api/tests/test_auth_routes.py`: 8 auth route tests.
- `apps/api/tests/test_security_main_config.py`: 18 security/app/config tests.
- `apps/api/tests/test_services.py`: 11 SummaStudy client and user store tests.
- `apps/api/tests/test_data_routes.py`: 16 FastAPI TestClient integration tests.
- `src/components/error-boundary.tsx`: React Error Boundary class component.
- `src/app/loading.tsx`: Route-level Suspense loading fallback.
- `src/app/error.tsx`: Route-level error boundary for Next.js App Router.
- `src/components/dashboard-page-shell.tsx`: Children wrapped with `ErrorBoundary`.

### Changed
- `render.yaml`: `DATABASE_URL` changed from hardcoded SQLite URL to a Render-synced Postgres variable.
- `src/lib/api.ts`: Added `apiGetOrThrow`/`apiPostOrThrow`/`apiDeleteOrThrow` variants and error logging to existing wrappers.

### Fixed
- `apps/api/app/services/data_store.py`: `restore_artifact_version` SQL parameter bug (`$1` used twice — fixed to `$1` and `$2`).
