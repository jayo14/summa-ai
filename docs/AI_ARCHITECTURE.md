# Summa AI — AI Architecture

## Memory Architecture

Cognee-backed, dataset-scoped:
- `conversations` — query/response summaries
- `exams` — course, exam type, date, topics
- `artifacts` — artifact metadata
- `progress` — topic, score, activity type

`remember()`/`recall()` are the two primitives everything else composes from. This is a clean, small surface — good, don't expand it without a concrete need. A `forget()` path exists per the README for mastered topics, keeping memory from growing unbounded — confirm this is actually invoked somewhere (not directly traced in this pass) rather than only documented.

**Structural risk:** the entire memory layer depends on Cognee Cloud being reachable and `COGNEE_API_KEY` being set. The in-memory fallback (see `SECURITY_REPORT.md`) means "persistent memory across sessions" — the product's core promise — can silently become "memory that resets on every backend restart" with zero user-facing signal. For a product whose entire pitch is "never forgets," this specific failure mode deserves the strongest possible guardrail: fail loudly and visibly, don't degrade silently.

## Prompt Architecture

`build_orchestrator_prompt` assembles, in order: a fixed system framing, recalled memory context (as raw JSON dumped into the prompt), upcoming exams (raw JSON), learning progress (raw JSON), detected knowledge gaps, then fixed behavioral instructions (explain → check understanding → flag prerequisites → help build study schedules).

Concerns:
- **Unbounded context growth.** Memory/exam/progress context is JSON-dumped directly into the prompt with no visible truncation or token-budget check. As a student accumulates more sessions, exams, and progress entries, this prompt grows without bound until it silently blows the model's context window or costs scale badly. This needs a token-budget cap with a summarization or recency/relevance cutoff — not unlimited raw recall.
- **No prompt injection consideration visible.** Recalled memory includes past conversation content, which becomes part of a new system-level prompt. If any recalled content could contain adversarial text (unlikely from Cognee's own summaries, but worth confirming Cognee doesn't store raw uploaded artifact text verbatim into a dataset that later gets prompt-injected back in).

## RAG Pipeline / Inference Flow

Chat generation does not appear to be RAG in the retrieval-augmented-generation sense of "retrieve relevant document chunks + generate" — it's closer to "recall structured memory records + generate." That's a reasonable design for a personal learning coach (you're not searching a document corpus, you're recalling a student's own history), but it means "RAG" in this codebase and "RAG" in SummaStudy's `ai-services/services/enhanced_rag.py` (which does retrieve from a resource corpus) are different things serving different purposes — worth being precise about this distinction when the two teams/repos talk to each other, so "RAG" doesn't get conflated across product boundaries.

## Model Providers

- Declared in config: OpenAI (chat + embeddings), generic `LLM_PROVIDER`/`EMBEDDING_PROVIDER` settings.
- Actually used in the one real chat path found: **Z.ai GLM-4.5**, hardcoded, bypassing the declared config entirely (see `SECURITY_REPORT.md` finding #1).

This divergence between declared and actual provider was the top AI-architecture debt item. Milestone 2 addressed the most critical part: Z.ai's API base, model, key, token, and user ID are now all read from `Settings` (env vars). The remaining abstraction gap is that `OPENAI_API_KEY`/`LLM_PROVIDER` still exist as separate settings from `ZAI_*` — a reader could still change `OPENAI_API_KEY` and believe it affects chat, when Z.ai has its own dedicated `ZAI_API_KEY`. Consolidating to a single provider abstraction would be a future improvement when the provider surface is better understood.

## Caching

None found in `apps/api`. Every chat request re-recalls memory/exams/progress from Cognee on every turn. For a chat interface, some of that (e.g. exam list within a session) is cacheable per-session without staleness risk, and would reduce both latency and Cognee call volume.

## Recommendation Summary (smallest safe next steps, in order)

1. ✅ Move hardcoded credentials to env vars — Done (Milestone 1).
2. ✅ Route chat generation through `config.py`'s Settings-based config — Done (Milestone 2).
3. Add a token/character budget cap to `build_orchestrator_prompt`, with oldest/least-relevant context dropped first.
4. Add a startup-time hard failure if Cognee is unreachable/unconfigured in production, rather than a silent in-memory fallback.
