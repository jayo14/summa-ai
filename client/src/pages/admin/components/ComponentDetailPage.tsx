import React, { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { components } from "./component-data";
import {
  FlashcardPreview,
  MultipleChoicePreview,
  TrueFalsePreview,
  ProgressCardPreview,
  RecallPromptPreview,
  ShortAnswerPreview,
  FillBlankPreview,
  ConfidenceCheckPreview,
  MatchingPreview,
  OrderingPreview,
  CategorizationPreview,
  ScenarioPreview,
  ConceptBreakdownPreview,
  ExamCountdownPreview,
  LearningPathPreview,
} from "./InteractivePreviews";

export function ComponentDetailPage() {
  const [, params] = useRoute("/admin/components/:id");
  const componentId = params?.id;

  const component = componentId
    ? components.find((c) => c.id === componentId) || null
    : null;

  // Map component IDs to interactive previews
  const interactivePreviews: Record<string, React.ReactNode> = {
    flashcard_card: <FlashcardPreview />,
    multiple_choice: <MultipleChoicePreview />,
    true_false: <TrueFalsePreview />,
    progress_card: <ProgressCardPreview />,
    recall_prompt: <RecallPromptPreview />,
    short_answer: <ShortAnswerPreview />,
    fill_blank: <FillBlankPreview />,
    confidence_check: <ConfidenceCheckPreview />,
    matching: <MatchingPreview />,
    ordering: <OrderingPreview />,
    categorization: <CategorizationPreview />,
    scenario: <ScenarioPreview />,
    concept_breakdown: <ConceptBreakdownPreview />,
    exam_countdown: <ExamCountdownPreview />,
    learning_path: <LearningPathPreview />,
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
                {interactivePreviews[component.id] ?? (
                  <div className="w-full max-w-[400px]">
                    {component.preview}
                  </div>
                )}
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
