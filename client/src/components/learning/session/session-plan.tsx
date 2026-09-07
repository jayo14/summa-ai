import React from "react";
import { ComponentMeta } from "../types";

export const session_plan: ComponentMeta = {
      id: "session_plan",
      title: "30. Session Plan",
      category: "Session Components",
      desc: "Structured session outline showing review, learning, practice, and assessment.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">Today's Session</div>
          <div className="space-y-1 font-mono text-[8px]">
            <div className="flex items-center gap-1.5 text-ink dark:text-cream-soft">
              <span className="text-grey-green dark:text-[#8FA29B]">├──</span>
              <span className="text-teal-dark dark:text-accent-lime">✓</span> Review: Linked Lists, Stacks
            </div>
            <div className="flex items-center gap-1.5 text-ink dark:text-cream-soft">
              <span className="text-grey-green dark:text-[#8FA29B]">├──</span>
              <span className="text-teal-dark dark:text-accent-lime">→</span> Learn: Binary Trees
            </div>
            <div className="flex items-center gap-1.5 text-ink dark:text-cream-soft">
              <span className="text-grey-green dark:text-[#8FA29B]">├──</span>
              <span className="text-grey-green dark:text-[#8FA29B]">○</span> Practice: 5 problems
            </div>
            <div className="flex items-center gap-1.5 text-ink dark:text-cream-soft">
              <span className="text-grey-green dark:text-[#8FA29B]">└──</span>
              <span className="text-grey-green dark:text-[#8FA29B]">○</span> 5-question check
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Structured session outline showing review, learning, practice, and assessment.",
      whySummaUsesIt: "Summa uses session plans to give structure to study time. A clear plan reduces cognitive load and ensures balanced coverage of review, learning, and practice.",
      techniques: ["Session Structuring", "Balanced Learning", "Time Management"],
      whenSummaUsesIt: ["A new study session begins", "The student needs a clear plan for the session", "Review, learning, and practice need balance", "Time should be used efficiently"],
      example: "Today's Session: Review 2 concepts, Learn Binary Trees, Practice 5 problems, 5-question check.",
      whatHappensAfter: [{ step: "Plan presented", detail: "Session structure shown" }, { step: "Student follows plan", detail: "Each activity completed in order" }, { step: "Progress tracked", detail: "Completion of each activity recorded" }, { step: "Plan adjusted", detail: "If stuck, plan may reorder or extend" }],
      usedWith: ["Session Progress", "Session Summary", "Resume Learning"],
      decisionSignals: ["Session starting", "Structure needed", "Balanced coverage matters"],
    };
