# Summa AI — Technical Decisions Log

## 2026-07-17: Audit before action
Decision: Full read-only audit before any code change, per operating instructions.
Why: Justified further by what the audit found — a hardcoded credential is exactly the kind of issue you want documented and deliberately fixed, not stumbled into mid-refactor.

## 2026-07-17: Integration architecture recommendation
Decision: Recommend Supabase Auth adoption + Postgres migration (separate schema) + no API gateway + direct service-to-service calls, over federated/bridged auth and over a gateway-based architecture.
Why: See INTEGRATION_STRATEGY.md for the full multi-criteria comparison. Core reasoning: Summa AI likely has few/no real production users yet, making this the cheapest point in the product's life to do this migration; a gateway solves a scale problem neither product has yet.
Alternatives considered and rejected: federated/bridged auth (more permanent complexity for a problem that doesn't need permanent complexity), API gateway (premature for current scale).
Status: Awaiting your confirmation before implementation — this is a recommendation, not an executed decision.

## 2026-07-17 (Milestone 1): Security credentials moved to environment variables
- Decision: Removed hardcoded Z.ai credentials from chat.py source, added them to the Settings class (config.py), and wired chat.py to read from `settings`.
- Why: The old hardcoded JWT-shaped bearer token was the single highest-priority finding across both repos. Moving to env vars enables rotation without source changes.
- Status: Executed. The old token itself still needs to be rotated at Z.ai — this is a manual step the code change cannot do for you.

## 2026-07-17 (Milestone 2): Route chat through Settings-based provider config
- Decision: Moved `ZAI_API_BASE` and `ZAI_MODEL` from hardcoded module-level constants into the `Settings` class; wired `chat.py` to read them from `settings` instead.
- Why: The declared `LLM_PROVIDER`/`OPENAI_API_KEY` config had silently diverged from the actual Z.ai-based chat path. Anyone reading `config.py` would reasonably believe changing `OPENAI_API_KEY` changes model behavior — it didn't. Now all Z.ai parameters (API base, model, key, token, user ID) are env-configurable.
- Status: Executed. Provider changes are now a config change, not a code change.

## 2026-07-17 (Milestone 2): Remove unused Prisma scaffolding
- Decision: Removed `prisma/` directory, `@prisma/client` and `prisma` npm deps, db:* scripts, and `src/lib/db.ts` (unused PrismaClient singleton).
- Why: Prisma was scaffolded early and never adopted. Its schema contained only generic `User`/`Post` boilerplate unrelated to Summa AI's actual domain models. The real data layer is raw `sqlite3` in `user_store.py` + Cognee datasets. Keeping it misleads readers about where data lives.
- Alternatives considered: Adopting Prisma properly (rejected — Milestone 3 plans Supabase migration, so adapting Prisma now would be wasted effort).
- Status: Executed.

## 2026-07-17 (Milestone 1): JWT_SECRET_KEY production guard
- Decision: Added a `RuntimeError` raise in `main.py`'s lifespan if `ENVIRONMENT=production` and `JWT_SECRET_KEY` equals the default `"change-me-in-production"`.
- Why: The `is_production` property existed but nothing gated on it for this specific check. A production deployment with the default secret would issue forgeable tokens.
- Status: Executed.

## 2026-07-17 (NEXT_STEPS item 6): Credential sweep completed
- Decision: Performed repo-wide search for hardcoded credential-shaped strings across apps/api and src/.
- Result: No additional hardcoded credentials found beyond what was already fixed in Milestones 1-2.
- Impact: The PROJECT_AUDIT.md recommendation (item 26) and NEXT_STEPS.md item 6 are now resolved.
- Status: Executed.

## 2026-07-17 (NEXT_STEPS item 7): SummaStudy service liveness confirmed
- Finding: All four services flagged in PRODUCT_BOUNDARIES.md (study_planner, spaced_repetition, memory_service, recommendation_service) are **live and actively used** by routes, agents, and tasks in SummaStudy.
- Import graph confirmed: memory_service is the most deeply integrated (used in orchestrator, tasks, agents, and has dedicated tests). study_planner and spaced_repetition are lazy-imported in ai_core endpoints. recommendation_service serves marketplace and tutorials endpoints.
- Impact: This confirms the PRODUCT_BOUNDARIES.md question is real — SummaStudy already ships adaptive-learning features that overlap Summa AI's domain. The reuse-vs-rebuild decision now has data to inform it.
- Status: Awaiting your go-ahead to proceed with either path.

## 2026-07-17 (Milestone 4): Surface LLM errors instead of silent fallback
- Decision: Changed `_stream_zai` exception handler to emit a typed SSE `{"type":"error","message":"..."}` event instead of streaming a canned "I'd be happy to help!" response.
- Why: The old behavior silently masked outages, credential expiration, and transient failures. The frontend already handled `type: "error"` events (line 153 of `use-chat.ts`) — the backend just never sent them.
- Alternatives considered: Log-only (errors still invisible to users), generic HTTP 500 (loses streaming context). The SSE error event was the smallest change that actually surfaces failures to users.
- Status: Executed.

## 2026-07-17 (Milestone 4): Prompt context budget cap
- Decision: Added `_section()` truncation helper with `MAX_CONTEXT_SECTION_CHARS=3000` wrapping each JSON-dumped context block (memory, exams, progress, gaps) in `build_orchestrator_prompt`.
- Why: Without a budget, a long-term student's accumulated sessions/exams/progress entries would silently grow the prompt until it exceeds the model's context window, causing unpredictable behavior and escalating costs.
- Alternatives considered: Per-entry truncation (more complex, less predictable), hard limit on recalled entries (simpler but loses nuance). Per-section char cap hits the right balance: keeps each section bounded while preserving structure.
- Status: Executed.

## 2026-07-17 (Milestone 4): Cognee recall caching
- Decision: Added `_TTLCache` class (60s TTL) to `CogneeService._recall()`, avoiding redundant Cognee API calls within a short window.
- Why: Every chat turn re-fetched memory/exams/progress fresh from Cognee. During a conversation, repeated calls for the same data (e.g., gap analysis recalling progress) returned identical results. 60s TTL covers the duration of a typical multi-turn interaction without stale-data risk.
- Alternatives considered: `functools.lru_cache` (no TTL), Redis (premature infra dependency). In-process dict with monotonic TTL is zero-infra and matches current scale.
- Status: Executed.

## 2026-07-17 (Milestone 4): Cognee production guard
- Decision: `main.py` lifespan now raises `RuntimeError` if `ENVIRONMENT=production` and `COGNEE_API_KEY` is unset.
- Why: The in-memory Cognee fallback silently activates when no API key is configured, making "persistent memory" reset on every restart. This defeats the product's core promise without any user-visible signal. A hard boot-time failure ensures this cannot happen silently in production.
- Status: Executed.

## 2026-07-17 (Milestone 3): Adopt Supabase Auth
- Decision: Replaced self-issued JWT verification with Supabase JWT verification (`verify_supabase_jwt` in `core/security.py`). Removed `create_access_token`. Auth routes now proxy through Supabase Auth REST API.
- Why: Per your confirmed Decision 1 — one identity system shared with SummaStudy. Supabase Auth handles token creation, verification, and session management. The old self-issued JWT system had the JWT_SECRET_KEY security surface that SECURITY_REPORT.md flagged.
- How: Backend verifies Supabase JWTs using `SUPABASE_JWT_SECRET` (HMAC-SHA256 with `aud="authenticated"`). Frontend's NextAuth flow is unchanged at this layer — it calls the same `/auth/login` and `/auth/signup` endpoints, which now proxy to Supabase. The access_token returned is now a real Supabase JWT instead of a self-issued one.
- Status: Executed (backend). Frontend NextAuth flow works without changes since the response format is the same.

## 2026-07-17 (Milestone 3): Migration schema for Supabase Postgres
- Decision: Created `db/migrate_to_supabase.sql` — creates `summa_ai` schema with 8 tables mirroring the current in-memory/SQLite data model. Includes a trigger to auto-create user profiles on first Supabase login (`handle_new_user()` on `auth.users` INSERT).
- Why: Per your confirmed Decision 2 — separate schema in shared Postgres instance. Decision 4 (start fresh) means no data migration needed.
- Status: Script ready. Needs to be run via Supabase Dashboard SQL Editor (server lacks IPv6).

## 2026-07-17 (NEXT_STEPS items 1, 8): Status update
- Item 1 (token rotation): Still manual — mark as pending.
- Item 8 (integration strategy): ✅ Confirmed and executed (Decisions 1-4).

## Open decision awaiting your input
- Whether SummaStudy's existing study_planner/spaced_repetition/memory_service should be reused by Summa AI or deprecated in favor of Summa AI's own build (see PRODUCT_BOUNDARIES.md). All four services confirmed live — this is not a hypothetical question.
