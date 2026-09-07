import React from "react";
import { ComponentMeta } from "../types";

export const explanation_card: ComponentMeta = {
      id: "explanation_card",
      title: "11. Explanation Card",
      category: "Teaching Components",
      desc: "Structured, high-clarity explanation with progressive disclosure of key insights.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">Core Principle</span>
            <h4 className="text-[11px] font-bold text-ink dark:text-cream-soft">Dynamic Method Dispatch</h4>
          </div>
          <p className="text-[10px] text-grey-green dark:text-[#8FA29B] leading-snug">
            At runtime, Java checks the actual object type (e.g. <code className="text-teal-dark dark:text-accent-lime font-mono">Dog</code>) rather than reference variable type.
          </p>
          <div className="text-[9px] text-teal-dark dark:text-accent-lime font-semibold cursor-pointer">▶ Tap to expand deep-dive</div>
        </div>
      ),
      whatIsIt: "Structured, high-clarity explanation with progressive disclosure of key insights.",
      whySummaUsesIt: "Summa uses explanation cards when a concept needs clear, structured teaching. Progressive disclosure prevents cognitive overload by revealing complexity gradually.",
      techniques: ["Scaffolding", "Progressive Disclosure", "Cognitive Load Management"],
      whenSummaUsesIt: ["A new concept needs to be taught clearly", "The concept has layers that should be revealed progressively", "The student benefits from structured presentation", "Building foundation before complexity"],
      example: "Summa explains Dynamic Method Dispatch: starts with the core principle, then reveals how Java checks actual object type at runtime rather than reference type.",
      whatHappensAfter: [{ step: "Explanation delivered", detail: "Structured content presented with progressive disclosure" }, { step: "Comprehension checked", detail: "Follow-up question to verify understanding" }, { step: "Depth adjusted", detail: "More examples if needed, or advance if understood" }, { step: "Concept marked as taught", detail: "Ready for practice and recall" }],
      usedWith: ["Worked Example", "Teach-Back", "Hint Ladder"],
      decisionSignals: ["New concept introduction", "Student needs structured teaching", "Progressive complexity appropriate"],
    };
