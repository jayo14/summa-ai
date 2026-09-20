# Summa AI — Codebase Audit & Prioritized Implementation Backlog (`FIXES.md`)

## Executive Summary

Summa AI aims to be an **adaptive study operating system** whose conversational interface acts as the primary control surface:
$$\text{Understand} \to \text{Diagnose} \to \text{Plan} \to \text{Teach} \to \text{Practice} \to \text{Assess} \to \text{Adapt} \to \text{Remember} \to \text{Review} \to \text{Predict} \to \text{Prepare}$$

This audit is based on an exhaustive, end-to-end examination of the actual codebase across:
1. **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS (v4) + Wouter.
2. **Backend**: FastAPI + Asyncpg + Alembic migrations (`summa_ai` schema) + Supabase Auth / JWKS + Cognee.
3. **Gateway**: Node.js / Express proxy (`server/index.ts`).
4. **Test Suite**: 385 Pytest backend tests (374 passing, 11 failing) and 0 frontend unit/component tests.

---

## Priority Classification Scheme

- **P0 — Critical / Blocking**: Fatal architectural flaws, data corruption, broken streaming pipelines, test suite regressions, hardcoded domain leakages that prevent the system from functioning across subjects.
- **P1 — Required for Full Functionality**: Core adaptive loops, missing API endpoints, disconnected component engines, incomplete study recipes, absent consent flows, unexecuted outcome loops.
- **P2 — Important Improvements**: Viewport safety, activity state resumability, network resilience, real speech-to-text, source citation grounding.
- **P3 — Polish / Optimization**: Deprecation of dead mock artifacts, accessibility compliance, performance profiling, and educational metrics telemetry.

---

# P0 — Critical / Blocking

### P0-1: Express Gateway Buffers Real-Time Server-Sent Events (SSE)
* **Problem**: The Express proxy server in `server/index.ts` buffers entire HTTP responses into memory with `await proxyResp.arrayBuffer()` before sending them to the client.
* **Evidence / Location**: `server/index.ts` lines 39–54:
  ```typescript
  const proxyResp = await fetch(targetUrl, { method: req.method, headers, body });
  ...
  const buffer = await proxyResp.arrayBuffer();
  res.send(Buffer.from(buffer));
  ```
* **Why It Matters**: The chat endpoint `/api/v1/chat/stream` emits real-time Server-Sent Events (`text/event-stream`). By buffering the full arrayBuffer, Express blocks until the entire LLM generation is finished, completely destroying streaming tokens, thinking state indicators, and concurrent activity emission.
* **Dependencies**: Node `http`, `stream`, Express.
* **Recommended Solution**: Check `proxyResp.headers.get("content-type")`. If it contains `text/event-stream` or is a chunked stream, pipe `Readable.fromWeb(proxyResp.body).pipe(res)` directly and flush headers immediately (`res.flushHeaders()`).
* **Verification Criteria**: Connecting to `/api/v1/chat/stream` via the proxy begins streaming tokens within $< 500\text{ ms}$ without waiting for stream completion.

---

### P0-2: Ingestion Pipeline Corrupts Binary Files (PDFs & Documents)
* **Problem**: The resource upload endpoint treats all incoming uploaded files as raw UTF-8 text strings.
* **Evidence / Location**: `api/app/routes/resource_routes.py` lines 49–50:
  ```python
  content = await file.read()
  text = content.decode("utf-8", errors="ignore")
  ```
* **Why It Matters**: When a student uploads lecture slides, syllabi, or past questions in `.pdf` or `.docx` format, the binary bytecode is decoded with `errors="ignore"`, producing gibberish characters (e.g. `%PDF-1.5 %... obj << /Filter /FlateDecode ... >>`). These corrupt chunks are then embedded into pgvector, rendering retrieval and RAG completely broken.
* **Dependencies**: `pypdf` / `pdfplumber`, `python-docx`.
* **Recommended Solution**: Implement a `DocumentParser` service that inspects MIME type/extension:
  - If `.pdf`: extract text pages cleanly with `pypdf`.
  - If `.docx`: extract text paragraphs with `python-docx`.
  - If `.txt` / `.md`: decode UTF-8.
  - Reject unsupported binary formats gracefully with an HTTP 422 error.
