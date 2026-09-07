import React from "react";
import { ComponentMeta } from "../types";

export const categorization: ComponentMeta = {
      id: "categorization",
      title: "7. Categorization",
      category: "Core Learning",
      desc: "Drag or sort concepts into appropriate categories or taxonomy buckets.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs grid grid-cols-2 gap-2">
          <div className="bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded-lg p-2 space-y-1">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft block">Linear Data</span>
            <div className="bg-white dark:bg-[#1C2323] border border-teal-dark/30 dark:border-accent-lime/30 rounded px-1.5 py-0.5 text-[8px] font-medium text-ink dark:text-cream-soft">Arrays</div>
            <div className="bg-white dark:bg-[#1C2323] border border-teal-dark/30 dark:border-accent-lime/30 rounded px-1.5 py-0.5 text-[8px] font-medium text-ink dark:text-cream-soft">Linked Lists</div>
          </div>
          <div className="bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg p-2 space-y-1">
            <span className="text-[9px] font-bold text-grey-green dark:text-[#8FA29B] block">Non-Linear</span>
            <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded px-1.5 py-0.5 text-[8px] font-medium text-ink dark:text-cream-soft">Trees</div>
            <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded px-1.5 py-0.5 text-[8px] font-medium text-ink dark:text-cream-soft">Graphs</div>
          </div>
        </div>
      ),
      whatIsIt: "Sort or drag concepts into appropriate categories or taxonomy buckets. Tests classification and conceptual boundaries.",
      whySummaUsesIt: "Summa uses categorization when it needs to verify that the learner can classify concepts correctly. This reveals whether the student understands the boundaries and properties that define categories.",
      techniques: ["Classification", "Conceptual Boundaries", "Taxonomy Building"],
      whenSummaUsesIt: ["Concepts belong to distinct categories", "The student needs to understand what makes something belong to a group", "Classification rules need to be learned", "Multiple categories with overlapping features"],
      example: "Sort into Linear vs Non-Linear: Arrays goes to Linear. Linked Lists goes to Linear. Trees goes to Non-Linear. Graphs goes to Non-Linear.",
      whatHappensAfter: [{ step: "Student categorizes items", detail: "All placements captured" }, { step: "Categories validated", detail: "Correct classifications confirmed" }, { step: "Boundary understanding assessed", detail: "Whether student grasps category definitions" }, { step: "Concept map updated", detail: "Taxonomy relationships recorded" }],
      usedWith: ["Matching", "Compare & Contrast", "Concept Breakdown"],
      decisionSignals: ["Classification needed", "Category boundaries unclear", "Taxonomy learning in progress"],
    };
