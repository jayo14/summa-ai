# Summa AI — Project Audit

Severity-ranked, consolidated from the deeper findings in `SECURITY_REPORT.md` and `AI_ARCHITECTURE.md`.

## Critical
1. Hardcoded Z.ai API credentials in `apps/api/app/routes/chat.py` — see `SECURITY_REPORT.md`. Fix before anything else.
2. `JWT_SECRET_KEY` insecure default with no production guard.

## High
3. ~~Prisma is fully scaffolded but unused — `schema.prisma` has generic `User`/`Post` boilerplate unrelated to the real domain models in `app/models/*.py`. Either adopt Prisma properly or remove it; right now it's dead infrastructure that misleads anyone reading the repo about where data actually lives.~~ **✅ Resolved in Milestone 2 — prisma/ removed, deps dropped.**
4. ~~Declared LLM provider config (`OPENAI_API_KEY`, `LLM_PROVIDER`) doesn't match the actual chat implementation (hardcoded Z.ai). Config and reality have diverged.~~ **✅ Resolved in Milestone 2 — Z.ai API base, model, and creds all read from Settings.**
5. Two disconnected auth systems (NextAuth frontend, self-issued JWT backend) with no confirmed bridge — needs direct tracing.
6. No Supabase integration at all, despite the product vision requiring shared identity with SummaStudy — see `INTEGRATION_STRATEGY.md` for the resolution path.

## Medium
7. Unbounded prompt context growth in `build_orchestrator_prompt` — memory/exam/progress recalled and JSON-dumped with no token budget.
8. Silent fallback to a canned response on LLM stream failure — hides real errors.
9. In-memory Cognee fallback can activate silently in production with no guard, defeating the product's core "never forgets" promise without any visible error.
10. No caching layer in the backend — every chat turn re-fetches memory/exams/progress fresh from Cognee.
11. Thin test coverage — one test file (`test_memory_loop.py`) against auth, chat, and memory-write paths that all carry real risk if broken.

## Low
- No dependency vulnerability scan performed in this pass.

## What This Pass Did Not Cover
- Full trace of every `app/routes/*.py` file for additional hardcoded values beyond `chat.py` (recommend a repo-wide grep for API-key-shaped strings as an immediate follow-up, not just the one file found here)
- Frontend (`src/`) code review beyond structural folder mapping
- Live Cognee/Qdrant behavior under load
