# Summa AI — Sequential Implementation Prompts

This document contains **ready-to-execute, sequential implementation prompts** for an AI coding agent to take the existing Summa AI codebase from its current state to the target adaptive learning system defined in the **Summa AI Adaptive Learning Master Prompt**.

Each prompt is:
- **Dependency-ordered**: Builds upon previously verified steps.
- **Specific**: Specifies exact files to inspect, modify, create, and delete.
- **Evidence-grounded**: Rooted in the actual codebase structure (`api/app`, `client/src`, `server/index.ts`).
- **Verifiable**: Contains precise test commands and acceptance criteria.

---

## Roadmap Overview

```
Phase 1: Foundation & Gateway Repairs (Prompts 1.1 - 1.3)
   ↓
Phase 2: Unified Activity Engine & Structured Contracts (Prompts 2.1 - 2.3)
   ↓
Phase 3: Pedagogical Learning Orchestrator & Study Recipes (Prompts 3.1 - 3.3)
   ↓
Phase 4: Evidence-Based Learner Modeling & Deep Progress (Prompts 4.1 - 4.3)
   ↓
Phase 5: Resource Retrieval, Permissions, & Grounding (Prompts 5.1 - 5.3)
   ↓
Phase 6: Exam Intelligence & Predictive Study (Prompts 6.1 - 6.3)
   ↓
Phase 7: Study Planning, Timetables, & Proactive Reminders (Prompts 7.1 - 7.3)
   ↓
Phase 8: Cognee Deep Memory & Closed Outcome Feedback Loop (Prompts 8.1 - 8.3)
```

---

# Phase 1: Foundation & Gateway Repairs

## Prompt 1.1: Fix Express Gateway SSE Streaming

### Context & Goal
The Express reverse proxy in `server/index.ts` buffers HTTP responses with `await proxyResp.arrayBuffer()` before sending them to the client. This breaks Server-Sent Events (`/api/v1/chat/stream`), preventing the chat UI from streaming tokens and activities concurrently.

### Files to Inspect
- `server/index.ts`

### Implementation Instructions
1. In `server/index.ts`, inspect the `/api` route handler.
2. Before reading the response body, check if `proxyResp.headers.get("content-type")` includes `text/event-stream` or if `transfer-encoding` is `chunked`.
3. If it is an SSE or streaming response:
   - Copy headers from `proxyResp` to `res` (excluding hop-by-hop headers: `connection`, `keep-alive`, `transfer-encoding`).
   - Explicitly set:
     ```typescript
     res.setHeader("Content-Type", "text/event-stream");
     res.setHeader("Cache-Control", "no-cache");
     res.setHeader("Connection", "keep-alive");
     ```
   - Flush headers immediately using `res.flushHeaders?.()`.
   - Pipe the stream using `import { Readable } from "stream"; Readable.fromWeb(proxyResp.body as any).pipe(res);`.
   - Handle stream error and close events cleanly (`req.on("close", () => ...)`).
4. If it is NOT a streaming response, preserve the existing buffer/arrayBuffer forwarding logic for standard JSON REST endpoints.

### Verification Criteria
- Run `pnpm build && pnpm check`.
- Start the server and send a curl request:
  ```bash
  curl -N -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Hello"}]}' http://localhost:3000/api/v1/chat/stream
  ```
- Events (`data: ...`) must arrive progressively line-by-line without buffering.

---

## Prompt 1.2: Resolve 11 Failing Pytest Suite Tests

### Context & Goal
The Python test suite currently has 11 failing tests out of 385 due to signature mismatches, mock differences, missing authentication headers, and tuple returns.

### Files to Inspect
- `api/tests/test_chat_routes.py`
- `api/tests/test_component_generation.py`
- `api/tests/test_intent_extraction.py`
- `api/tests/test_interactions.py`
- `api/tests/test_new_endpoints.py`
- `api/tests/test_services.py`
- `api/app/routes/chat.py`
- `api/app/services/user_store.py`

### Implementation Instructions
1. **`api/tests/test_chat_routes.py`**:
   - `build_orchestrator_prompt` returns `tuple[str, list[dict]]`. Update all test call sites from `prompt = await build_orchestrator_prompt(...)` to `prompt, rag_chunks = await build_orchestrator_prompt(...)` so string membership assertions like `"RECALLED CONTEXT FROM MEMORY" in prompt` succeed.
   - In `test_stream_emits_full_artifact_payload_when_generation_succeeds`, update the line filter from `'"type": "artifact"'` to `'"type": "activity"'` to match `chat.py` line 533.
2. **`api/tests/test_interactions.py`**:
   - In `test_low_score_surfaces_as_knowledge_gap_next_turn` and `test_student_a_low_score_never_appears_in_student_b_recall`, unpack the tuple returned by `build_orchestrator_prompt`: `prompt, _ = await build_orchestrator_prompt(...)`.
3. **`api/tests/test_intent_extraction.py`**:
   - In `test_philosophy_quiz_preserves_subject`, verify `intent.subject == "Philosophy"`. Update the assertion to reflect that whole-subject scopes set `topic = intent.subject` or `topic is None` consistently across `extract_intent()`.
4. **`api/tests/test_component_generation.py`**:
   - In `test_max_attempts_defaults_to_one`, patch `app.services.model_router.model_router.generate_json` instead of `google_ai.generate_gemini_json`, because the component generation pipeline now calls `model_router`.
5. **`api/tests/test_new_endpoints.py`**:
   - In `TestWebSocketBroadcast.test_broadcast_disabled` and `test_broadcast_enabled`, pass `headers={"Authorization": "Bearer valid-token"}` in the `client.post("/ws/broadcast", ...)` calls.