* **Verification Criteria**: Uploading a standard 10-page academic PDF produces clean text chunks with preserved page numbering in `summa_ai.resource_chunks`.

---

### P0-3: 11 Broken Pytest Tests in Backend Suite
* **Problem**: Running `pytest` yields 11 failures out of 385 tests across 6 test modules.
* **Evidence / Location**:
  1. `tests/test_chat_routes.py`:
     - `test_prompt_with_memory_and_exams`: `build_orchestrator_prompt` signature changed to return `tuple[str, list[dict]]` instead of `str`.
     - `test_prompt_includes_onboarding_goals`: Same tuple unpack failure.
     - `test_prompt_includes_hybrid_memory`: Same tuple unpack failure.
     - `test_stream_emits_full_artifact_payload_when_generation_succeeds`: Searches for `"type": "artifact"`, but backend was refactored to emit `"type": "activity"`.
  2. `tests/test_interactions.py`:
     - `test_low_score_surfaces_as_knowledge_gap_next_turn`: Asserts `"KNOWLEDGE GAPS DETECTED" in prompt`, where `prompt` is a tuple.
     - `test_student_a_low_score_never_appears_in_student_b_recall`: Same tuple issue.
  3. `tests/test_intent_extraction.py`:
     - `test_philosophy_quiz_preserves_subject`: `assert intent.topic is None` fails because topic was parsed as `'Philosophy'`.
  4. `tests/test_component_generation.py`:
     - `test_max_attempts_defaults_to_one`: Tests mock `google_ai.generate_gemini_json`, but implementation was migrated to `model_router.generate_json`.
  5. `tests/test_new_endpoints.py`:
     - `test_broadcast_disabled` & `test_broadcast_enabled`: Return HTTP 401 Unauthorized because test requests lack JWT `Authorization` header.
  6. `tests/test_services.py`:
     - `test_update_user_not_found`: `updated["id"]` raises `KeyError` because `update_user` returns `{}` on nonexistent user.
* **Why It Matters**: Broken tests degrade test integrity, prevent continuous integration, and mask regressions in core orchestration.
* **Dependencies**: Pytest, FastAPI TestClient.
* **Recommended Solution**:
  - Update `build_orchestrator_prompt` call sites in tests to unpack `(prompt, rag_chunks)`.
  - Align SSE event type assertion to `"type": "activity"`.
  - Fix intent extractor assertion for subject vs topic scoping.
  - Patch `model_router.generate_json` in component generation tests.
  - Add `_auth_headers()` to `TestWebSocketBroadcast` calls.
  - Update `UserStore.update_user` to return `{"id": user_id, ...}` or None consistently.
* **Verification Criteria**: `python3 -m pytest` executes 385/385 tests passing with 0 failures.

---

### P0-4: Hardcoded Subject Leakage Across Learning Engines
* **Problem**: Multiple core backend and frontend services have hardcoded references to "CSC 201", "Polymorphism Foundations", "Dynamic Dispatch", and "Overriding", regardless of what the user is studying.
* **Evidence / Location**:
  - `api/app/services/pattern_analysis.py` lines 83–84:
    ```python
    "strong_topics": ["Polymorphism Foundations"] if readiness_score >= 70 else [],
    "developing_topics": ["Dynamic Dispatch"] if readiness_score < 70 else [],
    ```
  - `api/app/routes/progress_routes.py` line 71:
    ```python
    target_concept = decision.target_concept_ids[0] if decision.target_concept_ids else "Dynamic Dispatch & Overriding"
    ```
  - `api/app/services/study_plan_generator.py` line 31:
    ```python
    "topic": "Weak Concepts & Practice" if d % 2 == 1 else "Core Theory Review",
    ```
  - `client/src/pages/Home.tsx` lines 61–87, 126–132, 1350–1365:
    `chatHistory`, `getTutorResponse()`, `milestoneData`, `sourceCatalog`, and learner context are hardcoded to Java OOP polymorphism.
