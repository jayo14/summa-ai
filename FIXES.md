# Summa AI — Prioritized Implementation Backlog (`FIXES.md`)

This backlog tracks the complete implementation status, verified architectural changes, and remaining enhancements required to transform the chat system into **Summa AI**: a deeply adaptive, reasoning-driven, human-feeling learning intelligence.

---

## 🏛️ Architectural Overview & The Continuous Learning Loop

The core architecture follows the continuous 10-stage learning loop:
**Understand → Diagnose → Decide → Teach → Interact → Assess → Update Learner Model → Adapt → Remember → Review → Predict → Prepare**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LEARNER CONVERSATION                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (1. Natural Language Input)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LEARNING ORCHESTRATOR & INTENT                         │
│  - Parses intent, context, urgency, emotion, & difficulty preferences       │
│  - Selects pedagogical action: TEACH, EXPLAIN, RECALL, QUIZ, PRACTICE,      │
│    COMPARE, APPLY, REFLECT, SIMULATE, PREDICT, PLAN, REVIEW, REST           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (2. Decision + Context Injection)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MEMORY & LEARNER MODEL RETRIEVAL                       │
│  - Cognee Vector Index: recalled concepts, materials, & knowledge gaps     │
│  - MasteryEngine: 6D mastery vector (Depth, PS, Speed, Consistency, etc.)   │
│  - MisconceptionEngine: active misconceptions & prerequisite failures       │
│  - SpacedRepetitionEngine: SM-2 review items due & forgetting risk          │
│  - Exam & Timeline Context: upcoming deadlines & daily study allocations    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (3. Contextualized System Prompt)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STREAMING ADAPTIVE TUTOR RESPONSE                     │
│  - Executes selected action (Step-by-step teaching, targeted question, etc.)│
│  - Emits `next_action` & `artifact` SSE events for interactive components  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (4. Interactive Evaluation)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LEARNER MODEL & MEMORY UPDATE                       │
│  - Calculates score, accuracy, response time, and confidence                │
│  - Updates 6D Mastery Vector & DB persistence                              │
│  - Triggers misconception detection & schedules SM-2 spaced review          │
│  - Stores conversation & progress in Cognee memory store                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Implementation Status & Backlog

| Phase / Module | Component | Status | Description & Target Verification |
| --- | --- | --- | --- |
| **P0: Security & Auth** | JWT Verification | ✅ **Fixed** | Cryptographic verification (HS256/RS256) via Supabase JWKS with no signature fallback. |
| **P0: Auth Routes** | Auth Error Transparency | ✅ **Fixed** | Direct proxy to Supabase Auth returning true HTTP status codes (401/400/502). |
| **P0: RBAC System** | Role-Based Access Control | ✅ **Fixed** | Explicit `role` column enforcement without substring regex or hardcoded backdoor emails. |
| **P0: IDOR Isolation** | Resource Ownership | ✅ **Fixed** | All resource endpoints (`artifacts`, `conversations`, `materials`, `concepts`, `study_plans`, `flashcards`, `exams`) enforce `user_id` ownership checks. |
| **P1: Learning Orchestrator** | Action Decision Engine | ✅ **Wired** | `LearningOrchestrator.decide_next_action()` evaluates mastery, recipes, misconceptions, and query cues to choose from 16 pedagogical actions. |
| **P1: Prompt Construction** | Pedagogical Directives | ✅ **Wired** | `build_orchestrator_prompt()` injects orchestrator decision (action, reasoning, target concepts, difficulty), student profile, knowledge gaps, and memories directly into LLM context. |
| **P1: Mastery Engine** | 6D Hexagon Model | ✅ **Wired** | Computes `depth`, `problem_solving`, `speed`, `consistency`, `confidence`, and `creativity` from genuine attempt evidence, preserving `None` when evidence is missing. |
| **P1: Misconception Engine** | Detection & Remediation | ✅ **Wired** | Detects active misconceptions from low scores/wrong options; orchestrator prioritizes `COMPARE` or `REVISE` actions when misconceptions exist. |
| **P1: Spaced Repetition** | Retention & Review | ✅ **Wired** | Calculates SM-2 review intervals, forgetting risk, and schedules review items for weak or decaying concepts. |
| **P1: Interactive Activities** | Dynamic Component SSE | ✅ **Wired** | Emits `next_action` and `artifact` SSE events (`quiz`, `flashcards`, `study-plan`, `hexagon`, `graph`, `gap-analysis`) rendered by `ChatComponentRenderer`. |
| **P1: Feedback Write-Loop** | Score & Attempt Persistence | ✅ **Wired** | `POST /interactions/quiz-result` updates `MasteryEngine`, records learning progress, triggers misconception checks, and schedules review items. |
| **P1: Data Integrity** | Admin Analytics & Telemetry | ✅ **Fixed** | Removed fake MRR, fabricated tracking logs, fake satisfaction scores, and fake Redis metrics. Admin dashboard displays genuine metrics. |

---

## 📋 Prioritized Action Items for Continuous Perfection

1. **Orchestrator Directive Integration**: Ensure every decision of `LearningOrchestrator` dynamically overrides the teaching posture in `build_orchestrator_prompt()`.
2. **End-to-End Retention Loop**: Verify that interactive quiz/flashcard responses dynamically update spaced repetition schedules and feed directly into the next conversation turn.
3. **Conversational Natural Language Cues**: Ensure phrases like "I'm lost", "Quiz me", "Explain simply", or "I keep forgetting this" trigger distinct orchestrator actions (`RECALL`, `SIMPLIFY`, `QUIZ`, `REVISE`).
