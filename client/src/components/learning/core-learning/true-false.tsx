import React from "react";
import { ComponentMeta } from "../types";

export const true_false: ComponentMeta = {
      id: "true_false",
      title: "3. True / False",
      desc: "Simple, rapid-fire statement validation to quickly clear misconceptions.",
      category: "Core Learning",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase tracking-wide">Rapid Check</span>
            <p className="text-[11px] font-semibold text-ink dark:text-cream-soft leading-tight">
              Java interfaces can contain private helper methods in Java 9+.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="py-2 bg-teal-dark/10 dark:bg-accent-lime/10 border border-emerald-300 rounded-lg text-center font-bold text-xs text-teal-dark dark:text-accent-lime">
              TRUE ✓
            </div>
            <div className="py-2 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-center font-bold text-xs text-grey-green dark:text-[#8FA29B] opacity-60">
              FALSE
            </div>
          </div>
        </div>
      ),
      whatIsIt: "A statement that the learner judges as true or false. Rapid-fire validation to clear misconceptions quickly.",
      whySummaUsesIt: "Summa uses true/false for quick, low-friction checks that keep the learning pace moving. Especially useful for testing factual recall and exposing common misunderstandings.",
      techniques: ["Rapid Recall", "Misconception Detection", "Factual Validation"],
      whenSummaUsesIt: ["Multiple factual claims need quick validation", "A common misconception needs direct confrontation", "Pace needs to stay fast during review sessions", "The concept has clear binary boundaries"],
      example: "Summa states: Java interfaces can contain private helper methods in Java 9+. You evaluate, this tests whether you know the Java 9+ interface enhancement.",
      whatHappensAfter: [{ step: "Student judges True/False", detail: "Response captured" }, { step: "Instant feedback", detail: "Explanation of why the statement is true or false" }, { step: "Misconception flagged", detail: "If incorrect, the specific misunderstanding is logged" }, { step: "Recall strength updated", detail: "Contributes to retention estimate" }],
      usedWith: ["Multiple Choice", "Rapid Recall", "Confidence Check"],
      decisionSignals: ["Factual claim needs validation", "Quick pace required", "Binary concept boundaries"],
    };
