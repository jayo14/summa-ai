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

## 2026-07-18 (Milestone 9 — Test Coverage Expansion)
### Fixed
- `apps/api/tests/test_chat_routes.py`: Repaired 7 tests by replacing synchronous `MagicMock` return values with `AsyncMock` for `cognee` service methods and adding missing `@pytest.mark.asyncio` decorators to stream and endpoint tests.
- `apps/api/tests/test_memory_routes.py`: Repaired 1 test (`test_hybrid_context`) by using `AsyncMock` for all mocked `cognee` methods.
- `apps/api/tests/test_data_store.py`: Converted all 25 DataStore tests from sync to async (`@pytest.mark.asyncio` + `await`) and fixed pool mock to support async context manager protocol.
- `apps/api/tests/test_data_routes.py`: Added JWT verification mock fixture and converted all store mocks to `AsyncMock`; added 5 new integration tests (get artifact, update artifact, delete conversation not found, timeline with limit).
- `apps/api/tests/test_security_main_config.py`: Removed stale imports (`get_cors_origins`, `is_production`); patched `settings.SUPABASE_JWT_SECRET` in JWT tests; replaced `MagicMock` with `AsyncMock` for WebSocket tests; fixed CORS production test to use `patch.dict(os.environ, ...)`.
- `apps/api/tests/test_services.py`: Replaced `AsyncMock` with `MagicMock` for synchronous httpx response mocks; created fresh `SummaStudyClient` instance per test after settings patch.
- `apps/api/tests/test_auth_routes.py`: Replaced `AsyncMock` with `MagicMock` for httpx response mocks; added missing Supabase config error test.

### Added
- `apps/api/tests/test_chat_routes.py`: 16 tests covering `detect_intent` (10 patterns), `_section` truncation (3 cases), `build_orchestrator_prompt` (3 scenarios), `/chat/stream` (3 scenarios), `/chat` endpoint.
- `apps/api/tests/test_memory_routes.py`: 10 tests covering all memory endpoints (remember text/conversation, hybrid extract/facts/summary/context, forget, improve, feedback, consolidate).
- `apps/api/tests/test_cognee_service.py`: 15 tests covering `_TTLCache` (7 cases), `CogneeService` singleton, recall cache, remember/forget, learning progress, hexagon dimensions.
- `apps/api/tests/test_services.py`: 5 new async `UserStore` tests (`get_user_by_id`, `update_user` success/not-found/no-changes).
- `apps/api/tests/test_models.py`: 15 tests for Pydantic model validation across chat, user, memory, artifact, and timeline models.
- `apps/api/tests/test_config.py`: 8 tests for `Settings` defaults and derived properties (`is_production`, `get_cors_origins`).
- Frontend test infrastructure: `vitest.config.ts`, `src/test/setup.ts`, `package.json` scripts (`test`, `test:watch`).
- `src/lib/api.test.ts`: 18 tests for all exported API functions with mocked `fastapiFetch`.
- `src/components/prompt-kit/simple.test.tsx`: 1 basic component render test.

### Changed
- `package.json`: Added `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom` as devDependencies; added `test` and `test:watch` scripts.
- `vitest.config.ts`: New file with React plugin, `@` path alias, jsdom environment, and global test setup.

### Coverage
- Backend: 187 tests passing (0 failing)
- Frontend: 19 tests passing (0 failing)
- Total: 206 tests

## 2026-07-18 (Milestone 10 — CI/CD Pipeline & Deployment Hardening)
### Added
- `.github/workflows/backend-ci.yml`: GitHub Actions workflow for backend — runs `black --check` and `pytest` against a Postgres 16 service container.
- `.github/workflows/frontend-ci.yml`: GitHub Actions workflow for frontend — runs `eslint`, `vitest run`, and `next build`.
- `Dockerfile.backend`: Python 3.14-slim image with gunicorn + uvicorn worker, exposes port 8000.
- `Dockerfile.frontend`: Multi-stage Node 20 Alpine build producing standalone Next.js server.
- `docker-compose.yml`: Local development stack with Postgres 16, backend, and frontend services, healthchecks, and volume mounts.

