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

## 2026-07-17 (NEXT_STEPS items 1, 8): Skipped — require user action
- Item 1 (token rotation): Manual step at Z.ai, cannot be done in code.
- Item 8 (integration strategy confirmation): Requires your review and sign-off on the INTEGRATION_STRATEGY.md recommendation before any identity/data migration work begins.

## Open decision awaiting your input
- Whether SummaStudy's existing study_planner/spaced_repetition/memory_service should be reused by Summa AI or deprecated in favor of Summa AI's own build (see PRODUCT_BOUNDARIES.md). All four services confirmed live — this is not a hypothetical question.