* **Why It Matters**: Directly violates the core product north star. When a student says "Help me study for my Philosophy test", the readiness report claims they are strong in "Polymorphism Foundations", the progress engine recommends "Dynamic Dispatch", and the timetable assigns generic placeholder text.
* **Dependencies**: `DataStore`, `MasteryEngine`, `ExamReadinessEngine`.
* **Recommended Solution**:
  - Dynamically derive strong/developing topics from actual concept mastery records filtered by `course_id` or `exam_id`.
  - Fall back to the active user's actual course syllabus topics.
  - Replace frontend hardcoded mock arrays with reactive queries to backend `/courses/:id/mastery`, `/exams/:id/readiness`, and `/conversations`.
* **Verification Criteria**: Creating an exam or studying "Philosophy" produces readiness breakdowns, study plans, and next actions strictly concerning Philosophy concepts.

---

### P0-5: Chat Component Renderer Lacks Activity Support & Drops to Raw JSON
* **Problem**: The live conversation renderer in `client/src/components/chat/ChatComponentRenderer.tsx` only renders 6 component types: `quiz`, `flashcards`, `comparison`, `hint-ladder`, `worked-example`, `short-answer`. Any other activity emitted by the backend falls into a fallback `<pre>{JSON.stringify(data, null, 2)}</pre>` block.
* **Evidence / Location**: `client/src/components/chat/ChatComponentRenderer.tsx` lines 88–121.
* **Why It Matters**: When the AI or Study Recipe selects scenario-based learning, true/false, fill-in-the-blank, matching, ordering, exam simulation, past questions, or milestones, the student sees raw unformatted JSON in the chat.
* **Dependencies**: React, Lucide, Tailwind CSS.
* **Recommended Solution**: Expand `ChatComponentRenderer` to dispatch all PRD activity types (`matching`, `ordering`, `categorization`, `scenario`, `teach-back`, `past-question`, `predicted-practice`, `exam-readiness`, `milestone`, `study-plan`), utilizing the design language already prototyped in the codebase.
* **Verification Criteria**: Every valid activity type renders a polished, interactive, accessible UI turn without any raw JSON dump.

---

# P1 — Required for Full Functionality

### P1-1: Unified Learning Activity Interaction Engine (`/activities/:id/attempt` & `/complete`)
* **Problem**: Only `/interactions/quiz-result` exists in `api/app/routes/interactions.py`. Generic activity attempts, multi-step question attempts, flashcard ratings, and completion signals have no standardized REST endpoints.
* **Evidence / Location**: `api/app/routes/interactions.py` lines 23–108; Master Prompt sections 50 & 51.
* **Why It Matters**: The activity loop cannot record evidence for flashcards, ordering, short-answers, or scenarios. Without recorded attempts, the Mastery Engine cannot update concept scores, detect misconceptions, or adjust difficulty.
* **Dependencies**: `MasteryEngine`, `MisconceptionEngine`, `DataStore`.
* **Recommended Solution**: Implement:
  - `POST /activities/:id/attempt`: records individual interaction step, response time, confidence, answer, correctness.
  - `POST /activities/:id/complete`: finalizes the activity session, computes delta mastery, triggers misconception classifier, updates spaced repetition schedule.
* **Verification Criteria**: Submitting an attempt for any activity updates `summa_ai.activity_attempts` and recalculates concept mastery in real time.

---

