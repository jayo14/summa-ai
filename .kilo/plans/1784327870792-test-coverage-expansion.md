# Milestone 9 — Test Coverage Expansion

## Current State

- Backend: 105 tests passing, 8 failing (all in newly added test files)
- Existing test suite (M8): 97 tests were all passing at completion
- Frontend: no test framework installed (no vitest/jest/cypress in package.json)
- Goal: reach 150+ tests, stabilize backend suite, and establish frontend testing infrastructure

## Remaining Backend Fixes

All 8 failures are in new test files added in this session. The underlying application code is correct; the tests need mock/marking corrections.

### 1. `tests/test_chat_routes.py` — 7 failures

**Root cause:** `@patch("app.routes.chat.cognee")` creates a MagicMock, but `build_orchestrator_prompt` and `chat_stream` `await` the patched methods. MagicMock mocks return dicts synchronously by default, so `await` receives a dict instead of a coroutine.

**Fix:** Replace `mock_cognee.recall_context.return_value = ...` with `mock_cognee.recall_context = AsyncMock(return_value=...)` (same for `recall_exams`, `recall_learning_progress`, `detect_knowledge_gaps`, `remember_conversation`).

Also need `@pytest.mark.asyncio` on:
- `TestChatStreamEndpoint.test_stream_returns_content`
- `TestChatStreamEndpoint.test_stream_emits_artifact_on_intent`
- `TestChatStreamEndpoint.test_stream_handles_zai_error`
- `TestChatEndpoint.test_chat_returns_response_and_artifacts`

### 2. `tests/test_memory_routes.py` — 1 failure (`test_hybrid_context`)

**Root cause:** Same async mock issue. `mock_cognee.recall_context`, `recall_exams`, `recall_learning_progress`, `recall_artifacts` are dicts, not awaitables.

**Fix:** Use `AsyncMock(return_value={...})` for each mocked cognee method.

## New Tests to Add (Target: 150+)

### Backend

| File | Tests to add | Focus |
|------|-------------|-------|
| `test_chat_routes.py` | +8 | `detect_intent` case-insensitivity, `_section` empty string, `_stream_zai` SSE parsing, `_stream_zai` network error path |
| `test_memory_routes.py` | +6 | `recall_context`, `recall_exams`, `recall_progress`, `recall_hexagon`, `consolidate` error handling |
| `test_cognee_service.py` | +12 | `remember_text`, `remember_exam`, `recall_context` cache hit/miss, `forget_topic`, `improve_memory` |
| `test_user_store.py` | +5 | `get_user`, `upsert_user`, `serialize_user` edge cases |
| `test_data_routes.py` | +4 | pagination params, filter by type, archived flag |
| `test_auth_routes.py` | +2 | Google provider branching, missing Supabase config |

### Frontend

Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`.

| File | Tests to add | Focus |
|------|-------------|-------|
| `src/lib/api.test.ts` | +15 | `fetchAnalytics`, `fetchArtifacts`, error handling, fallback data |
| `src/components/prompt-kit/analytics-view.test.tsx` | +8 | renders hexagon, loading state, error boundary |
| `src/components/prompt-kit/chat-workspace.test.tsx` | +6 | input, send button, streaming indicator |

## Validation

```bash
cd apps/api && venv/bin/pytest  # target: 150+ passing, 0 failing
cd .. && npm run build          # Next.js build must stay green
```

## Rollout

1. Fix the 8 failing tests in `test_chat_routes.py` and `test_memory_routes.py`
2. Add backend tests listed above
3. Add frontend test dependencies and test files
4. Run full backend + frontend build
5. Update `docs/PROJECT_ROADMAP.md`, `docs/PROGRESS.md`, `docs/CHANGELOG.md`

## Out of Scope

- E2E tests (Playwright/Cypress)
- Coverage percentage tooling (coverage.py, c8)
- Frontend visual regression tests
