import React, { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { components } from "./component-data";
import {
  MultipleChoicePreview,
  ShortAnswerPreview,
  TrueFalsePreview,
  FillBlankPreview,
  MatchingPreview,
  OrderingPreview,
  CategorizationPreview,
  TeachBackPreview,
  ConfidenceCheckPreview,
  ScenarioPreview,
  ExplanationCardPreview,
  WorkedExamplePreview,
  HintLadderPreview,
  ConceptBreakdownPreview,
  CompareContrastPreview,
  AnalogyCardPreview,
  CommonMistakePreview,
  WhyItWorksPreview,
  RecallPromptPreview,
  SpacedReviewPreview,
  RapidRecallPreview,
  RetrievalGridPreview,
  MemoryCheckPreview,
  FlashcardPreview,
  ProgressCardPreview,
  LearningPathPreview,
  MilestoneCardPreview,
  MasteryCardPreview,
  ReadinessCardPreview,
  WeakAreaPreview,
  NextActionPreview,
  SessionPlanPreview,
  SessionProgressPreview,
  SessionSummaryPreview,
  ResumeLearningPreview,
  ExamCountdownPreview,
  ExamReadinessPreview,
  TopicCoveragePreview,
  PastQuestionPreview,
  PredictedPracticePreview,
  ExamSimulationPreview,
  PostExamReflectionPreview,
  ResourceCardPreview,
  SourceCardPreview,
  RecommendedResourcePreview,
  ResourceSectionPreview,
  CitationDrawerPreview,
} from "./InteractivePreviews";

// Component-specific sizing configuration
const COMPONENT_SIZING: Record<string, { className?: string; style?: React.CSSProperties }> = {
  flashcard_card: { className: "max-w-[360px] h-[240px]" },
  compare_contrast: { className: "max-w-[640px]" },
  matching: { className: "max-w-[640px]" },
  ordering: { className: "max-w-[560px]" },
  retrieval_grid: { className: "max-w-[560px]" },
  session_plan: { className: "max-w-[560px]" },
  resource_section: { className: "max-w-[560px]" },
  exam_simulation: { className: "max-w-[640px]" },
  citation_drawer: { className: "max-w-[560px]" },
  learning_path: { className: "max-w-[560px]" },
  progress_card: { className: "max-w-[480px]" },
  mastery_card: { className: "max-w-[480px]" },
  readiness_card: { className: "max-w-[480px]" },
  topic_coverage: { className: "max-w-[560px]" },
  scenario: { className: "max-w-[520px]" },
  worked_example: { className: "max-w-[520px]" },
  explanation_card: { className: "max-w-[520px]" },
  hint_ladder: { className: "max-w-[480px]" },
  analogy_card: { className: "max-w-[480px]" },
  common_mistake: { className: "max-w-[520px]" },
  why_it_works: { className: "max-w-[520px]" },
  recalled_prompt: { className: "max-w-[480px]" },
  rapid_recall: { className: "max-w-[480px]" },
  memory_check: { className: "max-w-[480px]" },
  milestone_card: { className: "max-w-[480px]" },
  weak_area: { className: "max-w-[480px]" },
  next_action: { className: "max-w-[480px]" },
  session_progress: { className: "max-w-[480px]" },
  session_summary: { className: "max-w-[480px]" },
  resume_learning: { className: "max-w-[480px]" },
  exam_readiness: { className: "max-w-[480px]" },
  past_question: { className: "max-w-[520px]" },
  predicted_practice: { className: "max-w-[520px]" },
  post_exam_reflection: { className: "max-w-[520px]" },
  resource_card: { className: "max-w-[480px]" },
  source_card: { className: "max-w-[480px]" },
  recommended_resource: { className: "max-w-[480px]" },
};

export function ComponentDetailPage() {
  const [, params] = useRoute("/admin/components/:id");
  const componentId = params?.id;

  const component = componentId
    ? components.find((c) => c.id === componentId) || null
    : null;

  // Map all 47 component IDs to interactive previews
  const interactivePreviews: Record<string, React.ReactNode> = {
    // Core Learning
    multiple_choice: <MultipleChoicePreview />,
    short_answer: <ShortAnswerPreview />,
    true_false: <TrueFalsePreview />,
    fill_blank: <FillBlankPreview />,
    matching: <MatchingPreview />,
    ordering: <OrderingPreview />,
    categorization: <CategorizationPreview />,
    teach_back: <TeachBackPreview />,
    confidence_check: <ConfidenceCheckPreview />,
    scenario: <ScenarioPreview />,
    // Teaching
    explanation_card: <ExplanationCardPreview />,
    worked_example: <WorkedExamplePreview />,
    hint_ladder: <HintLadderPreview />,
    concept_breakdown: <ConceptBreakdownPreview />,
    compare_contrast: <CompareContrastPreview />,
    analogy_card: <AnalogyCardPreview />,
    common_mistake: <CommonMistakePreview />,
    why_it_works: <WhyItWorksPreview />,
    // Active Recall
    recall_prompt: <RecallPromptPreview />,
    spaced_review: <SpacedReviewPreview />,
    rapid_recall: <RapidRecallPreview />,
    retrieval_grid: <RetrievalGridPreview />,
    memory_check: <MemoryCheckPreview />,
    // Interactive Cards
    flashcard_card: <FlashcardPreview />,
    progress_card: <ProgressCardPreview />,
    // Progress
    learning_path: <LearningPathPreview />,
    milestone_card: <MilestoneCardPreview />,
    mastery_card: <MasteryCardPreview />,
    readiness_card: <ReadinessCardPreview />,
    weak_area: <WeakAreaPreview />,
    next_action: <NextActionPreview />,
    // Session
    session_plan: <SessionPlanPreview />,
    session_progress: <SessionProgressPreview />,
    session_summary: <SessionSummaryPreview />,
    resume_learning: <ResumeLearningPreview />,
    // Exam
    exam_countdown: <ExamCountdownPreview />,
    exam_readiness: <ExamReadinessPreview />,
    topic_coverage: <TopicCoveragePreview />,
    past_question: <PastQuestionPreview />,
    predicted_practice: <PredictedPracticePreview />,
    exam_simulation: <ExamSimulationPreview />,
    post_exam_reflection: <PostExamReflectionPreview />,
    // Resource
    resource_card: <ResourceCardPreview />,
    source_card: <SourceCardPreview />,
    recommended_resource: <RecommendedResourcePreview />,
    resource_section: <ResourceSectionPreview />,
    citation_drawer: <CitationDrawerPreview />,
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [componentId]);

  if (!component) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/components"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-grey-green dark:text-[#8FA29B] hover:text-teal-dark hover:dark:text-accent-lime transition"
        >
          <span aria-hidden="true">←</span> Back to Component Library
        </Link>
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-3xl shadow-2xl p-8 text-center">
          <p className="text-sm text-grey-green dark:text-[#8FA29B]">
            Component not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/components"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-grey-green dark:text-[#8FA29B] hover:text-teal-dark hover:dark:text-accent-lime transition focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime focus:ring-offset-2 rounded"
      >
        <span aria-hidden="true">←</span> Back to Component Library
      </Link>

      <article
        className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-3xl shadow-2xl overflow-hidden"
        aria-labelledby="component-title"
      >
        <div className="p-6 md:p-8 space-y-8">
          {/* 1. HEADER */}
          <header className="flex items-start border-b border-mist-green dark:border-[#2A3838] pb-5">
            <div className="flex items-center gap-4">
              <div
                className={`size-14 rounded-2xl ${component.badgeBg} flex items-center justify-center shadow-xs`}
                aria-hidden="true"
              >
                {component.icon}
              </div>
              <div>
                <span className="text-xs font-mono font-semibold text-grey-green dark:text-[#8FA29B] uppercase">
                  {component.category}
                </span>
                <h2
                  id="component-title"
                  className="text-2xl font-bold text-ink dark:text-cream-soft"
                >
                  {component.title}
                </h2>
                <p className="text-xs text-grey-green dark:text-[#8FA29B] mt-1">
                  {component.desc}
                </p>
              </div>
            </div>
          </header>

          {/* 2. WHAT IS IT? */}
          {component.whatIsIt && (
            <section aria-labelledby="section-what">
              <h3
                id="section-what"
                className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-2"
              >
                What is it?
              </h3>
              <p className="text-sm text-grey-green dark:text-[#8FA29B] leading-relaxed">
                {component.whatIsIt}
              </p>
            </section>
          )}

          {/* 3. WHY SUMMA USES IT */}
          {component.whySummaUsesIt && (
            <section aria-labelledby="section-why">
              <h3
                id="section-why"
                className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-2"
              >
                Why Summa uses it
              </h3>
              <p className="text-sm text-grey-green dark:text-[#8FA29B] leading-relaxed">
                {component.whySummaUsesIt}
              </p>
            </section>
          )}

          {/* 4. LEARNING TECHNIQUES */}
          {component.techniques && component.techniques.length > 0 && (
            <section aria-labelledby="section-techniques">
              <h3
                id="section-techniques"
                className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-2"
              >
                Learning techniques
              </h3>
              <div className="flex flex-wrap gap-2" role="list">
                {component.techniques.map((t: string, i: number) => (
                  <span
                    key={i}
                    role="listitem"
                    className="px-3 py-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime text-xs font-semibold rounded-full border border-teal-dark/20 dark:border-accent-lime/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 5. WHEN SUMMA USES IT */}
          {component.whenSummaUsesIt && component.whenSummaUsesIt.length > 0 && (
            <section aria-labelledby="section-when">
              <h3
                id="section-when"
                className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-2"
              >
                When Summa might choose this
              </h3>
              <div className="p-4 bg-cream-light dark:bg-[#232D2D] rounded-xl border border-mist-green dark:border-[#2A3838]">
                <ul className="space-y-2" role="list">
                  {component.whenSummaUsesIt.map((item: string, i: number) => (
                    <li
                      key={i}
                      role="listitem"
                      className="flex items-start gap-2 text-sm text-grey-green dark:text-[#8FA29B]"
                    >
                      <span className="text-teal-dark dark:text-accent-lime mt-0.5 shrink-0" aria-hidden="true">
                        &#x2022;
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* 6. INTERACTIVE PLAYGROUND */}
          <section aria-labelledby="section-playground">
            <h3
              id="section-playground"
              className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-3"
            >
              Try the component
            </h3>
            <div
              className="relative bg-cream-light dark:bg-[#232D2D] rounded-2xl border border-mist-green dark:border-[#2A3838] overflow-hidden"
              style={{ minHeight: "320px" }}
            >
              {/* Corner label */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 rounded-lg bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime text-[10px] font-bold uppercase tracking-wider">
                  Live Playground
                </span>
              </div>
              {/* Interactive preview or static fallback */}
              <div className="w-full flex items-center justify-center p-4 pt-10">
                <div className={`w-full ${COMPONENT_SIZING[component.id]?.className ?? "max-w-[480px]"}`}>
                  {interactivePreviews[component.id] ?? (
                    <div className="w-full">
                      {component.preview}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 7. EXAMPLE IN SUMMA */}
          {component.example && (
            <section aria-labelledby="section-example">
              <h3
                id="section-example"
                className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-2"
              >
                Example in Summa
              </h3>
              <div className="p-4 bg-cream-light dark:bg-[#232D2D] rounded-xl border border-mist-green dark:border-[#2A3838]">
                <p className="text-sm text-grey-green dark:text-[#8FA29B] leading-relaxed italic">
                  {component.example}
                </p>
              </div>
            </section>
          )}

          {/* 8. WHAT HAPPENS AFTER */}
          {component.whatHappensAfter && component.whatHappensAfter.length > 0 && (
            <section aria-labelledby="section-after">
              <h3
                id="section-after"
                className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-2"
              >
                What happens after
              </h3>
              <ol className="space-y-0" role="list">
                {component.whatHappensAfter.map(
                  (item: { step: string; detail: string }, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="size-6 rounded-full bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-[10px] font-bold flex items-center justify-center shrink-0"
                          aria-hidden="true"
                        >
                          {i + 1}
                        </div>
                        {i < component.whatHappensAfter!.length - 1 && (
                          <div
                            className="w-px h-6 bg-teal-dark/30 dark:bg-accent-lime/30"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-semibold text-ink dark:text-cream-soft">
                          {item.step}
                        </div>
                        <div className="text-xs text-grey-green dark:text-[#8FA29B]">
                          {item.detail}
                        </div>
                      </div>
                    </li>
                  )
                )}
              </ol>
            </section>
          )}

          {/* 9. USED WITH + DECISION SIGNALS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {component.usedWith && component.usedWith.length > 0 && (
              <section aria-labelledby="section-usedwith">
                <h3
                  id="section-usedwith"
                  className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-2"
                >
                  Often combined with
                </h3>
                <div className="flex flex-wrap gap-2" role="list">
                  {component.usedWith.map((item: string, i: number) => (
                    <span
                      key={i}
                      role="listitem"
                      className="px-3 py-1.5 bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft text-xs font-medium rounded-full border border-mist-green dark:border-[#2A3838]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {component.decisionSignals && component.decisionSignals.length > 0 && (
              <section aria-labelledby="section-signals">
                <h3
                  id="section-signals"
                  className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono mb-2"
                >
                  How Summa decides to use this
                </h3>
                <div className="flex flex-wrap gap-2" role="list">
                  {component.decisionSignals.map((item: string, i: number) => (
                    <span
                      key={i}
                      role="listitem"
                      className="px-3 py-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime text-xs font-semibold rounded-full border border-teal-dark/20 dark:border-accent-lime/20"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