6. **`api/tests/test_services.py`**:
   - In `TestUserStoreAsync.test_update_user_not_found`, update `UserStore.update_user` in `api/app/services/user_store.py` so that when no record is updated, it returns `{"id": user_id, "updated": False}` instead of raising or returning an empty dict without an `"id"` key.

### Verification Criteria
- Run `cd api && python3 -m pytest`.
- Result must be: **385 passed, 0 failed**.

---

## Prompt 1.3: Multi-Format Academic Document Ingestion Engine

### Context & Goal
Currently, `upload_material` in `api/app/routes/resource_routes.py` blindly does `content.decode("utf-8", errors="ignore")`, which turns uploaded PDF and Word documents into corrupted binary strings.

### Files to Inspect
- `api/app/routes/resource_routes.py`
- `api/app/services/embedding_service.py`
- `api/requirements.txt`

### Implementation Instructions
1. Add `pypdf>=5.0.0` and `python-docx>=1.1.0` to `api/requirements.txt` and install them in the virtual environment.
2. Create `api/app/services/document_parser.py`:
   - Implement `DocumentParser.extract_text(filename: str, content: bytes) -> tuple[str, list[dict]]`:
     - If filename ends with `.pdf`: use `pypdf.PdfReader(io.BytesIO(content))`, extracting text page by page. Return concatenated full text and page-indexed metadata `[{"page": i + 1, "text": page_text}, ...]`.
     - If filename ends with `.docx`: use `docx.Document(io.BytesIO(content))`, extracting paragraph text. Return full text and section metadata.
     - If `.txt`, `.md`, or `.markdown`: decode UTF-8 with fallback to Latin-1.
     - If unsupported format: raise `ValueError(f"Unsupported file format: {ext}")`.
3. In `api/app/routes/resource_routes.py`:
   - Replace raw decode with `DocumentParser.extract_text(file.filename, content)`.
   - Update chunking logic so each chunk tracks its originating page/section:
     ```python
     # Each chunk in summa_ai.resource_chunks records:
     # location: "Page 3" or "Section 2"
     ```
   - Update `summa_ai.materials` status to `ready` upon successful embedding, or `error` if parsing fails.
4. Add comprehensive unit tests in `api/tests/test_document_parser.py` testing PDF, DOCX, and text extraction with mocked file buffers.

### Verification Criteria
- Run `pytest api/tests/test_document_parser.py`.
- Upload a test PDF file to `/api/v1/materials/upload` and verify that the stored chunks contain clean, readable English text and page numbers.

---

# Phase 2: Unified Activity Engine & Structured Contracts

## Prompt 2.1: Activity Schema & Vocabulary Expansion

### Context & Goal
The Master Prompt specifies an extensible Activity Engine with a broad pedagogical vocabulary:
- **Teaching**: Explanation, Analogy, Worked Example, Concept Breakdown, Socratic Questioning.
- **Retrieval & Memory**: Flashcard, Free Recall, Spaced Review, Rapid Recall.
- **Assessment**: MCQ, Short Answer, True/False, Fill in Blank, Matching, Ordering, Scenario.
- **Understanding**: Compare & Contrast, Categorization, Cause & Effect.
- **Exam Prep**: Past Question Analysis, Predicted Practice, Exam Readiness, Exam Simulation.
- **Session & Progress**: Milestone, Learning Path, Session Plan, Session Summary.

### Files to Inspect
- `api/app/models/components.py`
- `api/app/models/activity.py`

### Implementation Instructions
1. In `api/app/models/components.py`, define Pydantic v2 schemas for the missing activity types:
   - `MatchingComponent`: `pairs: list[dict[str, str]]`, `distractors: list[str]`.
   - `OrderingComponent`: `items: list[str]`, `correct_order: list[int]`.
   - `FillBlankComponent`: `template: str`, `blanks: list[dict[str, list[str]]]`.
   - `ScenarioComponent`: `context: str`, `dilemma: str`, `options: list[dict[str, Any]]`.
   - `PastQuestionComponent`: `year: Optional[str]`, `question_text: str`, `marks: Optional[int]`, `recurring_pattern: str`, `suggested_approach: str`.
   - `PredictedPracticeComponent`: `target_concept: str`, `structural_basis: str`, `practice_question: str`, `rubric: list[str]`.
   - `MilestoneComponent`: `milestone_title: str`, `achieved_evidence: str`, `mastery_level: float`, `next_objective: str`.
   - `StudyPlanComponent`: `title: str`, `exam_date: Optional[str]`, `daily_sessions: list[dict]`.
2. Add these models to the `ComponentData` union and `COMPONENT_TYPE_MAP` with discriminator `type`.
3. In `api/app/services/local_component_builder.py`, add deterministic offline template builders for each new type so local fallback is guaranteed if LLM calls time out.
4. Add unit tests in `api/tests/test_expanded_components.py` validating that every component type serializes and validates round-trip without validation errors.

### Verification Criteria
- `pytest api/tests/test_expanded_components.py` passes with 100% schema compliance.

---

## Prompt 2.2: Unified Activity Attempt & Completion API

### Context & Goal
Students must be able to interact with any generated activity, record evidence, receive diagnostic feedback, and update their learner model. Only `/interactions/quiz-result` currently exists.

### Files to Inspect
- `api/app/routes/interactions.py`
- `api/app/models/interactions.py`
- `api/app/services/mastery_engine.py`
- `api/app/services/misconception_engine.py`