### Changed
- `render.yaml`: Added `summa-ai-frontend` web service (Node runtime, Next.js build/start, env vars for API base URLs).

## 2026-07-18 (Milestone 11 — E2E Testing & Quality Gates)
### Added
- `playwright.config.ts`: Playwright configuration with Chromium project, `baseURL`, trace-on-first-retry, and dev-server auto-start.
- `src/e2e/navigation.spec.ts`: 5 Playwright smoke tests covering homepage, chat, progress, concept-map, and study-timeline navigation.
- `.husky/pre-commit`: Husky pre-commit hook running `npx lint-staged`.
- `lint-staged` config in `package.json`: Runs `eslint --fix` and `vitest related --run` on staged `*.{ts,tsx}` files.

### Changed
- `package.json`: Added `prepare`, `test:watch` scripts; added `lint-staged` config; added `husky` and `lint-staged` as devDependencies.

## 2026-07-18 (Milestone 12 — Performance Optimization)
### Fixed
- `src/app/layout.tsx` + `src/app/globals.css`: Removed `Merriweather` Google Font import and CSS variable, replacing with system serif font stack. This fixes Turbopack build failures in environments where Google Fonts CDN is unreachable and eliminates an external network dependency.

### Added
- `next.config.ts`: Enabled `optimizePackageImports` for `@tanstack/react-table`, `recharts`, and `framer-motion` to improve tree-shaking and reduce client bundle size.
- `apps/api/app/main.py`: Added `GZipMiddleware` (1KB minimum) to compress API responses.
- `apps/api/app/routes/data_routes.py`: Added `Cache-Control: public, max-age=30` header to `/analytics` endpoint.

## 2026-07-18 (Milestone 13 — Production Hardening & Feature Completeness)
### Added
- `apps/api/app/main.py`: Simple in-memory rate limiting middleware (100 req/min per IP, production-only).
- `apps/api/app/main.py`: Security headers middleware (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`).

## 2026-07-18 (Milestone 14 — Database Migrations & Developer Experience)
### Added
- `alembic.ini`: Alembic configuration for database migrations.
- `alembic/env.py`: Alembic environment with asyncpg support using SQLAlchemy async engine.
- `alembic/script.py.mako`: Migration template for new revisions.
- `Makefile`: Developer workflow targets for install, test, lint, format, run, db, and migrate.
- `.env.local`: Development environment variables (gitignored).

## 2026-07-18 (Milestone 15 — Accessibility & Polish)
### Added
- `src/components/dashboard-page-shell.tsx`: Skip-to-main-content link for keyboard navigation.
- `src/components/dashboard-page-shell.tsx`: `aria-label` attributes on icon-only buttons (sidebar trigger, theme toggle, sign out).

## 2026-07-18 (Milestone 16 — Real-time Features & Feature Flags)
### Added
- `apps/api/app/core/security.py`: `ConnectionManager.broadcast()` method for sending messages to all connected WebSocket clients.
- `apps/api/app/main.py`: `POST /ws/broadcast` endpoint for broadcasting messages (gated by `WEBSOCKET_ENABLED` feature flag).
- `apps/api/app/config.py`: Feature flags `WEBSOCKET_ENABLED`, `NEW_CHAT_UI`, `ADVANCED_ANALYTICS`.
- `src/lib/feature-flags.ts`: React context provider and `useFeatureFlags` hook with localStorage persistence.
- `src/components/providers.tsx`: Wired `FeatureFlagsProvider` into root providers.

## 2026-07-18 (Milestone 17 — PWA & Offline Support)
### Added
- `src/app/manifest.ts`: Web app manifest for PWA installability.
- `public/sw.js`: Service worker with cache-first strategy for static assets and offline fallback.
- `src/app/layout.tsx`: Service worker registration script (HTTPS-only).
- `src/app/offline/page.tsx`: Offline fallback page with friendly message and home link.