### P1-2: Expand Study Recipe Engine to Full Master Prompt Pedagogical Vocabulary
* **Problem**: `api/app/services/study_recipes.py` only implements 4 basic recipes (`NEW_TOPIC`, `WEAK_TOPIC`, `MEMORY_REPAIR`, `EXAM_TOMORROW`).
* **Evidence / Location**: `api/app/services/study_recipes.py` lines 14–37.
* **Why It Matters**: The system cannot adapt when a student is struggling (scaffolding down), when a student is advanced (challenging with novel scenarios), during multi-day exam prep, or during targeted misconception correction.
* **Dependencies**: `LearningOrchestrator`, `MasteryEngine`.
* **Recommended Solution**: Add the full recipe suite defined in Section 8 of the Master Prompt:
  1. `NEW_TOPIC`: Diagnostic $\to$ Explanation $\to$ Example $\to$ Simple retrieval $\to$ Guided practice $\to$ Independent question $\to$ Summary.
  2. `WEAK_TOPIC`: Misconception diagnosis $\to$ Alternative explanation $\to$ Analogy $\to$ Worked example $\to$ Guided practice $\to$ Independent practice $\to$ Reassessment.
  3. `MEMORY_REPAIR`: Free recall $\to$ Flashcard $\to$ Retrieval $\to$ Interleaving $\to$ Delayed retrieval.
  4. `EXAM_PREPARATION`: Diagnostic $\to$ High-yield concepts $\to$ Weakness detection $\to$ Exam-style questions $\to$ Error correction $\to$ Similar-question practice $\to$ Timed assessment.
  5. `EXAM_TOMORROW`: Rapid diagnostic $\to$ Priority ranking $\to$ High-yield revision $\to$ Targeted retrieval $\to$ Past-question patterns $\to$ Predicted practice $\to$ Weakness repair $\to$ Final readiness assessment.
  6. `STUDENT_STRUGGLING`: Reduce difficulty $\to$ Simplify explanation $\to$ Example $\to$ Guided question $\to$ Immediate feedback $\to$ Confidence restoration $\to$ Gradually increase difficulty.
  7. `STUDENT_ADVANCED`: Reduce explanation $\to$ Increase difficulty $\to$ Application $\to$ Novel scenario $\to$ Open-ended reasoning $\to$ Exam-level challenge.
* **Verification Criteria**: Unit tests verify that low mastery trigger `STUDENT_STRUGGLING` and consecutive high scores trigger `STUDENT_ADVANCED`.

---

### P1-3: Consent-Based Resource Discovery & Scope Authorization
* **Problem**: The system either silently queries all materials or fails to offer granular consent scopes. The UI has no consent dialogue allowing students to choose resource scope ("This session", "This subject", "Always allow").
* **Evidence / Location**: `api/app/routes/resource_routes.py` lines 137–159; `client/src/pages/Home.tsx` lines 375.
* **Why It Matters**: Violates PRD Principle 8 and Master Prompt Sections 22 & 23: Summa must never silently consume student data without explicit authorization and clear scope boundaries.
* **Dependencies**: `summa_ai.resource_permissions` table, `ChatComponentRenderer`.
* **Recommended Solution**:
  - Implement a `ResourceConsentCard` component that renders in chat when relevant materials are detected.
  - Provide 3 clear buttons: `[Use these resources]`, `[Select specific]`, `[Don't use]`.
  - Store granted scope (`session`, `subject`, `permanent`) in `summa_ai.resource_permissions`.
  - Respect this scope during RAG vector search in `VectorSearchService`.
* **Verification Criteria**: Querying a new topic displays the consent card; declining prevents the backend from injecting private document chunks into the prompt context.

---

### P1-4: Adaptive Study Timetable Generator & Approval Flow
* **Problem**: Study plans are non-interactive, static mock task lists that cannot be approved into active study schedules.
* **Evidence / Location**: `api/app/services/study_plan_generator.py` lines 12–44; `api/app/routes/study_routes.py` lines 59–69.
* **Why It Matters**: A key capability is generating an exam study path based on available time, exam date, and current mastery, which the student approves to activate reminders.
* **Dependencies**: `DataStore`, `MasteryEngine`, `ExamReadinessEngine`.
* **Recommended Solution**:
  - Upgrade `StudyPlanGenerator` to calculate days until exam, topic priority based on lowest mastery and past exam frequency, and realistic daily session durations.
  - Implement `POST /study-plans/:id/approve` to activate the schedule.
  - Render an interactive `StudyPlanCard` in chat with an "Approve Schedule" action.
* **Verification Criteria**: An approved plan appears on the student's dashboard and links directly to daily scheduled sessions.

---

