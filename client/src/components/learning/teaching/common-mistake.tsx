import React from "react";
import { ComponentMeta } from "../types";

export const common_mistake: ComponentMeta = {
      id: "common_mistake",
      title: "17. Common Mistake Card",
      category: "Teaching Components",
      desc: "Highlights frequent cognitive traps and provides explicit corrections.",
      badgeBg: "bg-destructive/10 dark:bg-[#be747e]/10 text-destructive dark:text-[#be747e]",
      icon: (
        <svg className="w-5 h-5 text-destructive dark:text-[#be747e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[9px] font-bold text-destructive dark:text-[#be747e] flex items-center gap-1">
            <span>⚠️ Common Misconception</span>
          </div>
          <p className="text-[9px] text-ink dark:text-cream-soft bg-destructive/10 dark:bg-[#be747e]/10 p-1.5 rounded border border-destructive/30 dark:border-[#be747e]/30 line-through">
            "Overloading happens at runtime."
          </p>
          <p className="text-[9px] text-emerald-900 bg-teal-dark/10 dark:bg-accent-lime/10 p-1.5 rounded border border-teal-dark/30 dark:border-accent-lime/30">
            ✓ Correction: Overloading is resolved at <strong>compile-time</strong>.
          </p>
        </div>
      ),
      whatIsIt: "Highlights frequent cognitive traps and provides explicit corrections.",
      whySummaUsesIt: "Summa uses common mistake cards when a misconception is widespread or particularly sticky. Explicitly naming and correcting the mistake is more effective than hoping the student avoids it.",
      techniques: ["Misconception Correction", "Error Prevention", "Cognitive Trap Identification"],
      whenSummaUsesIt: ["A misconception is common among students", "The mistake has serious consequences", "The student is likely to make this error", "Correcting the mistake prevents future problems"],
      example: "Misconception: Overloading happens at runtime. Correction: Overloading is resolved at compile-time, not runtime.",
      whatHappensAfter: [{ step: "Misconception named", detail: "Common mistake explicitly stated" }, { step: "Correction provided", detail: "Correct understanding explained" }, { step: "Student verifies", detail: "Confirms they did not hold the misconception" }, { step: "Mistake tracked", detail: "If student had the misconception, extra practice assigned" }],
      usedWith: ["Compare & Contrast", "Multiple Choice", "Confidence Check"],
      decisionSignals: ["Common misconception identified", "Mistake has high consequences", "Student likely to err"],
    };
