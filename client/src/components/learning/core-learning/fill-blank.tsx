import React from "react";
import { ComponentMeta } from "../types";

export const fill_blank: ComponentMeta = {
      id: "fill_blank",
      title: "4. Fill in the Blank",
      desc: "Excellent for locking in essential technical terminology, syntax, and exact formulas.",
      category: "Core Learning",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center space-y-3">
          <p className="text-[11px] text-ink dark:text-cream-soft leading-relaxed">
            In OOP, <span className="inline-block px-2 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 text-teal-dark dark:text-accent-lime font-bold rounded">polymorphism</span> allows dynamic method dispatch at runtime.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-grey-green dark:text-[#8FA29B]">
            <span className="font-semibold text-teal-dark dark:text-accent-lime">Hint:</span> Means "many forms"
          </div>
        </div>
      ),
      whatIsIt: "A sentence or formula with a missing term that the learner must complete. Excellent for terminology and exact formulas.",
      whySummaUsesIt: "Summa uses fill-in-the-blank when precise terminology or exact formulas must be memorized. It forces active recall of specific terms rather than recognition.",
      techniques: ["Active Recall", "Terminology Mastery", "Precision Training"],
      whenSummaUsesIt: ["Key terminology must be remembered exactly", "Formulas or syntax require precise recall", "The student tends to approximate rather than recall precisely", "Exam requires exact terms"],
      example: "In OOP, _____ allows dynamic method dispatch at runtime. You must recall the exact term: polymorphism.",
      whatHappensAfter: [{ step: "Student fills in the blank", detail: "Response compared against correct answer" }, { step: "Precision evaluated", detail: "Exact match, close match, or incorrect" }, { step: "Feedback delivered", detail: "Confirmation or correction with context" }, { step: "Terminology mastery tracked", detail: "Recorded for spaced review scheduling" }],
      usedWith: ["Recall Prompt", "Spaced Review", "Memory Check"],
      decisionSignals: ["Exact term recall needed", "Formula precision required", "Student approximates terms"],
    };
