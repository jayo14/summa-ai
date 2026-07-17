# Summa AI — System Architecture

*Compiled from direct repository inspection.*

## 1. Folder Structure

```
src/                          Next.js frontend
  app/                        chat, concept-map, forgot-password, home, onboarding,
                               progress, saved-materials, sign-in, sign-up, study-timeline, tokens
  app/api/auth/[...nextauth]  NextAuth route
  app/api/chat                frontend-side chat API route
  components/, hooks/, lib/, types/

apps/api/                     FastAPI backend
  app/core/security.py        JWT create/verify, bcrypt hashing, WebSocket connection manager
  app/config.py                pydantic settings
  app/models/                 artifact, chat, memory, timeline, user
  app/routes/                 auth, chat, data_routes, memory
  app/services/cognee_service.py   Cognee wrapper + in-memory fallback
  app/services/user_store.py
  tests/                      1 test file (test_memory_loop.py)

(prisma/ removed in Milestone 2 — was unused default scaffold)
db/custom.db                  SQLite file referenced by DATABASE_URL default
```

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, NextAuth (`src/app/api/auth/[...nextauth]`, `src/lib/auth.ts`), Google OAuth support |
| Backend | FastAPI, own JWT issuance (`python-jose`, `passlib`/bcrypt) — independent of Supabase entirely |
| Data | Raw `sqlite3` via `user_store.py` (`db/custom.db`) for user/auth data; Cognee datasets for memory/exams/progress/artifacts. Prisma ORM was removed in Milestone 2 (unused scaffold). |
| Memory | Cognee (managed memory layer), falls back to in-memory storage when `COGNEE_API_KEY` is unset |
| Vector store | Qdrant (Cognee-managed) — config present, not directly called outside Cognee |
| LLM (actual chat) | **Z.ai GLM-4.5**, called directly via `httpx` streaming in `routes/chat.py` — credentials and endpoint read from `Settings` (env vars), not through the `LLM_PROVIDER`/`OPENAI_API_KEY` settings declared in `config.py` |
| Real-time | Native FastAPI `WebSocket` + a hand-rolled `ConnectionManager` (`core/security.py`) |

## 3. Authentication Flow

- Two separate auth surfaces exist: NextAuth on the frontend (Google OAuth capable) and a self-issued JWT system on the backend (`create_access_token`/`verify_access_token` in `core/security.py`), with no visible bridge connecting the two into one identity. This needs direct tracing to confirm whether NextAuth session tokens are exchanged for backend JWTs anywhere, or whether these are two independent, currently-disconnected auth states.
- Backend JWTs are signed with `JWT_SECRET_KEY`. The default is `"change-me-in-production"`, but a startup guard in `main.py`'s lifespan now raises `RuntimeError` if `ENVIRONMENT=production` and the key hasn't been changed.

## 4. Database Architecture

- `prisma/` was removed in Milestone 2. It contained exactly the default `prisma init` scaffold — generic `User`/`Post` boilerplate, not Summa AI's actual domain. The real data model lives in `app/models/*.py` (Pydantic) and `db/custom.db` persisted via raw `sqlite3` in `user_store.py`.
- No Postgres, no Supabase — this is the central fact that determines everything in `INTEGRATION_STRATEGY.md`.

## 5. AI Pipelines / Memory Architecture

- `cognee_service.py` wraps four write paths (`remember_conversation`, `remember_exam`, `remember_artifact`, `remember_learning_progress`) and a shared `recall()` read path, each scoped to a named Cognee "dataset" (conversations / exams / artifacts / progress).
- **Chat generation reads all credentials from Settings (env vars)**: `routes/chat.py` calls Z.ai's GLM-4.5 directly over `httpx`, with the base URL, API key, token, and user ID read from `settings` (which loads from environment variables). Cognee is used for memory recall/write, but LLM inference for chat is a separate integration — it does not use the `OPENAI_API_KEY` / `LLM_PROVIDER` settings declared in `config.py`. The credentials were moved from hardcoded source to env vars in Milestone 1; the provider config was aligned in Milestone 2.
- Intent detection (`detect_intent`) is regex-based keyword matching against the last user message (quiz / flashcards / study-plan / hexagon / graph / timeline / gap-analysis) — lightweight, no model call, cheap. Reasonable choice for routing.
- Knowledge-gap detection reads recalled progress entries and flags any topic scoring below a hardcoded `WEAK_SCORE_THRESHOLD = 40.0`.

## 6. Inference Flow (chat)

1. Frontend sends messages to `POST /chat/stream`.
2. Backend resolves `user_id` from the verified JWT.
3. Regex intent detection runs on the last message.
4. `build_orchestrator_prompt` pulls memory context, exams, progress, and gap analysis from Cognee, and assembles a system prompt.
5. `_stream_zai` streams a completion from Z.ai GLM-4.5 using the hardcoded credentials, forwarding `thinking`/`content` deltas back to the client as SSE.
6. On any exception, the stream silently falls back to a canned "I'd be happy to help!" message rather than surfacing the failure — worth revisiting, see `TECHNICAL_DEBT.md`.

## 7. Caching, Model Providers, Vector Storage

- No caching layer visible in `apps/api` (contrast with SummaStudy's `ai-services`, which has Upstash caching).
- `config.py` declares a generic `LLM_PROVIDER`/`EMBEDDING_PROVIDER` abstraction (openai-flavored) that the actual chat path does not use — the abstraction and the real code remain distinct (Z.ai API is not OpenAI-compatible, so routing through OpenAI-flavored settings would be misleading).
- Vector storage is entirely delegated to Cognee/Qdrant; no direct Qdrant client calls found outside that wrapper.

## 8. External Integrations

- Cognee Cloud (memory), Qdrant (vector store, via Cognee), Google OAuth (via NextAuth), Z.ai (chat completions, hardcoded).
