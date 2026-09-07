import React from "react";
import { ComponentMeta } from "../types";

export const resource_section: ComponentMeta = {
      id: "resource_section",
      title: "44. Resource Section",
      category: "Resource Components",
      desc: "Grouped collection of relevant materials surfaced during a topic or session.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Resources for Binary Trees</div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              <span>📘</span> CLRS Ch. 12
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              <span>🎥</span> MIT OCW Lecture 5
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              <span>📝</span> Your lecture notes (p.14-16)
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Grouped collection of relevant materials surfaced during a topic or session.",
      whySummaUsesIt: "Summa uses resource sections to organize multiple related materials into a coherent collection. One place to find everything relevant to a topic.",
      techniques: ["Resource Organization", "Topic-Based Collection", "Study Material Aggregation"],
      whenSummaUsesIt: ["Multiple resources are relevant to a topic", "The student needs organized access to materials", "A topic spans multiple resource types", "Study sessions benefit from centralized resources"],
      example: "Resources for Binary Trees: CLRS Ch. 12, MIT OCW Lecture 5, Your lecture notes (p.14-16).",
      whatHappensAfter: [{ step: "Resources organized", detail: "Topic-relevant materials grouped" }, { step: "Student accesses", detail: "Materials studied in organized order" }, { step: "Understanding deepens", detail: "Multiple sources reinforce learning" }, { step: "Resource usage tracked", detail: "Which resources are most valuable is recorded" }],
      usedWith: ["Resource Card", "Source Card", "Citation Drawer"],
      decisionSignals: ["Multiple resources relevant", "Organization helps", "Topic-based access valuable"],
    };
