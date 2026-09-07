import React from "react";
import { ComponentMeta } from "../types";

export const why_it_works: ComponentMeta = {
      id: "why_it_works",
      title: "18. Why It Works",
      category: "Teaching Components",
      desc: "Focuses on first-principles underlying mechanics rather than shallow rote memorization.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">First Principles</span>
          <p className="text-[10px] text-ink dark:text-cream-soft font-semibold leading-tight">
            Why Binary Search is O(log n)
          </p>
          <p className="text-[9px] text-grey-green dark:text-[#8FA29B] leading-tight">
            Each step cuts the remaining dataset in half (n/2, n/4, n/8...), making division logarithmic.
          </p>
        </div>
      ),
      whatIsIt: "Focuses on first-principles underlying mechanics rather than shallow rote memorization.",
      whySummaUsesIt: "Summa uses why-it-works when the student needs to understand the reasoning behind a concept, not just the fact. This builds transferable understanding.",
      techniques: ["First-Principles Thinking", "Deep Understanding", "Transfer Learning"],
      whenSummaUsesIt: ["The student is memorizing without understanding", "The concept has deeper mechanics worth exploring", "Transfer to new situations is needed", "The why is as important as the what"],
      example: "Why Binary Search is O(log n): Each step cuts the remaining dataset in half (n/2, n/4, n/8), making division logarithmic.",
      whatHappensAfter: [{ step: "Underlying principle explained", detail: "First-principles reasoning presented" }, { step: "Student grasps the why", detail: "Understanding goes beyond memorization" }, { step: "Transfer tested", detail: "Student applies reasoning to new situation" }, { step: "Deep understanding recorded", detail: "Conceptual depth tracked" }],
      usedWith: ["Explanation Card", "Analogy Card", "Teach-Back"],
      decisionSignals: ["Student memorizing without understanding", "Deeper mechanics valuable", "Transfer needed"],
    };