import React from "react";
import { ComponentMeta } from "../types";

export const teach_back: ComponentMeta = {
      id: "teach_back",
      title: "8. Teach-Back",
      category: "Core Learning",
      desc: "'Explain this like you're teaching someone.' Forces Feynman-style active articulation.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-teal-dark dark:text-accent-lime font-bold text-[10px]">
            <span>🎓 Feynman Method</span>
          </div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-medium leading-tight">
            How would you explain recursion to a 10-year-old without using technical jargon?
          </p>
          <div className="w-full h-8 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded-lg p-1.5 text-[9px] text-ink dark:text-cream-soft italic">
            "It's like a Russian nesting doll..."
          </div>
        </div>
      ),
      whatIsIt: "Explain this like you are teaching someone. Forces Feynman-style active articulation of understanding.",
      whySummaUsesIt: "Summa uses teach-back when it needs the deepest possible assessment of understanding. If you can teach it, you know it. This reveals gaps that recognition-based methods miss entirely.",
      techniques: ["Retrieval Practice", "Elaborative Learning", "Metacognition"],
      whenSummaUsesIt: ["A concept has been learned and needs deep verification", "The student thinks they understand but may not", "The concept is important enough to warrant thorough checking", "Pre-exam or pre-assessment verification"],
      example: "How would you explain recursion to a 10-year-old without using technical jargon? Your response reveals whether you truly understand the core idea.",
      whatHappensAfter: [{ step: "Student writes explanation", detail: "Free-form teaching response captured" }, { step: "Summa evaluates explanation", detail: "Checks for clarity, accuracy, completeness" }, { step: "Gaps identified", detail: "What the student missed or got wrong" }, { step: "Mastery confirmed or deepened", detail: "If gaps found, targeted follow-up deployed" }],
      usedWith: ["Explanation Card", "Confidence Check", "Mastery Card"],
      decisionSignals: ["Deep verification needed", "Student may have surface understanding", "Concept is high-stakes"],
    };
