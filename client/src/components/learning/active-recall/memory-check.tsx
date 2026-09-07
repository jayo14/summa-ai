import React from "react";
import { ComponentMeta } from "../types";

export const memory_check: ComponentMeta = {
      id: "memory_check",
      title: "23. Memory Check",
      category: "Active-Recall / Retention",
      desc: "'What do you remember from yesterday?' Daily recap to solidify long-term retention.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">
            <span>📅 YESTERDAY'S RECAP</span>
          </div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-semibold leading-tight">
            Summarize 2 takeaways from yesterday's lesson on Object-Oriented Design.
          </p>
          <div className="w-full py-1 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-center text-[9px] font-bold text-teal-dark dark:text-accent-lime">
            Start Recap
          </div>
        </div>
      ),
      whatIsIt: "What do you remember from yesterday? Daily recap to solidify long-term retention.",
      whySummaUsesIt: "Summa uses memory checks to verify that yesterday's learning actually stuck. Daily recap prevents the forgetting curve from erasing recent gains.",
      techniques: ["Daily Review", "Retention Verification", "Forgetting Prevention"],
      whenSummaUsesIt: ["A new study session begins", "Yesterday's material needs retention check", "The student tends to forget recent learning", "Long-term retention is the goal"],
      example: "Summarize 2 takeaways from yesterday's lesson on Object-Oriented Design.",
      whatHappensAfter: [{ step: "Recall prompt delivered", detail: "Yesterday's material referenced" }, { step: "Student recalls", detail: "What stuck and what was forgotten" }, { step: "Gaps identified", detail: "Forgotten material flagged for review" }, { step: "Retention schedule adjusted", detail: "Forgotten items resurfaced sooner" }],
      usedWith: ["Recall Prompt", "Spaced Review", "Session Summary"],
      decisionSignals: ["New session starting", "Yesterday needs verification", "Forgetting prevention matters"],
};