### Implementation Instructions
1. In `api/app/models/interactions.py`, create:
   ```python
   class ActivityAttemptCreate(BaseModel):
       activity_id: str
       activity_type: str
       concept_ids: list[str] = Field(default_factory=list)
       step_index: Optional[int] = None
       interaction_type: str  # "select_option", "flip_card", "rate_confidence", "submit_text", "reorder"
       payload: dict[str, Any]
       correct: Optional[bool] = None
       score: Optional[float] = None
       response_time_ms: Optional[int] = None
       confidence_rating: Optional[int] = None  # 1 to 5

   class ActivityCompleteCreate(BaseModel):
       activity_id: str
       concept_ids: list[str]
       total_score: float
       completed_steps: int
       time_spent_seconds: int
   ```
2. In `api/app/routes/interactions.py`, implement:
   - `POST /api/v1/activities/{id}/attempt`:
     - Resolves authenticated `user_id`.
     - Calls `MasteryEngine.record_attempt(...)` with concept IDs, score, response time, and difficulty.
     - If `correct is False` or `score < 70`, calls `MisconceptionEngine.analyze_and_record(...)`.
     - If activity is flashcard/recall, calls `SpacedRepetitionEngine.record_review(...)`.
     - Inserts row into `summa_ai.activity_attempts`.
     - Returns `{ "status": "recorded", "delta_mastery": ..., "misconception_flagged": ... }`.
   - `POST /api/v1/activities/{id}/complete`:
     - Records activity completion state in `summa_ai.learning_activities`.
     - Computes session-level progress signals.
     - Emits `ACTIVITY_COMPLETED` timeline event.
3. Keep `POST /interactions/quiz-result` as a backward-compatible wrapper calling the new unified engine.
4. Add tests in `api/tests/test_activity_interactions.py`.

### Verification Criteria
- `pytest api/tests/test_activity_interactions.py` passes.
- Calling `POST /api/v1/activities/test-123/attempt` creates records in `summa_ai.activity_attempts` and recalculates concept mastery in real time.

---

## Prompt 2.3: Dynamic Chat Component Renderer & Viewport Safety

### Context & Goal
Currently, `client/src/components/chat/ChatComponentRenderer.tsx` only renders 6 component types and dumps raw JSON for everything else. Furthermore, components can overflow viewports and cause layout instability.

### Files to Inspect
- `client/src/components/chat/ChatComponentRenderer.tsx`
- `client/src/components/learning/`
- `client/src/pages/Home.tsx`

### Implementation Instructions
1. Refactor `ChatComponentRenderer.tsx` into a modular dispatcher:
   - Extract individual renderers into `client/src/components/chat/renderers/`:
     - `QuizRenderer.tsx` (MCQ, Multi-select, True/False)
     - `FlashcardsRenderer.tsx` (3D Flip, SM-2 confidence ratings)
     - `ShortAnswerRenderer.tsx` (Text submission with AI model comparison)
     - `MatchingRenderer.tsx` (Drag/tap pair matching)
     - `OrderingRenderer.tsx` (Sequence ordering)
     - `ScenarioRenderer.tsx` (Dilemma branching)
     - `PastQuestionRenderer.tsx` (Exam pattern badge, structural analysis, past paper metadata)
     - `PredictedPracticeRenderer.tsx` (Probabilistic prediction tag, rubric)
     - `ReadinessCardRenderer.tsx` (Radar/bar breakdown by knowledge, recall, application)
     - `MilestoneRenderer.tsx` (Celebration badge, evidence detail)
     - `StudyPlanRenderer.tsx` (Day-by-day timetable with "Approve" button)
2. Connect each renderer to the new `POST /api/v1/activities/{id}/attempt` and `complete` endpoints using `fetchApi`.
3. Implement Viewport Safety & Density Management:
   - Wrap every renderer in a viewport-safe container: `max-h-[500px] overflow-y-auto rounded-2xl border`.
   - When an activity is completed, automatically collapse it into an **Evidence Summary Pill**:
     - Example: `✓ Epistemology Quiz Complete — 4/5 Correct (80%) · Estimated Mastery: 74% [View Details]`
     - Clicking "View Details" expands the full interactive turn.
4. Ensure full keyboard accessibility (`Tab`, `Space`, `Enter`, `1-4`, `Arrow keys`).

### Verification Criteria
- Run `pnpm check`.
- In the browser, emit any activity type; verify it renders cleanly without raw JSON, respects bounded height, and collapses into a summary upon completion.

---

# Phase 3: Pedagogical Learning Orchestrator & Study Recipes

## Prompt 3.1: Complete Study Recipe Engine

### Context & Goal
The Master Prompt (Section 8) mandates that Summa "cooks" study sessions using dynamically selected combinations of activities rather than generating random widgets.

### Files to Inspect
- `api/app/services/study_recipes.py`
- `api/app/services/orchestrator.py`

