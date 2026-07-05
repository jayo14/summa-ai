# Summa AI

Your AI wakes up every session with no memory of yesterday. Summa AI fixes that for students: it is the learning companion that never forgets. It remembers what you know, what you missed, when your exams are due, and how you learn best. Then it uses that memory to shape the next study session instead of treating every chat like a blank slate.

Built for WeMakeDevs "The Hangover Part AI" hackathon. Theme fit: AI that does not forget, powered by Cognee.

## What it does

Summa AI is split into a Next.js frontend in `src/` and a FastAPI backend in `apps/api/`. The app ships a chat workspace, onboarding flow, progress dashboard, saved materials view, concept map, and study timeline. The product goal is simple: make study support persistent, personal, and useful across sessions.

## Features

- Persistent memory across sessions through Cognee-backed datasets.
- Proactive exam check-ins from stored exam data and conversation context.
- Knowledge gap detection that surfaces missing prerequisites and weak topics.
- Proficiency Hexagon visualization in the progress dashboard.
- Adaptive study plans that respond to what the student already knows.
- `forget()` for mastered topics so the memory layer stays sharp, not bloated.

## Setup

### Frontend

The Next.js app runs from the repository root, and the app code itself is under `src/`.

```bash
npm install
npm run dev
```

The frontend talks to the backend through `NEXT_PUBLIC_FASTAPI_BASE_URL` or `FASTAPI_BASE_URL`. By default it targets `http://localhost:8000/api/v1`.

### Backend

```bash
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend settings are loaded from `apps/api/app/config.py` through a local `.env` file in `apps/api/`.

### Backend env vars

These are the settings defined in `apps/api/app/config.py`:

| Variable | Default | Notes |
| --- | --- | --- |
| `COGNEE_API_KEY` | `""` | Enables Cognee Cloud. If empty, the service falls back to in-memory storage. |
| `COGNEE_API_URL` | `https://api.cognee.ai` | Cognee API endpoint. |
| `OPENAI_API_KEY` | `""` | Required when you want Cognee to use OpenAI for memory operations. |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model used by the backend integration. |
| `QDRANT_API_KEY` | `""` | Qdrant Cloud API key for the vector store. |
| `QDRANT_CLUSTER_ENDPOINT` | `""` | Qdrant cluster endpoint, such as your local Qdrant URL or Qdrant Cloud endpoint. |
| `DATABASE_URL` | `sqlite:///./db/custom.db` | Local database URL used by the backend. |
| `JWT_SECRET_KEY` | `change-me-in-production` | Change this before any real deployment. |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access-token lifetime. |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed frontend origins. |
| `SCHEDULER_ENABLED` | `True` | Turns proactive scheduling on or off. |
| `DEMO_USER_EMAIL` | `alex@summa.ai` | Default demo account identity. |

### Frontend auth env vars

If you want the sign-in flow to use the backend auth endpoint and Google OAuth, the frontend code also reads:

- `FASTAPI_AUTH_LOGIN_URL` or `NEXT_PUBLIC_FASTAPI_AUTH_LOGIN_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`

## Cognee integration

Cognee is the memory layer. The backend wraps it in `apps/api/app/services/cognee_service.py` and falls back to an in-memory store when Cognee is not configured.

### `remember()`

`remember_text()` is the core write path:

```python
await self._cognee.remember(text, dataset=dataset, metadata=metadata or {})
```

Real examples in the codebase:

- `remember_conversation()` stores a `User Query` + `AI Response` summary in the `conversations` dataset.
- `remember_exam()` stores course name, exam type, date, and topics in the `exams` dataset.
- `remember_artifact()` stores artifact metadata in the `artifacts` dataset.
- `remember_learning_progress()` stores topic, score, and activity type in the `progress` dataset.

### `recall()`

`_recall()` is the shared read path:

```python
results = await self._cognee.recall(query, dataset=dataset, limit=limit)
```

It powers:

- `recall_context()` for chat context lookup
- `recall_knowledge_graph()` for graph-style completions
- `recall_exams()` for upcoming exam lookups
- `recall_artifacts()` for saved study artifacts
- `recall_learning_progress()` for topic-level progress lookups
- `get_hexagon_dimensions()` for the proficiency hexagon scores

### `improve()`

`improve_memory()` consolidates a dataset:

```python
await self._cognee.improve(dataset=dataset)
```

It is triggered when:

- `remember_learning_progress()` stores new progress, then immediately calls `improve_memory()`
- `improve_with_feedback()` stores feedback in `conversations`, then improves that dataset

### `forget()`

The service prunes stale or mastered knowledge with:

```python
await self._cognee.forget(dataset=dataset, where={"concept": topic})
```

and dataset-level cleanup:

```python
await self._cognee.forget(dataset=dataset)
```

Used by:

- `forget_topic()` to remove a specific mastered topic
- `forget_dataset()` to clear a whole dataset
- `forget_memory_only()` as a dataset cleanup alias

## Tech Stack

| Layer | What we use |
| --- | --- |
| Frontend framework | Next.js 16, React 19, TypeScript |
| UI system | Tailwind CSS v4, Radix UI, lucide-react, custom prompt-kit components |
| Motion and charts | Framer Motion, Recharts |
| State and auth | NextAuth, Zustand |
| Backend framework | FastAPI, Pydantic v2, Uvicorn |
| Memory layer | Cognee, `remember()`, `recall()`, `improve()`, `forget()` |
| Backend auth/security | `python-jose`, `passlib` |
| Backend data/runtime | `httpx`, `python-multipart`, `SQLAlchemy` |
| Local persistence | Prisma + SQLite (`db/custom.db`) |

## Project Structure

```text
summa-ai/
├── src/            # Next.js frontend: routes, components, hooks, lib
├── apps/api/       # FastAPI backend: config, routes, services, models
├── prisma/         # Prisma schema
├── db/             # Local SQLite database
└── README.md
```

## Notes

- The frontend routes live under `src/app/`.
- The backend API root is `apps/api/app/main.py`.
- Cognee is optional in local dev, but the memory story is the point of the project.
