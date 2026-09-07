import React from "react";
import { ComponentMeta } from "../types";

export const resource_card: ComponentMeta = {
      id: "resource_card",
      title: "41. Resource Card",
      category: "Resource Components",
      desc: "Relevant learning material surfaced during teaching — textbook, video, or article.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex gap-2.5">
          <div className="w-10 h-14 bg-teal-dark/10 dark:bg-accent-lime/10 rounded-lg flex items-center justify-center text-teal-dark dark:text-accent-lime text-lg shrink-0">📘</div>
          <div className="flex-1 space-y-1">
            <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Introduction to Algorithms</div>
            <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">CLRS · Chapter 12: BSTs</div>
            <div className="text-[7px] text-teal-dark dark:text-accent-lime font-semibold">Relevant to: Binary Trees</div>
          </div>
        </div>
      ),
      whatIsIt: "Relevant learning material surfaced during teaching, textbook, video, or article.",
      whySummaUsesIt: "Summa uses resource cards to connect students with authoritative materials. When a concept needs deeper study, the right resource is surfaced automatically.",
      techniques: ["Resource Curation", "Supplementary Learning", "Authority Linking"],
      whenSummaUsesIt: ["A concept needs deeper study", "Authoritative material exists that would help", "The student benefits from external resources", "The teaching needs supplementary material"],
      example: "Introduction to Algorithms, CLRS Chapter 12: BSTs. Relevant to: Binary Trees.",
      whatHappensAfter: [{ step: "Resource surfaced", detail: "Relevant material presented" }, { step: "Student accesses", detail: "External resource studied" }, { step: "Understanding deepened", detail: "Concept mastery improves" }, { step: "Resource effectiveness tracked", detail: "Whether the resource helped is recorded" }],
      usedWith: ["Resource Section", "Recommended Resource", "Citation Drawer"],
      decisionSignals: ["Deeper study needed", "Authoritative material available", "Supplementary resource helpful"],
    };
