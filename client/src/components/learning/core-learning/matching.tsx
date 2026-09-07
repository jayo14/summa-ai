import React from "react";
import { ComponentMeta } from "../types";

export const matching: ComponentMeta = {
      id: "matching",
      title: "5. Matching",
      category: "Core Learning",
      desc: "Match concepts ↔ definitions to build strong structural associations.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      preview: (
        <div className="relative w-full h-[140px] bg-white rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex items-center justify-between">
          <div className="space-y-2 z-10">
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-[9px] font-medium text-ink dark:text-cream-soft">
              Photosynthesis
            </div>
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-[9px] font-medium text-ink dark:text-cream-soft">
              Mitochondria
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current" viewBox="0 0 200 120">
            <path d="M 80 40 C 120 40, 110 80, 140 80" stroke="currentColor" className="text-teal-dark dark:text-accent-lime" strokeWidth="1.5" fill="none" />
            <path d="M 80 75 C 110 75, 110 38, 140 38" stroke="currentColor" className="text-teal-dark dark:text-accent-lime" strokeWidth="1.5" fill="none" />
          </svg>
          <div className="space-y-2 z-10 text-right">
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-[9px] font-medium text-ink dark:text-cream-soft">
              ATP energy production
            </div>
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-[9px] font-medium text-ink dark:text-cream-soft">
              Light into glucose
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Match concepts to their definitions, properties, or related items. Builds structural associations between related ideas.",
      whySummaUsesIt: "Summa uses matching when it needs to build or verify structural associations between concepts. Particularly effective for vocabulary, terminology networks, and concept mapping.",
      techniques: ["Association Building", "Structural Learning", "Concept Mapping"],
      whenSummaUsesIt: ["Multiple related concepts need to be connected", "Vocabulary or terminology network is being built", "The student confuses similar concepts", "Review of related concept pairs"],
      example: "Match: Photosynthesis to Light into glucose. Mitochondria to ATP energy production. This reinforces the relationship between organelles and their functions.",
      whatHappensAfter: [{ step: "Student matches pairs", detail: "All pairings captured" }, { step: "Correct matches confirmed", detail: "Correct associations reinforced" }, { step: "Incorrect matches corrected", detail: "Wrong associations explicitly corrected" }, { step: "Association strength updated", detail: "Concept pair relationships recorded" }],
      usedWith: ["Categorization", "Compare & Contrast", "Retrieval Grid"],
      decisionSignals: ["Concept pairs need reinforcement", "Vocabulary network building", "Confusion between similar items"],
    };
