import React from "react";
import { ComponentMeta } from "../types";

export const analogy_card: ComponentMeta = {
      id: "analogy_card",
      title: "16. Analogy Card",
      category: "Teaching Components",
      desc: "Explains abstract technical ideas using relatable real-world mental models.",
      badgeBg: "bg-destructive/10 dark:bg-[#be747e]/10 text-destructive dark:text-[#be747e]",
      icon: (
        <svg className="w-5 h-5 text-destructive dark:text-[#be747e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-destructive dark:text-[#be747e] uppercase">Analogy</span>
          <p className="text-[10px] text-ink dark:text-cream-soft leading-tight">
            <strong>RAM vs Hard Drive:</strong> Like your office desk space vs a filing cabinet in the basement.
          </p>
          <div className="text-[9px] text-grey-green dark:text-[#8FA29B] italic">Quick memory access vs permanent storage</div>
        </div>
      ),
      whatIsIt: "Explains abstract technical ideas using relatable real-world mental models.",
      whySummaUsesIt: "Summa uses analogies when a concept is too abstract to grasp directly. Mapping to a familiar domain creates a mental anchor that makes the abstract concrete.",
      techniques: ["Analogical Reasoning", "Mental Model Building", "Abstract-to-Concrete Mapping"],
      whenSummaUsesIt: ["The concept is highly abstract", "The student lacks the background for direct explanation", "A familiar domain maps well to the concept", "The student needs a mental anchor"],
      example: "RAM vs Hard Drive: Like your office desk space vs a filing cabinet in the basement. Quick memory access vs permanent storage.",
      whatHappensAfter: [{ step: "Analogy presented", detail: "Familiar domain mapped to concept" }, { step: "Connection verified", detail: "Student confirms the mapping makes sense" }, { step: "Concept grasped", detail: "Abstract idea now has concrete anchor" }, { step: "Analogy retired", detail: "Direct understanding replaces the analogy over time" }],
      usedWith: ["Explanation Card", "Teach-Back", "Why It Works"],
      decisionSignals: ["Concept is abstract", "Familiar domain available", "Direct explanation insufficient"],
    };
