import React from "react";
import { ComponentMeta } from "../types";

export const compare_contrast: ComponentMeta = {
      id: "compare_contrast",
      title: "15. Compare & Contrast",
      category: "Teaching Components",
      desc: "Side-by-side distinction matrix highlight key differences between A vs B.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2 shadow-2xs flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-1 text-center text-[9px] font-bold pb-1 border-b">
            <span className="text-teal-dark dark:text-accent-lime">Process</span>
            <span className="text-teal-dark dark:text-accent-lime">Thread</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[8px] pt-1 text-grey-green dark:text-[#8FA29B]">
            <div>Isolated memory space</div>
            <div>Shared process memory</div>
            <div>Heavy creation cost</div>
            <div>Lightweight execution</div>
          </div>
        </div>
      ),
      whatIsIt: "Side-by-side distinction matrix highlighting key differences between two concepts.",
      whySummaUsesIt: "Summa uses compare and contrast when two concepts are easily confused or when understanding the differences is critical to proper application.",
      techniques: ["Comparative Learning", "Distinction Making", "Conceptual Clarity"],
      whenSummaUsesIt: ["Two concepts are frequently confused", "Understanding differences is critical", "The student mixes up similar items", "Exam tests distinctions between related topics"],
      example: "Process vs Thread: Process has isolated memory space, heavy creation cost. Thread has shared process memory, lightweight execution.",
      whatHappensAfter: [{ step: "Comparison presented", detail: "Side-by-side distinction matrix shown" }, { step: "Student identifies differences", detail: "Understanding of distinctions tested" }, { step: "Confusion resolved", detail: "Specific confusions clarified" }, { step: "Distinction knowledge recorded", detail: "Comparison mastery tracked" }],
      usedWith: ["Matching", "Categorization", "Common Mistake Card"],
      decisionSignals: ["Two concepts容易混淆", "Distinction is critical", "Student mixes up items"],
    };
