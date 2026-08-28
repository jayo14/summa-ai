# Summa AI — Frontend Implementation Notes

The current static build implements a functional product prototype of the PRD’s MVP learning loop. It intentionally does not claim live OAuth, AI retrieval, database persistence, secure file ingestion, or model orchestration because these require the full-stack platform and authenticated SummaStudy services.

## Frontend Domain Vocabulary

The interface is organized around the PRD’s durable educational objects: `Conversation`, `Message`, `LearningObjective`, `Interactive`, `LearningEvent`, `MasteryRecord`, `Resource`, `Misconception`, `ReviewItem`, and `SavedInteractive`. This is deliberately different from a transcript-only chat data model.

## Implemented Controlled Interactive Contract

Each learning interactive is a React component with a declared objective and interaction state. The quiz produces a retrieval event and in-place explanation. The flashcard requires reveal and confidence reflection. Guided practice accepts a student explanation, offers proportionate hints, and returns diagnostic feedback. A successful meaningful action updates the local mastery estimate and the surrounding next-action context.

## Integration Seams

| Product capability | Current frontend seam | Full-stack implementation requirement |
| --- | --- | --- |
| SummaStudy authorization | Source selector and connection state | OAuth callback, granular consent scopes, token handling, and revocation |
| Grounded retrieval | Selected source UI and citation artifacts | Resource index, page/section metadata, retrieval, source-priority rules, and citation validation |
| Adaptive tutoring | Intent-aware local tutor response states | Pedagogical planner, learner-model retrieval, model abstraction, and streaming response channel |
| Learning events | In-session event ledger | Durable event store, idempotency, analytics pipeline, and mastery estimator |
| Learning memory | Local mastery plus learner preference | User-owned memory records, visibility controls, deletion, export, and consent boundaries |
| Saved learning objects | Learning library presentation | Persisted interactive payloads, collections, retrieval scheduling, and evolving review state |

## Trust Boundaries

The live implementation must treat resources as untrusted data, never instructions. Course-specific answers should prioritize user-selected resources, then approved SummaStudy material, then course metadata, then trusted general knowledge with explicit uncertainty. Mastery remains an estimate based on evidence; it is not a prediction of a student’s grade.
