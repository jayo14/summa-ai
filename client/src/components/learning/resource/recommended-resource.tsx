import React from "react";
import { ComponentMeta } from "../types";

export const recommended_resource: ComponentMeta = {
      id: "recommended_resource",
      title: "43. Recommended Resource",
      category: "Resource Components",
      desc: "Suggested external resource based on current topic and learning gaps.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime">★ Recommended</span>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Visualgo — BST Operations</div>
            <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">Interactive visualization of tree algorithms</div>
          </div>
          <div className="text-[7px] text-teal-dark dark:text-accent-lime font-semibold">Why: You scored 45% on BST insertion</div>
        </div>
      ),
      whatIsIt: "Suggested external resource based on current topic and learning gaps.",
      whySummaUsesIt: "Summa uses recommended resources to connect struggling students with materials that specifically address their gaps. Not generic, targeted.",
      techniques: ["Gap-Targeted Resources", "Personalized Recommendation", "Learning Support"],
      whenSummaUsesIt: ["A specific learning gap is identified", "An external resource would address the gap", "The student needs targeted support", "Generic resources would not be as effective"],
      example: "Recommended: Visualgo, BST Operations. Why: You scored 45% on BST insertion. Interactive visualization helps.",
      whatHappensAfter: [{ step: "Resource recommended", detail: "Gap-specific resource presented" }, { step: "Student engages", detail: "External resource studied" }, { step: "Gap addressed", detail: "Weakness improves" }, { step: "Recommendation effectiveness tracked", detail: "Whether the recommendation helped is recorded" }],
      usedWith: ["Resource Card", "Weak Area Card", "Next Action Card"],
      decisionSignals: ["Specific gap identified", "Targeted resource available", "Generic help insufficient"],
    };
