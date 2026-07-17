# Integration Strategy — Summa AI ↔ SummaStudy

Ground truth from both audits: SummaStudy runs on Supabase (Postgres/Auth/Storage/Realtime), and its `ai-services` backend already correctly verifies Supabase JWTs. Summa AI runs on SQLite (with unused Prisma scaffolding), its own self-issued JWT auth, and Cognee/Qdrant for memory. **There is currently zero shared identity, zero shared data, and zero API contract between the two.** Every "shared SSO" or "one identity" goal is unbuilt.

## Decision 1: Identity — should authentication be centralized?

| Criterion | A: Summa AI adopts Supabase Auth directly (drop its own JWT/NextAuth flow) | B: Federated/bridged auth (keep both, exchange tokens at a boundary) |
|---|---|---|
| Simplicity | Higher long-term — one identity system, one place to fix auth bugs | Lower — two systems to reason about, a bridge to maintain |
| Dev time | Medium — swap `core/security.py` to verify Supabase JWTs (SummaStudy's `ai-services` already has working reference code for this) | Medium-High — need to build and secure a token-exchange endpoint, plus keep both systems' user records in sync |
| Long-term maintainability | High — matches the pattern already proven in SummaStudy's backend | Lower — sync bugs between two user tables are a recurring class of bug, not a one-time cost |
| Scalability | No added infra | Adds a bridging service as a new scaling/failure point |
| Infra cost | Removes Summa AI's need for its own JWT secret management and (eventually) SQLite | Adds an extra service |
| UX | One login, works across both products immediately | Still one login *if built well*, but more can silently break (e.g. token exchange failing while the user believes they're logged in) |
| Security | Removes finding #2 from `SECURITY_REPORT.md` entirely (no more `JWT_SECRET_KEY` to protect) | Keeps the self-issued JWT surface alive, plus adds a new bridge to secure |
| Risk | Requires a real migration of any existing Summa AI users (likely small/zero given this is a recent hackathon build — confirm before assuming) | Lower short-term disruption, but defers the same work and adds permanent complexity |
| Alignment with vision | Directly delivers "one identity," "centralized auth" as you asked to evaluate | Technically satisfies "shared SSO" but through more moving parts than necessary |

**Recommendation: A.** Given Summa AI almost certainly has few or no real production users yet (this is fresh off a hackathon), the migration cost is close to its lowest possible point right now. Every week this is deferred, the cost of migrating real users grows. SummaStudy's `ai-services/core/security.py::verify_supabase_jwt` is a working template to copy the pattern from — this isn't greenfield design work, it's applying a pattern that already works in the sibling repo.

**Trade-off accepted:** Summa AI loses its own auth flexibility (e.g., if you ever wanted Summa AI to have completely independent signup, this forecloses that). Given the product vision explicitly wants one student identity across both products, this trade-off is the correct one to accept.

## Decision 2: Data layer — should Summa AI move off SQLite/Prisma onto Supabase Postgres?

Given Decision 1 (Supabase Auth), this follows almost automatically: Supabase Auth's user IDs need to be the foreign key every Summa AI table references. Keeping Summa AI's relational data on SQLite while identity lives in Supabase means constant cross-database joins in application code instead of the database. Recommendation: migrate Summa AI's relational tables (currently barely used — Prisma schema is unused boilerplate, so there's minimal real migration burden) onto the same Supabase Postgres project, in a **separate schema** (e.g. `summa_ai.*`) rather than the `public` schema SummaStudy uses — keeps tables logically separated while sharing one Postgres instance and one `auth.users` table.

## Decision 3: Should there be an API Gateway / shared services layer?

| Criterion | A: No gateway — each product's frontend calls its own backend directly, backends call each other's APIs when needed | B: Introduce an API Gateway in front of both backends |
|---|---|---|
| Simplicity | Higher — matches what both repos already do internally (frontend → own backend) | Lower — new infra component, new deployment, new failure point |
| Dev time | Low — no new service to build | High |
| Scalability | Each backend already scales independently; a gateway adds a shared bottleneck/dependency between two products meant to stay independently deployable | Can add value at much larger scale (rate limiting, unified auth enforcement) but that value doesn't exist yet at current scale |
| Cost | None | Ongoing infra + maintenance cost |
| Alignment with vision | Two products, two teams-of-one-founder, meant to stay boundaried — a shared gateway re-couples them operationally even if the code stays separate | — |

**Recommendation: A, revisit later.** At current scale (two products, one founder, no evidence of gateway-requiring traffic), a gateway is solving a scaling problem you don't have yet, at the cost of complexity you'd carry immediately. Direct backend-to-backend calls (e.g., Summa AI's backend calling SummaStudy's `ai-services` search endpoint when it needs resource data, authenticated with the same shared Supabase JWT from Decision 1) achieve the actual goal — resource synchronization and shared identity — without the gateway.

## Decision 4: Subscriptions (paid Summa AI, free SummaStudy)

Not deeply auditable from code in this pass (no billing code found in either repo). Once Decision 1 lands (shared identity), subscription status becomes a row keyed on the shared `auth.users.id` — readable by both products, but only writable by whichever service owns billing (recommend: Summa AI's backend, since it's the paid product). SummaStudy would check subscription status only if it ever needs to gate a cross-product feature (unlikely given the stated boundary) — otherwise this stays entirely inside Summa AI.

## Summary Recommendation

Centralize on Supabase (Auth + Postgres), no gateway, direct service-to-service calls when cross-product data is genuinely needed, subscriptions owned by Summa AI. This is the smallest-complexity path that actually satisfies every goal listed in your integration questions (one identity, shared resource access, simple API contracts) without introducing infrastructure whose benefit only shows up at a scale neither product has reached yet.

**Sequencing:** this entire integration effort should wait until the Critical security fixes in `SECURITY_REPORT.md` (credential rotation, JWT secret guard) are done — don't build shared identity on top of an auth system you already know has an unguarded default secret.