### P1-5: Closed-Loop Post-Exam Outcome Feedback & Model Calibration
* **Problem**: `OutcomeLoopEngine` records feedback in `summa_ai.exam_feedback`, but the data is completely dormant—it never influences future predictions or study recommendations.
* **Evidence / Location**: `api/app/services/outcome_loop.py` lines 29–79.
* **Why It Matters**: Breaks the closed learning loop: $\text{Preparation} \to \text{Prediction} \to \text{Exam} \to \text{Outcome} \to \text{Feedback} \to \text{Calibration}$.
* **Dependencies**: `OutcomeLoopEngine`, `PatternAnalysisEngine`.
* **Recommended Solution**:
  - Compare student reported exam topics with previously predicted topics.
  - Store accuracy calibration coefficients in `summa_ai.exam_predictions`.
  - Inject post-exam learnings into the orchestrator prompt when planning future courses.
* **Verification Criteria**: Submitting feedback after an exam updates prediction calibration and surfaces in the next course diagnostic.

---

### P1-6: Background Study Reminder & Spaced Repetition Notification Scheduler
* **Problem**: Notifications are only created synchronously as inert rows in `summa_ai.notifications`. There is no background scheduler to evaluate decaying recall strength or upcoming exam deadlines.
* **Evidence / Location**: `api/app/services/study_plan_generator.py` lines 46–83.
* **Why It Matters**: Students never receive meaningful reminders when forgetting risk is high (e.g. "You haven't reviewed Plato in 6 days and recall strength is declining").
* **Dependencies**: Python `asyncio` background task or cron worker.
* **Recommended Solution**:
  - Implement a background check running every hour (or on session start) that evaluates:
    1. Exams within 7, 3, or 1 days.
    2. Spaced repetition items where `next_review_at <= now()`.
    3. Stale concept mastery ($>14$ days without evidence).
  - Deliver actionable notifications to `summa_ai.notifications` and stream to client via WebSocket / SSE.
* **Verification Criteria**: Manually advancing system time or setting an overdue flashcard generates an actionable review notification.

---

# P2 — Important Improvements

### P2-1: Viewport Safety, Responsive Height Bounds, and Density Management
* **Problem**: Generated interactive components in `ChatComponentRenderer.tsx` have variable heights that can stretch conversation turns and break mobile viewports.
* **Evidence / Location**: `client/src/components/chat/ChatComponentRenderer.tsx`.
* **Why It Matters**: When multiple large cards appear in sequence, the chat layout becomes cluttered ("interface soup"), violating Master Prompt Section 12 & 13.
* **Dependencies**: CSS, Tailwind, React.
* **Recommended Solution**:
  - Enforce max-height bounds with internal scrolling (`max-h-[480px] overflow-y-auto`).
  - Collapse completed activities into compact evidence summaries (e.g. "Quiz complete: 4/5 correct · Epistemology +12%").
  - Implement Presentation Manager: allow maximum 1 major interactive + 1 compact card in the active viewport.
* **Verification Criteria**: Mobile viewport test (375px width) displays the activity without horizontal scroll or viewport overflow; completed quiz collapses neatly.

---

### P2-2: Activity Resumability and In-Progress State Persistence
* **Problem**: If a student refreshes or navigates away while on Question 3 of a 5-question quiz, the entire quiz state resets to 0.
* **Evidence / Location**: `client/src/components/chat/ChatComponentRenderer.tsx` lines 312–314.
* **Why It Matters**: Causes frustration and loss of study time, breaking Master Prompt Section 54.
* **Dependencies**: `localStorage` or `sessionStorage` indexed by `activity.id`.
* **Recommended Solution**: Persist current step, answered options, and elapsed time to local storage keyed by `summa-activity-${activityId}`; restore on mount.
* **Verification Criteria**: Answering question 1 and 2, refreshing the page, and reopening the conversation restores question 3 with previous answers intact.

---

### P2-3: Offline & Network Resilience for Activity Submissions
* **Problem**: Answering an activity question or submitting a quiz makes a single network call (`fetchApi`). If the network blips, the submission fails with an unhandled console error, and the student's work is lost.
* **Evidence / Location**: `client/src/components/chat/ChatComponentRenderer.tsx` line 258, 653.
* **Why It Matters**: Students studying on mobile or unstable Wi-Fi lose evidence of mastery.
* **Dependencies**: `client/src/lib/api.ts`.
* **Recommended Solution**: Add retry logic with exponential backoff and an offline queue for interaction telemetry. If offline, cache attempt and replay when `navigator.onLine` fires.
* **Verification Criteria**: Simulating offline mode in browser dev tools retains submitted quiz answers and replays them when connectivity returns.