### Implementation Instructions
1. In `api/app/services/study_recipes.py`, implement all 7 pedagogical study recipes:
   - `NEW_TOPIC`: `[DIAGNOSTIC, EXPLAIN, EXAMPLE, RETRIEVAL, GUIDED_PRACTICE, INDEPENDENT_PRACTICE, SUMMARY]`
   - `WEAK_TOPIC`: `[MISCONCEPTION_DIAGNOSIS, ALTERNATIVE_EXPLANATION, ANALOGY, WORKED_EXAMPLE, GUIDED_PRACTICE, INDEPENDENT_PRACTICE, REASSESSMENT]`
   - `MEMORY_REPAIR`: `[FREE_RECALL, FLASHCARD, RETRIEVAL, INTERLEAVING, DELAYED_RETRIEVAL]`
   - `EXAM_PREPARATION`: `[DIAGNOSTIC, HIGH_YIELD_CONCEPTS, WEAKNESS_DETECTION, EXAM_QUESTIONS, ERROR_CORRECTION, SIMILAR_PRACTICE, TIMED_ASSESSMENT]`
   - `EXAM_TOMORROW`: `[RAPID_DIAGNOSTIC, PRIORITY_RANKING, HIGH_YIELD_REVISION, TARGETED_RETRIEVAL, PAST_QUESTION_PATTERNS, PREDICTED_PRACTICE, WEAKNESS_REPAIR, FINAL_READINESS]`
   - `STUDENT_STRUGGLING`: `[REDUCE_DIFFICULTY, SIMPLIFY_EXPLANATION, WORKED_EXAMPLE, GUIDED_QUESTION, IMMEDIATE_FEEDBACK, CONFIDENCE_RESTORATION, GRADUAL_DIFFICULTY_INCREASE]`
   - `STUDENT_ADVANCED`: `[REDUCE_EXPLANATION, INCREASE_DIFFICULTY, APPLICATION, NOVEL_SCENARIO, OPEN_ENDED_REASONING, EXAM_CHALLENGE]`
2. Upgrade `RecipeSelector.select_recipe(...)`:
   - Takes: `mastery_snapshot`, `consecutive_failures`, `consecutive_successes`, `exam_proximity_days`, `misconception_active`, `available_minutes`.
   - Returns the optimal recipe name and the next recommended step in that recipe.
3. Write unit tests in `api/tests/test_study_recipes_full.py` verifying each selection branch.

### Verification Criteria
- `pytest api/tests/test_study_recipes_full.py` passes with 100% branch coverage.

---

## Prompt 3.2: Dynamic Orchestrator Decision Engine & Context Assembly

### Context & Goal
The Learning Orchestrator must select the next pedagogical action without cross-domain contamination, grounding decisions in the student's active subject, exam proximity, and learner state.

### Files to Inspect
- `api/app/services/orchestrator.py`
- `api/app/routes/chat.py`
- `api/app/services/intent_extraction.py`

### Implementation Instructions
1. In `api/app/services/orchestrator.py`:
   - When `user_id` has an active study session or approved plan, load the current recipe step.
   - If the student overrides (e.g. "Explain that differently", "Make it harder", "Quiz me", "I have 10 minutes", "I'm tired"), adapt immediately:
     - "Make it harder" $\to$ switch to `STUDENT_ADVANCED`.
     - "Explain differently" $\to$ switch to `ANALOGY` or `WORKED_EXAMPLE`.
     - "Quiz me" $\to$ trigger `DIAGNOSTIC` or `RETRIEVAL`.
     - "I have 10 minutes" $\to$ cap recipe steps to short high-yield activities.
2. In `api/app/routes/chat.py`:
   - In `build_orchestrator_prompt`:
     - Cleanly inject active recipe step, current mastery summary, and active misconceptions.
     - Return `(prompt_text, rag_chunks)` tuple.
3. Emit `next_action` and `recipe_step` events in the SSE stream so the frontend is aware of pedagogical progression.
4. Add unit tests in `api/tests/test_orchestrator_adaptation.py`.

### Verification Criteria
- `pytest api/tests/test_orchestrator_adaptation.py` passes.
- Sending a message saying "I don't understand this" causes the orchestrator to adapt from `TEACH` to `STUDENT_STRUGGLING` (simpler explanation with an analogy).

---

## Prompt 3.3: Dynamic Difficulty & Scaffolding Engine

### Context & Goal
Activities must have dynamic difficulty levels (`beginner`, `easy`, `medium`, `hard`, `exam-level`, `advanced`) that adjust automatically based on student performance.

### Files to Inspect
- `api/app/services/mastery_engine.py`
- `api/app/services/component_generation.py`
- `api/app/models/components.py`

### Implementation Instructions
1. In `MasteryEngine`, implement difficulty adjustment rules:
   - 3 consecutive correct answers on concept $\to$ step difficulty up (`medium` $\to$ `hard` $\to$ `exam-level`).
   - 2 consecutive incorrect answers $\to$ step difficulty down (`hard` $\to$ `medium` $\to$ `easy`) and provide hints.
   - Calculate `difficulty_adjusted_accuracy`: weighted accuracy score where harder questions yield more mastery points.
2. In `component_generation.py`:
   - Pass `suggested_difficulty` into the LLM system prompt and local templates.
   - For `easy`/`beginner`: provide hints, simpler vocabulary, fewer distractors.
   - For `exam-level`/`advanced`: generate multi-step application scenarios with plausible distractors.
3. Update unit tests in `api/tests/test_adaptive_difficulty.py`.

### Verification Criteria
- `pytest api/tests/test_adaptive_difficulty.py` passes.
- Repeated correct answers increase the difficulty tag in generated activity payloads.

---

# Phase 4: Evidence-Based Learner Modeling & Deep Progress

## Prompt 4.1: Multi-Dimensional Mastery Engine & Recency Decay

### Context & Goal
Progress must not simply be "percentage of lessons completed". It must track real mastery across multiple dimensions: Knowledge Recall, Conceptual Understanding, Problem Solving, Speed, Confidence, and Retention.

### Files to Inspect
- `api/app/services/mastery_engine.py`
- `api/app/models/study.py`

### Implementation Instructions
1. In `api/app/services/mastery_engine.py`:
   - Implement multi-dimensional mastery aggregation:
     $$\text{Mastery} = w_{\text{rec}} \cdot \left( 0.35 \cdot \text{Recall} + 0.35 \cdot \text{Application} + 0.15 \cdot \text{Accuracy} + 0.15 \cdot \text{Confidence} \right)$$
   - Exponential decay:
     $$w_{\text{decay}} = e^{-\lambda \cdot \Delta t_{\text{days}}},\quad \lambda = 0.05 \quad (\text{half-life } \approx 14 \text{ days})$$
   - If $\Delta t_{\text{days}} > 14$, mark `stale = True` and reduce confidence in mastery.
