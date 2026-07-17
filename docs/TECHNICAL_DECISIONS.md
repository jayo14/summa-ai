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

## 2026-07-17 (Milestone 1): JWT_SECRET_KEY production guard
- Decision: Added a `RuntimeError` raise in `main.py`'s lifespan if `ENVIRONMENT=production` and `JWT_SECRET_KEY` equals the default `"change-me-in-production"`.
- Why: The `is_production` property existed but nothing gated on it for this specific check. A production deployment with the default secret would issue forgeable tokens.
- Status: Executed.

## Open decision awaiting your input
- Whether SummaStudy's existing study_planner/spaced_repetition/memory_service should be reused by Summa AI or deprecated in favor of Summa AI's own build (see PRODUCT_BOUNDARIES.md).
