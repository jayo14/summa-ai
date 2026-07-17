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
```

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, NextAuth (`src/app/api/auth/[...nextauth]`, `src/lib/auth.ts`), Google OAuth support |
| Backend | FastAPI, Supabase Auth JWT verification (`PyJWT`) — shares identity with SummaStudy |
| Data | `asyncpg` to Supabase Postgres (`summa_ai.user_profiles` + `summa_ai.settings`) via `user_store.py`; Cognee datasets for memory/exams/progress/artifacts. In-memory dicts in `data_routes.py` for artifacts/conversations/messages/timeline/materials/concepts (demo-only). |
| Memory | Cognee (managed memory layer), falls back to in-memory storage when `COGNEE_API_KEY` is unset |
| Vector store | Qdrant (Cognee-managed) — config present, not directly called outside Cognee |
| LLM (actual chat) | **Z.ai GLM-4.5**, called directly via `httpx` streaming in `routes/chat.py` — credentials and endpoint read from `Settings` (env vars), not through the `LLM_PROVIDER`/`OPENAI_API_KEY` settings declared in `config.py` |
| Real-time | Native FastAPI `WebSocket` + a hand-rolled `ConnectionManager` (`core/security.py`) |

## 3. Authentication Flow

- Two separate auth surfaces exist: NextAuth on the frontend (Google OAuth capable) and a self-issued JWT system on the backend (`create_access_token`/`verify_access_token` in `core/security.py`), with no visible bridge connecting the two into one identity. This needs direct tracing to confirm whether NextAuth session tokens are exchanged for backend JWTs anywhere, or whether these are two independent, currently-disconnected auth states.
- Backend verifies Supabase JWTs via `verify_supabase_jwt()` in `core/security.py`, using `SUPABASE_JWT_SECRET`. No self-issued JWTs. The old `JWT_SECRET_KEY` system was removed in Milestone 3.

## 4. Database Architecture

- **Postgres (Supabase, `summa_ai` schema)**: User profiles (`summa_ai.user_profiles`) and settings (`summa_ai.settings`) are stored in Supabase Postgres, accessed via `asyncpg` pool in `user_store.py`. The schema was applied via `db/migrate_to_supabase.sql`.
- **In-memory dicts**: Artifacts, conversations, messages, timeline events, materials, and concepts live in in-memory dicts in `data_routes.py` — sufficient for demo, not for production.
- **Cognee datasets**: Memory, exam data, progress, and artifact embeddings are stored in Cognee Cloud.
- The data model is defined by `app/models/*.py` (Pydantic schemas).

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