2. Provide concept-level rollups:
   - `get_concept_mastery(user_id, concept_id)`: returns depth, recall, problem_solving, stale status, last_evidence_at.
   - `get_course_mastery(user_id, course_id)`: aggregates all concepts for a course/subject.
3. Store computed mastery records in `summa_ai.mastery_records`.
4. Add unit tests in `api/tests/test_mastery_model_multidimensional.py`.

### Verification Criteria
- `pytest api/tests/test_mastery_model_multidimensional.py` passes.
- Simulating 3 correct answers yields high mastery; advancing simulated timestamp by 20 days decays mastery and sets `stale = True`.

---

## Prompt 4.2: Real Misconception Detection & Dynamic Correction Loop

### Context & Goal
The system must explicitly detect, track, and remediate conceptual misunderstandings (e.g. confusing Rationalism with Empiricism).

### Files to Inspect
- `api/app/services/misconception_engine.py`
- `api/app/services/orchestrator.py`
- `api/app/services/component_generation.py`

### Implementation Instructions
1. In `api/app/services/misconception_engine.py`:
   - When a student fails 2 or more questions on related concepts, analyze the incorrect choices.
   - Use LLM structured classification to extract:
     - Confused concepts (e.g. `Concept A: Rationalism`, `Concept B: Empiricism`).
     - Specific root misconception (e.g. `Student associates empiricism with innate logic rather than sensory observation`).
   - Store in `summa_ai.misconceptions` with `occurrences`, `confidence`, and `status = "active"`.
2. In `orchestrator.py`:
   - When an active misconception exists for the current topic, trigger the `COMPARE` action.
   - Generate a side-by-side comparison activity (`ComparisonRenderer`) or contrastive flashcard explicitly resolving the confusion.
   - When the student successfully answers a contrastive question, mark the misconception as `resolved`.
3. Add unit tests in `api/tests/test_misconception_remediation.py`.

### Verification Criteria
- `pytest api/tests/test_misconception_remediation.py` passes.
- Emitting 2 wrong answers contrasting two concepts generates a targeted comparison card in the subsequent chat turn.

---

## Prompt 4.3: Concept Mastery Map & Next-Action Recommendation API

### Context & Goal
Remove all hardcoded references to "CSC 201", "Dynamic Dispatch & Overriding", and "Polymorphism". Provide a dynamic API for concept mastery, course progress, and "What should I study now?".

### Files to Inspect
- `api/app/routes/progress_routes.py`
- `api/app/services/orchestrator.py`
- `client/src/pages/Home.tsx`

### Implementation Instructions
1. In `api/app/routes/progress_routes.py`:
   - In `get_next_best_action()`:
     - Remove the hardcoded fallback `"Dynamic Dispatch & Overriding"`.
     - Inspect the student's active enrolled subjects, upcoming exam dates, and lowest concept mastery.
     - Determine the next best action dynamically:
       ```python
       # Priority:
       # 1. Topic with exam in < 5 days and mastery < 70%
       # 2. Topic with stale mastery (> 14 days without review)
       # 3. Active misconception requiring remediation
       # 4. Next unstarted concept in current course outline
       ```
     - Return `{ "action": ..., "target_subject": ..., "target_concept": ..., "reason": ..., "estimated_minutes": ... }`.
2. In `client/src/pages/Home.tsx`:
   - Replace hardcoded `masteryData`, `capabilities`, and `milestoneData` with live data fetched from `/api/v1/courses/:id/mastery` and `/api/v1/student/next-action`.
   - In the sidebar / home overview, render the real student focus:
     - Next exam countdown.
     - Recommended daily session.
     - Weakest concept with direct "Start Session" button.

### Verification Criteria
- Querying `GET /api/v1/student/next-action` returns the student's actual weakest concept with a human-readable reason.
- Frontend overview displays the student's real enrolled courses rather than CSC 201.

---

# Phase 5: Resource Retrieval, Permissions, & Grounding

## Prompt 5.1: Granular Resource Consent & Scope Management

### Context & Goal
The system must never silently search or use student materials without consent. When relevant materials exist, Summa asks permission with explicit scopes: "This session", "This subject", or "Always allow".

### Files to Inspect
- `api/app/routes/resource_routes.py`
- `client/src/components/chat/renderers/ResourceConsentRenderer.tsx`
- `client/src/pages/Home.tsx`

### Implementation Instructions
1. In `api/app/routes/resource_routes.py`:
   - Implement `GET /api/v1/resources/pending-consent?subject=...`: checks if uploaded materials match the conversation subject but lack active permission.
   - Implement `POST /api/v1/resources/permissions`:
     ```python
     class PermissionRequest(BaseModel):
         resource_ids: list[str]
         scope: Literal["session", "subject", "permanent"]
         conversation_id: Optional[str] = None
     ```
     - Stores permissions in `summa_ai.resource_permissions`.
2. In `client/src/components/chat/renderers/ResourceConsentRenderer.tsx`:
   - Create a clean card:
     > "I found 3 relevant resources for Philosophy: *Lecture Notes.pdf*, *Syllabus.docx*, *Past Questions 2024.pdf*. Would you like me to use them for your study session?"
     - Buttons: `[Use all for this session]` `[Always allow for Philosophy]` `[Choose specific]` `[Don't use]`
   - Dispatch selection to `POST /api/v1/resources/permissions`.
