import React from "react";
import { ComponentMeta } from "../types";

export const citation_drawer: ComponentMeta = {
      id: "citation_drawer",
      title: "45. Citation / Source Drawer",
      category: "Resource Components",
      desc: "Expandable drawer showing exact sources when Summa teaches from uploaded materials.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Citation Source</div>
          <div className="p-2 bg-cream-light dark:bg-[#232D2D] rounded-lg space-y-1">
            <div className="text-[8px] font-semibold text-ink dark:text-cream-soft">"A BST is a binary tree where..."</div>
            <div className="text-[7px] text-grey-green dark:text-[#8FA29B]">— CSC 201 Notes, p.14, Prof. Adebayo</div>
            <div className="text-[7px] text-teal-dark dark:text-accent-lime">View full source →</div>
          </div>
        </div>
      ),
      whatIsIt: "Expandable drawer showing exact sources when Summa teaches from uploaded materials.",
      whySummaUsesIt: "Summa uses citation drawers to provide exact source references. When teaching from uploaded materials, the student can verify and explore the original source.",
      techniques: ["Citation Management", "Source Verification", "Academic Integrity"],
      whenSummaUsesIt: ["Summa teaches from uploaded materials", "The student needs exact source references", "Academic integrity requires citation", "The student wants to verify the teaching"],
      example: "Citation: 'A BST is a binary tree where...' CSC 201 Notes, p.14, Prof. Adebayo. View full source.",
      whatHappensAfter: [{ step: "Citation displayed", detail: "Exact source reference shown" }, { step: "Student verifies", detail: "Original source can be checked" }, { step: "Trust reinforced", detail: "Transparency builds confidence" }, { step: "Source explored", detail: "Student can dive deeper into original material" }],
      usedWith: ["Source Card", "Resource Card", "Resource Section"],
      decisionSignals: ["Teaching from uploads", "Citation needed", "Verification matters"],
};