---

### P2-4: Replace Mock Voice Input with Real Web Speech API
* **Problem**: Clicking the microphone icon in the composer simulates voice input via `setTimeout` and hardcodes `"Explain this concept with a concrete example."`.
* **Evidence / Location**: `client/src/pages/Home.tsx` lines 1046–1052:
  ```typescript
  const handleVoice = () => {
    toast("Listening… simulated voice input active.");
    window.setTimeout(() => {
      props.setComposerValue(`${props.composerValue}... Explain this concept with a concrete example.`);
    }, 900);
  };
  ```
* **Why It Matters**: Deceptive user experience and non-functional feature.
* **Dependencies**: Browser `webkitSpeechRecognition` / `SpeechRecognition`.
* **Recommended Solution**: Implement real Web Speech API recognition with visual recording indicator, live interim transcript streaming into composer, and fallback toast if unsupported.
* **Verification Criteria**: Speaking into the microphone populates the composer with the actual words spoken.

---

### P2-5: Source Provenance Grounding & Non-Cluttered Citation Pills
* **Problem**: Sources retrieved via vector RAG are either dumped as full chunks or lack page/snippet indicators.
* **Evidence / Location**: `client/src/components/chat/SourcesChips.tsx` and `api/app/routes/chat.py`.
* **Why It Matters**: Students need to verify where course claims come from without the chat being overwhelmed by citations.
* **Dependencies**: React, Lucide.
* **Recommended Solution**: Return citation references containing `{ source_title, location, page_number, confidence }` and render them as clean, clickable chips that expand a side drawer showing the exact chunk excerpt.
* **Verification Criteria**: AI claims grounded in lecture notes show a compact pill (e.g. `📄 Philosophy Notes · p. 14`) that opens the source excerpt.

---

# P3 — Polish & Optimization

### P3-1: Purge Obsolete Mock Data & Unify Domain Models
* **Problem**: `LearningInteractives.tsx` and parts of `Home.tsx` contain hundreds of lines of legacy mock widgets and hardcoded dummy objects that are no longer used or contradict real database state.
* **Evidence / Location**: `client/src/components/LearningInteractives.tsx`, `client/src/pages/Home.tsx` lines 71–87.
* **Why It Matters**: Clutters the bundle, confuses developers, and risks serving stale dummy data.
* **Dependencies**: None.
* **Recommended Solution**: Remove deprecated mock arrays; route all data through verified API hooks.
* **Verification Criteria**: No dummy references to "Polymorphism recall" or "Candidate keys" remain in source files.

---

### P3-2: Frontend Unit and Component Test Suite
* **Problem**: Zero frontend tests exist (`npx vitest run` reports no test files found).
* **Evidence / Location**: `client/` directory.
* **Why It Matters**: Regressions in interactive activities, responsive layout, or state machines are easily missed without automated testing.
* **Dependencies**: Vitest, `@testing-library/react`.
* **Recommended Solution**: Create unit tests for:
  - `ChatComponentRenderer`: rendering quizzes, flashcards, scenarios, and completions.
  - `WorkspaceView`: message streaming, turn ordering, error retry.
  - `MasteryCard` and `MilestoneTracker`: state calculation.
* **Verification Criteria**: `npx vitest run` runs and passes at least 20 component and integration tests.

---

### P3-3: Full Keyboard Navigation & WAI-ARIA Accessibility
* **Problem**: Several interactive components rely solely on mouse clicks, and some ARIA labels lack role descriptions for screen readers.
* **Evidence / Location**: `client/src/components/chat/ChatComponentRenderer.tsx`.
* **Why It Matters**: Violates accessibility principles and hinders keyboard-first power users.
* **Dependencies**: Radix UI primitives.
* **Recommended Solution**: Ensure all choices, flashcards, and tabs support standard keyboard shortcuts (`Tab`, `Enter`, `Space`, `ArrowUp`, `ArrowDown`, `1-4`).
* **Verification Criteria**: Full study session can be completed using keyboard navigation alone.