3. In `api/app/services/vector_search.py`:
   - Restrict vector retrieval strictly to `resource_id`s with valid permissions for the active user/session/subject.

### Verification Criteria
- Uploading materials and initiating a new subject conversation triggers the consent card in chat. Declining prevents documents from being accessed during retrieval.

---

## Prompt 5.2: SummaStudy Community Library & Student Resource RAG Search

### Context & Goal
Enable unified semantic search across both student-uploaded documents and the SummaStudy community-maintained academic resource library.

### Files to Inspect
- `api/app/services/vector_search.py`
- `api/app/services/summastudy_client.py`
- `api/app/routes/resource_routes.py`

### Implementation Instructions
1. In `api/app/services/vector_search.py`:
   - Implement hybrid retrieval combining pgvector semantic cosine similarity + full-text search (tsvector).
   - Add query routing:
     - Source A: `summa_ai.resource_chunks` (student personal materials).
     - Source B: `SummaStudyClient.search_community_library(query, subject)` (external shared academic library).
   - Re-rank results favoring student-specific course notes when preparing for course-specific exams.
2. If conflict exists between student notes and general textbooks:
   - Preserve both claims with explicit provenance notes:
     > "Your lecture notes define this term with emphasis on X, while general textbooks emphasize Y. Since your exam tests your lecturer's curriculum, we will prioritize X."
3. Add tests in `api/tests/test_vector_search_permissions.py`.

### Verification Criteria
- `pytest api/tests/test_vector_search_permissions.py` passes.
- Searches return authorized chunks with source attribution and re-ranking.

---

## Prompt 5.3: Source Provenance Grounding & Compact Citation Drawer

### Context & Goal
When answering based on resources, make provenance visible without cluttering the chat with distracting academic footnotes.

### Files to Inspect
- `client/src/components/chat/SourcesChips.tsx`
- `client/src/components/learning/resource/citation-drawer.tsx`
- `api/app/routes/chat.py`

### Implementation Instructions
1. In `api/app/routes/chat.py`:
   - When RAG chunks are used in generation, emit a `sources` event in the SSE stream containing:
     ```json
     {
       "type": "sources",
       "sources": [
         { "id": "chunk-1", "title": "Philosophy Lecture Notes", "location": "Page 14", "snippet": "..." }
       ]
     }
     ```
2. In `client/src/components/chat/SourcesChips.tsx`:
   - Render a discreet source badge beneath the AI turn: `📄 Philosophy Lecture Notes (p. 14)`.
   - Clicking the badge opens `citation-drawer.tsx` in a calm side sheet showing the exact excerpt, source date, and relevance score.
3. Prevent citation clutter: maximum 3 chips shown inline, with "+1 more" overflow.

### Verification Criteria
- When an AI message references notes, clicking the source chip opens the drawer displaying the excerpt and page number cleanly.

---

# Phase 6: Exam Intelligence & Predictive Study

## Prompt 6.1: Past Question Analysis & Pattern Extraction Engine

### Context & Goal
Given historical past questions, analyze recurring topics, frequency distributions, question structures, and mark allocations without falsely claiming certainty.

### Files to Inspect
- `api/app/services/pattern_analysis.py`
- `api/app/models/study.py`

### Implementation Instructions
1. In `api/app/services/pattern_analysis.py`:
   - Enhance `PatternAnalysisEngine.analyze_patterns(questions)`:
     - Group by topic and calculate frequency percentage.
     - Extract recurring question structures (e.g. "Definition $\to$ Compare $\to$ Real-world Application").
     - Calculate topic trends across years (e.g. "Epistemology appeared in 2022, 2023, 2024").
     - Sanitize all generated summaries against certainty phrases:
       - Deny: "will be on the exam", "guaranteed question", "definitely tested".
       - Enforce: "frequently tested historically", "high recurrence in available past papers".
2. Create database table `summa_ai.past_questions` via Alembic migration if not present:
   - `id`, `user_id`, `course_id`, `year`, `question_text`, `topic`, `marks`, `question_type`.
3. Add endpoint `POST /api/v1/past-questions/analyze`:
   - Returns structured pattern analysis with topic distribution and recurring structures.
4. Add unit tests in `api/tests/test_past_question_patterns.py`.

### Verification Criteria
- `pytest api/tests/test_past_question_patterns.py` passes.
- Output text is strictly probabilistic and never asserts certainty.

---

## Prompt 6.2: Structural Predictive Practice Question Generator

### Context & Goal
Use historical question patterns to generate new practice questions with matching structures (rather than copying questions verbatim).

### Files to Inspect
- `api/app/services/pattern_analysis.py`
- `api/app/services/component_generation.py`
- `api/app/models/components.py`

### Implementation Instructions
1. In `api/app/services/pattern_analysis.py`, create `PredictivePracticeGenerator`:
   - Takes historical question structure (e.g. "Explain [Concept A] and discuss one implication for [Context B]").
   - Uses `model_router` with strict schema `PredictedPracticeComponent`:
     - `target_concept`: concept name.
     - `structural_basis`: explanation of which past exam pattern this mirrors.
     - `practice_question`: novel practice question.
     - `rubric`: key points an examiner looks for.
   - Distinctly labels output as:
     - `Historical Question` (if verbatim past question).
     - `Predicted Practice` (if structurally synthesized from patterns).
     - `Conceptual Practice` (if generic diagnostic).
2. Never misrepresent AI-generated questions as actual past exam questions.
3. Add tests in `api/tests/test_predictive_practice.py`.

