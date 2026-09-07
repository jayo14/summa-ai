import React from "react";
import { ComponentMeta } from "../types";

export const flashcard_card: ComponentMeta = {
      id: "flashcard_card",
      title: "Flashcard Stack",
      category: "Interactive Cards",
      desc: "Quick, focused cards to help you recall and remember key concepts with spaced repetition.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path strokeLinecap="round" d="M9 9h6M9 13h4" />
        </svg>
      ),
      preview: (
        <div className="relative w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl flex items-center justify-center p-2">
          <div className="absolute w-[82%] h-[90px] bg-gradient-to-r from-teal-dark/10 to-accent-lime/10 rounded-2xl border border-teal-dark/30 dark:border-accent-lime/30 translate-y-3 blur-[0.5px]" />
          <div className="absolute w-[87%] h-[95px] bg-teal-dark/10 dark:bg-accent-lime/10 rounded-2xl border border-teal-dark/30 dark:border-accent-lime/30 translate-y-1.5" />
          <div className="relative z-10 w-[92%] h-[100px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838]/90 shadow-sm flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs font-semibold text-ink dark:text-cream-soft tracking-tight">What is photosynthesis?</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-grey-green dark:text-[#8FA29B] hover:text-grey-green dark:text-[#8FA29B] transition cursor-pointer">
              <span>Flip</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Quick, focused cards to help recall and remember key concepts with spaced repetition.",
      whySummaUsesIt: "Summa uses flashcards for efficient retrieval practice. Each card tests one concept, and spaced repetition ensures optimal review timing.",
      techniques: ["Active Recall", "Spaced Repetition", "Retrieval Practice"],
      whenSummaUsesIt: ["A concept needs retrieval practice", "Quick, focused recall is appropriate", "Spaced repetition scheduling is active", "The concept fits a flashcard format"],
      example: "What is photosynthesis? Flip to reveal answer. Rate your recall strength to schedule next review.",
      whatHappensAfter: [{ step: "Card presented", detail: "Concept shown for recall" }, { step: "Student attempts recall", detail: "Answer formulated mentally" }, { step: "Answer revealed", detail: "Correct answer shown" }, { step: "Recall rated", detail: "Student rates difficulty, interval adjusted" }],
      usedWith: ["Spaced Review", "Recall Prompt", "Confidence Check"],
      decisionSignals: ["Quick recall practice needed", "Single concept focus", "Spaced repetition active"],
    };
