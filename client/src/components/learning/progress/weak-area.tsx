import React from "react";
import { ComponentMeta } from "../types";

export const weak_area: ComponentMeta = {
      id: "weak_area",
      title: "28. Weak Area Card",
      category: "Progress / Guidance",
      desc: "Surfaces concepts that need focused attention based on performance data.",
      badgeBg: "bg-destructive/10 dark:bg-[#be747e]/10 text-destructive dark:text-[#be747e]",
      icon: (
        <svg className="w-5 h-5 text-destructive dark:text-[#be747e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-destructive dark:text-[#be747e] uppercase">Needs Attention</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 py-1 bg-destructive/10 dark:bg-[#be747e]/10 rounded-lg">
              <span className="text-[9px] font-medium text-ink dark:text-cream-soft">Graph Traversal</span>
              <span className="text-[8px] font-bold text-destructive dark:text-[#be747e]">38%</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-destructive/10 dark:bg-[#be747e]/10 rounded-lg">
              <span className="text-[9px] font-medium text-ink dark:text-cream-soft">Hash Collisions</span>
              <span className="text-[8px] font-bold text-destructive dark:text-[#be747e]">42%</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-destructive/10 dark:bg-[#be747e]/10 rounded-lg">
              <span className="text-[9px] font-medium text-ink dark:text-cream-soft">B-Tree Insertion</span>
              <span className="text-[8px] font-bold text-destructive dark:text-[#be747e]">45%</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Surfaces concepts that need focused attention based on performance data.",
      whySummaUsesIt: "Summa uses weak area cards to be honest about what needs work. Instead of hiding weaknesses, it surfaces them explicitly so the student can focus energy where it matters most.",
      techniques: ["Weakness Identification", "Focused Practice", "Performance Analysis"],
      whenSummaUsesIt: ["Performance data reveals specific weak areas", "The student needs to know what to focus on", "Weaknesses are preventing progress", "Study time should be directed efficiently"],
      example: "Needs Attention: Graph Traversal (38%), Hash Collisions (42%), B-Tree Insertion (45%).",
      whatHappensAfter: [{ step: "Weak areas surfaced", detail: "Specific concepts with low mastery identified" }, { step: "Priority ordered", detail: "Weakest areas ranked by importance" }, { step: "Practice assigned", detail: "Targeted exercises for each weak area" }, { step: "Progress tracked", detail: "Mastery improvement monitored" }],
      usedWith: ["Next Action Card", "Readiness Card", "Worked Example"],
      decisionSignals: ["Performance data available", "Specific weaknesses identified", "Focused practice needed"],
    };