### Verification Criteria
- `pytest api/tests/test_predictive_practice.py` passes.
- Generated practice cards clearly display the "Predicted Practice" badge and explain the structural pattern basis.

---

## Prompt 6.3: Multi-Dimensional Exam Readiness Model

### Context & Goal
Eliminate the hardcoded "Polymorphism Foundations" in `ExamReadinessEngine`. Build a genuine multi-dimensional readiness model.

### Files to Inspect
- `api/app/services/pattern_analysis.py`
- `api/app/routes/study_routes.py`
- `client/src/components/learning/exam/exam-readiness.tsx`

### Implementation Instructions
1. In `api/app/services/pattern_analysis.py`, refactor `ExamReadinessEngine.compute_readiness(user_id, exam_id)`:
   - Query the exam record from `DataStore` to retrieve subject, target course, and exam date.
   - Load all concept mastery records associated with that course.
   - Compute readiness across 5 dimensions:
     - `knowledge_recall` (average recall score).
     - `conceptual_understanding` (average depth score).
     - `application_problem_solving` (average problem solving score).
     - `exam_practice_accuracy` (accuracy on exam-level practice questions).
     - `timed_performance` (speed vs target benchmark).
   - Dynamically compute:
     - `strong_topics`: concepts with mastery $\ge 75\%$.
     - `developing_topics`: concepts with mastery between $50\%$ and $74\%$.
     - `weak_topics`: concepts with mastery $< 50\%$.
   - Calculate overall readiness score weighted by exam topic frequency.
   - Include `uncertainty_note`: "Readiness is an estimate based on your study evidence, not a guaranteed grade."
2. Add route `GET /api/v1/exams/{id}/readiness`.
3. In `client/src/components/learning/exam/exam-readiness.tsx`, bind to this endpoint.

### Verification Criteria
- Running readiness check on a Philosophy exam with 3 recorded attempts returns Philosophy topics in `strong_topics` / `weak_topics` with no Java references.

---

# Phase 7: Study Planning, Timetables, & Proactive Reminders

## Prompt 7.1: Adaptive Study Timetable Generator & Approval Workflow

### Context & Goal
Generate a realistic, student-approved study schedule based on exam date, available hours per day, and current concept weaknesses.

### Files to Inspect
- `api/app/services/study_plan_generator.py`
- `api/app/routes/study_routes.py`
- `client/src/components/learning/session/session-plan.tsx`

### Implementation Instructions
1. In `api/app/services/study_plan_generator.py`:
   - Enhance `generate_plan(user_id, exam_id, available_days, minutes_per_day)`:
     - Calculate days remaining until `exam.date`.
     - Prioritize topics: High Exam Frequency $\times$ Low Student Mastery.
     - Allocate daily sessions:
       - Days 1 to $N-3$: Weak topic fundamentals + guided practice.
       - Days $N-2$: Past-question patterns + mixed practice.
       - Day $N-1$: High-yield review + rapid retrieval.
       - Exam day: Light confidence checkpoint or rest.
     - Create plan in `summa_ai.study_plans` with `approved = False`.
2. In `api/app/routes/study_routes.py`:
   - Implement `POST /api/v1/study-plans/{id}/approve`: sets `approved = True`, generates scheduled sessions in `summa_ai.study_sessions`.
3. In the chat, when a plan is generated, render `StudyPlanRenderer` with a prominent "Approve Schedule" button.

### Verification Criteria
- Generating a 6-day plan for Philosophy with weak Ethics schedules Ethics on Days 1-2, approved via one click, and reflected in `summa_ai.study_plans`.

---

## Prompt 7.2: Scheduled Notification Engine & Spaced Repetition Reminders

### Context & Goal
Deliver sparse, high-value, contextual study notifications (e.g. exam proximity, declining recall strength, daily session readiness).

### Files to Inspect
- `api/app/services/study_plan_generator.py`
- `api/app/main.py`
- `api/app/routes/data_routes.py`

### Implementation Instructions
1. In `api/app/services/notification_engine.py`:
   - Create `NotificationEngine.evaluate_triggers(user_id)`:
     - **Exam Proximity**: Exam in 7 days, 3 days, or 1 day.
     - **Decaying Recall**: Flashcards or concepts with `next_review_at <= now()`.
     - **Weakness Repair**: Weakest topic has an unstarted 20-minute review session.
     - **Daily Plan**: An approved study session is scheduled for today.
   - Enforce sparse delivery: maximum 1 study notification per day unless an exam is tomorrow.
   - Deliver into `summa_ai.notifications`.
2. Add background task in FastAPI lifespan (`api/app/main.py`) or on user heartbeat:
   - Runs `evaluate_triggers()` periodically for active users.
3. Expose `GET /api/v1/notifications` and `PATCH /api/v1/notifications/{id}/read`.
4. In frontend header, bind notification bell to this endpoint with unread count badge.

### Verification Criteria
- Setting a flashcard's `next_review_at` to yesterday generates a single, contextual notification: "You haven't reviewed Epistemology in 5 days. A 5-minute recall check is ready."

---

## Prompt 7.3: Frontend Study Plan Card & Session Resumability

### Context & Goal
Enable students to resume study sessions exactly where they left off and manage their active study timetable from the workspace canvas.

### Files to Inspect
- `client/src/pages/Home.tsx`
- `client/src/components/learning/session/resume-learning.tsx`
- `client/src/components/learning/session/session-progress.tsx`

### Implementation Instructions
1. In `client/src/pages/Home.tsx`:
   - In `WorkspaceView` and `EmptyWorkspace`:
     - Display an active "Resume Session" banner if an in-progress session or incomplete activity exists in local storage.
     - Clicking "Resume" restores the active conversation turn and scrolls directly to the pending interactive.
