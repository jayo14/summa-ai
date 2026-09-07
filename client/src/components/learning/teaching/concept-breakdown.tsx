import React from "react";
import { ComponentMeta } from "../types";

export const concept_breakdown: ComponentMeta = {
      id: "concept_breakdown",
      title: "14. Concept Breakdown",
      category: "Teaching Components",
      desc: "Deconstructs complex subjects into digestable, modular sub-concepts.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-ink dark:text-cream-soft">Database Indexing</div>
          <div className="grid grid-cols-2 gap-1 text-[9px]">
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-ink dark:text-cream-soft font-medium">B-Trees</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-ink dark:text-cream-soft font-medium">Hash Tables</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-ink dark:text-cream-soft font-medium">Scan Overhead</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-ink dark:text-cream-soft font-medium">Write Cost</div>
          </div>
        </div>
      ),
      whatIsIt: "Deconstructs complex subjects into digestible, modular sub-concepts.",
      whySummaUsesIt: "Summa uses concept breakdown when a topic is too complex to absorb at once. Breaking it into modules makes each piece learnable and trackable.",
      techniques: ["Decomposition", "Modular Learning", "Complexity Management"],
      whenSummaUsesIt: ["A concept has multiple interrelated parts", "The student is overwhelmed by complexity", "The topic spans several sub-topics", "Each sub-concept needs individual mastery tracking"],
      example: "Database Indexing breaks down into: B-Trees, Hash Tables, Scan Overhead, Write Cost. Each module is taught and tracked separately.",
      whatHappensAfter: [{ step: "Concept decomposed", detail: "Sub-concepts identified and ordered" }, { step: "Each module taught", detail: "Individual sub-concepts explained" }, { step: "Module mastery tracked", detail: "Each piece assessed independently" }, { step: "Assembly verified", detail: "Student demonstrates understanding of the whole" }],
      usedWith: ["Explanation Card", "Learning Path", "Mastery Card"],
      decisionSignals: ["Topic too complex for single pass", "Multiple sub-concepts exist", "Student overwhelmed"],
    };
