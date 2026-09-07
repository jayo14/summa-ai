import React from "react";
import { ComponentMeta } from "../types";

export const spaced_review: ComponentMeta = {
      id: "spaced_review",
      title: "20. Spaced Review Card",
      category: "Active-Recall / Retention",
      desc: "Resurfaces previously learned concepts at optimal decay intervals (SM-2 decay algorithm).",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px]">
            <span className="font-bold text-teal-dark dark:text-accent-lime">DUE FOR REVIEW</span>
            <span className="text-grey-green dark:text-[#8FA29B] font-mono">Decay: 3 days</span>
          </div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-semibold">
            SQL Group By vs Having clauses
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-grey-green dark:text-[#8FA29B]">Interval: 6 days</span>
            <span className="px-2 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-bold text-[9px] rounded">Review</span>
          </div>
        </div>
      ),
      whatIsIt: "Previously learned concept resurfacing at optimal decay intervals using SM-2 algorithm.",
      whySummaUsesIt: "Summa uses spaced review when a concept is approaching its review window. Resurfacing material at the right moment prevents forgetting while minimizing study time.",
      techniques: ["Spaced Repetition", "Retrieval Practice", "Forgetting Curve Optimization"],
      whenSummaUsesIt: ["A concept was previously learned and recall is declining", "The review interval has arrived", "The concept is important for retention", "The student has not reviewed it recently"],
      example: "You learned SQL Group By vs Having 6 days ago. Summa resurfaces it now because your recall strength is declining and the optimal review window has arrived.",
      whatHappensAfter: [{ step: "Review card presented", detail: "Concept resurfaced for review" }, { step: "Student attempts recall", detail: "Active retrieval before hints" }, { step: "Interval adjusted", detail: "If correct: longer interval. If wrong: shorter interval" }, { step: "Retention estimate updated", detail: "Next review scheduled" }],
      usedWith: ["Recall Prompt", "Flashcard Stack", "Memory Check"],
      decisionSignals: ["Review interval arrived", "Recall strength declining", "Concept important for retention"],
    };