2. In `client/src/components/chat/renderers/StudyPlanRenderer.tsx`:
   - Render the approved timetable with interactive checkmarks for completed daily sessions.
   - Clicking a day's topic sends `"Start today's session on [Topic]"` into the chat automatically.
3. Save local activity session state on every interaction turn.

### Verification Criteria
- Leaving a session midway and returning shows the "Resume Session" card; clicking it restores the student's exact study state.

---

# Phase 8: Cognee Deep Memory & Closed Outcome Feedback Loop

## Prompt 8.1: Cognee Long-Term Structured Memory Integration & Relevance Filtering

### Context & Goal
Use Cognee as a deliberate, structured memory layer rather than a raw conversation dump. Retain student profile, academic context, learning state, and recurring errors.

### Files to Inspect
- `api/app/services/cognee_service.py`
- `api/app/routes/chat.py`
- `api/app/routes/memory.py`

### Implementation Instructions
1. In `api/app/services/cognee_service.py`:
   - Structure memory storage into clear categories:
     - `profile`: explanation style preferences, typical session length.
     - `academic_context`: enrolled courses, target exams, course syllabi.
     - `learning_state`: verified strengths, developing areas, persistent misconceptions.
     - `interaction_history`: significant learning milestones achieved.
   - Implement relevance filtering:
     - For each incoming chat turn, retrieve only memories relevant to `(user_id, current_subject, current_topic)`.
     - Cap memory context section to 1500 characters to prevent prompt bloat.
2. In `api/app/routes/memory.py`:
   - Implement `GET /api/v1/memory`: returns transparent view of what Summa remembers about the student.
   - Implement `DELETE /api/v1/memory/{id}`: allows student to inspect and delete individual memories (privacy compliance).
3. Add unit tests in `api/tests/test_cognee_structured_memory.py`.

### Verification Criteria
- `pytest api/tests/test_cognee_structured_memory.py` passes.
- Memories retrieved for a Philosophy turn only contain Philosophy facts, never leaking unrelated topics.

---

## Prompt 8.2: Post-Exam Outcome Loop & Prediction Calibration

### Context & Goal
After an exam, Summa asks for outcome feedback and evaluates whether predicted topics and practice questions resembled the actual assessment.

### Files to Inspect
- `api/app/services/outcome_loop.py`
- `api/app/routes/study_routes.py`
- `client/src/components/learning/exam/post-exam-reflection.tsx`

### Implementation Instructions
1. In `api/app/services/outcome_loop.py`:
   - When an exam date passes, trigger the post-exam reflection flow.
   - Collect structured feedback:
     - `outcome_rating`: "Great", "Okay", "Difficult", "Very difficult".
     - `resembled_practice`: boolean.
     - `topics_appeared`: list of topics that actually appeared.
     - `unprepared_topics`: topics student felt unprepared for.
   - Compute Prediction Accuracy Calibration:
     $$\text{Calibration Score} = \frac{|\text{Predicted Topics} \cap \text{Appeared Topics}|}{|\text{Appeared Topics}|}$$
   - Store calibration results to adjust weighting in future predictive generation.
2. In `client/src/components/learning/exam/post-exam-reflection.tsx`:
   - Create a calm, non-judgmental reflection component rendered in chat after the exam.
   - Submit responses to `POST /api/v1/exams/{id}/feedback`.
3. Add tests in `api/tests/test_outcome_loop_calibration.py`.

### Verification Criteria
- `pytest api/tests/test_outcome_loop_calibration.py` passes.
- Completing exam reflection updates calibration data in `summa_ai.exam_predictions`.

---

## Prompt 8.3: End-to-End Philosophy Study Flow Verification & Vitest Suite

### Context & Goal
Verify the complete end-to-end user journey defined in Master Prompt Section 59:
> "Help me study for my Philosophy test" $\to$ Diagnosis $\to$ 6-day study path $\to$ Guided lessons $\to$ Misconception correction $\to$ Predicted practice $\to$ Exam readiness $\to$ Reflection.
Also establish the frontend test suite.

### Files to Inspect
- `api/tests/test_e2e_pipeline.py`
- `client/src/__tests__/`
- `package.json`

### Implementation Instructions
1. Setup Vitest frontend test suite:
   - Add `"test": "vitest run"` to `package.json`.
   - Create `client/src/__tests__/ChatComponentRenderer.test.tsx`: test rendering and interaction of Quiz, Flashcard, Scenario, and Study Plan.
   - Create `client/src/__tests__/WorkspaceView.test.tsx`: test turn ordering, SSE stream handling, and error recovery.
2. In `api/tests/test_e2e_pipeline.py`:
   - Implement end-to-end integration test simulating:
     1. User sends: "Help me study for my Philosophy test".
     2. Orchestrator detects exam goal and requests document consent.
     3. User grants consent; system generates a 5-question diagnostic.
     4. User answers questions; learner model records Socrates=strong, Epistemology=weak.
     5. System generates 6-day adaptive study plan; user approves.
     6. Orchestrator deploys Epistemology guided lesson $\to$ detects Rationalism vs Empiricism confusion $\to$ deploys comparison card.
     7. Spaced review scheduled for 3 days later.
     8. Exam readiness evaluated; predicted practice generated based on question patterns.
     9. Post-exam reflection submitted and prediction accuracy calibrated.
3. Run all test suites.

### Verification Criteria
- `cd api && python3 -m pytest` passes with **100% tests passing**.
- `pnpm test` runs and passes all frontend Vitest tests.
- `pnpm check` passes with 0 TypeScript compiler errors.
- `pnpm build` succeeds with a clean production bundle.
