# Product Boundaries — SummaStudy vs. Summa AI

Stated boundary (from your vision docs):

| | SummaStudy | Summa AI |
|---|---|---|
| Owns | Resources, PDFs, library, OCR, search, community | Intelligence, memory, adaptation, coaching, planning |

## Where the current code already respects this boundary

- Summa AI's Cognee-backed memory (conversations/exams/artifacts/progress) is genuinely a coaching/adaptation concern, not a resource concern — correctly placed.
- SummaStudy's `ai-services` OCR/tagging/search/RAG are genuinely resource-discovery concerns — correctly placed.

## Where the boundary is already blurred in the actual code (not hypothetical)

1. **SummaStudy's `ai-services/services/study_planner.py`, `spaced_repetition.py`, `recommendation_service.py`, and `memory_service.py` are adaptive-learning/coaching capabilities living inside the "library" repo.** Per your own stated boundary, planning/memory/adaptation belong to Summa AI. Either these are dead/unused code in SummaStudy, or SummaStudy is already doing part of Summa AI's job. This needs a direct answer, not an assumption — the next session should trace whether these services are actually called from any live SummaStudy route.
2. **SummaStudy's `unified_ai_pipeline` migration and marketplace/tutorial domains** extend the product well past "library" into scheduling/booking/commerce — a third category not mentioned in either boundary statement at all.
3. **Summa AI's chat orchestrator recalls "exams" and generates study plans/schedules directly in conversation** — clearly correct per its own mandate — but if SummaStudy also has exam-adjacent data (course/department schedules) and its own planner service, there's a real question of which system is the source of truth for a student's exam calendar.

## The actual decision this surfaces

This isn't primarily a code-organization question — it's whether SummaStudy's `ai-services` grew organically to include coaching-adjacent features before the two-product split was decided, and now needs to either (a) have those specific services deprecated/removed once Summa AI's equivalent is production-ready, or (b) have Summa AI call into SummaStudy's existing planner/spaced-repetition services rather than rebuilding them, if they're genuinely more mature.

**Recommendation:** before building anything further in Summa AI's adaptive layer, spend one session confirming whether `study_planner.py`, `spaced_repetition.py`, and `memory_service.py` in SummaStudy are live, tested, and used — then decide reuse vs. rebuild with real information instead of assuming Summa AI should build these from scratch. Rebuilding a working spaced-repetition engine because it happens to live in the "wrong" repo would be optimizing for architectural purity over the "highest user value with smallest complexity" principle you've set as the actual decision standard.

## Going forward: how to keep the boundary from re-blurring

- Any new SummaStudy feature that would need to know a student's *personal* performance history (not just "did they view this resource") is very likely a Summa AI concern, even if it's tempting to bolt on quickly.
- Any new Summa AI feature that would need to browse/search a shared resource corpus (not just recall a student's own conversation memory) should call SummaStudy's existing search/RAG rather than duplicating it.
- The practical test: **"whose data is this?"** If it's data about the resource (metadata, tags, quality signals) → SummaStudy. If it's data about the student's mind (what they know, forgot, struggle with) → Summa AI.
