import React from "react";
import { ComponentMeta } from "../types";

export const multiple_choice: ComponentMeta = {
      id: "multiple_choice",
      title: "1. Multiple Choice",
      category: "Core Learning",
      desc: "Question + options + instant feedback. Pick the best answer to test baseline comprehension.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center space-y-1.5">
          <p className="text-[11px] font-semibold text-ink dark:text-cream-soft leading-tight">
            What is the main function of mitochondria?
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-grey-green dark:text-[#8FA29B]">
              <div className="size-2.5 rounded-full border border-slate-300" />
              <span>Protein synthesis</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-ink dark:text-cream-soft bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 font-medium">
              <div className="size-2.5 rounded-full border-2 border-teal-dark dark:border-accent-lime flex items-center justify-center">
                <div className="size-1 rounded-full bg-teal-dark/10 dark:bg-accent-lime" />
              </div>
              <span>Energy production (ATP)</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-grey-green dark:text-[#8FA29B]">
              <div className="size-2.5 rounded-full border border-slate-300" />
              <span>Cellular division</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "A question with several answer options where the learner selects the best fit. Provides immediate correctness feedback.",
      whySummaUsesIt: "Summa uses multiple choice when it needs to quickly assess baseline comprehension of a concept. It is efficient for covering breadth and identifying specific misconceptions through distractor analysis.",
      techniques: ["Assessment", "Recall", "Misconception Detection"],
      whenSummaUsesIt: ["New concept was just introduced", "Summa needs to verify understanding before moving on", "Multiple related concepts need quick differentiation", "Exam preparation requires breadth coverage"],
      example: "You are studying cellular biology. Summa introduces mitochondria and immediately asks a multiple choice question to verify you grasped the core function before moving to ATP synthesis.",
      whatHappensAfter: [{ step: "Student selects answer", detail: "Response captured and evaluated" }, { step: "Feedback delivered", detail: "Correct: reinforcement. Incorrect: targeted explanation" }, { step: "Learner Model updated", detail: "Comprehension level recorded for this concept" }, { step: "Next Best Action calculated", detail: "Advance, review, or deepen based on result" }],
      usedWith: ["Short Answer", "Confidence Check", "Spaced Review"],
      decisionSignals: ["Concept newly introduced", "Breadth check needed", "Distractor analysis valuable"],
    };
