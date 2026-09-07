import React from "react";
import { ComponentMeta } from "../types";

export const scenario: ComponentMeta = {
      id: "scenario",
      title: "10. Scenario / Case Study",
      category: "Core Learning",
      desc: "Give a realistic engineering/academic situation for the student to apply knowledge.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex gap-2 items-center">
          <div className="w-16 h-20 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded-lg p-1.5 flex flex-col justify-between shrink-0">
            <span className="text-[8px] font-bold text-teal-dark dark:text-accent-lime uppercase">CASE #104</span>
            <div className="size-4 rounded bg-teal-dark/10 dark:bg-accent-lime/100 text-white font-bold text-[8px] flex items-center justify-center">⚙</div>
          </div>
          <div className="flex-1 space-y-1.5">
            <p className="text-[10px] text-ink dark:text-cream-soft font-medium leading-snug">
              A high-traffic web server drops requests during peak hours. Which caching pattern resolves this?
            </p>
            <div className="flex justify-end">
              <button className="px-2 py-0.5 rounded bg-teal-dark/10 dark:bg-accent-lime/100 text-white text-[9px] font-bold">Solve</button>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Give a realistic engineering or academic situation for the student to apply knowledge in context.",
      whySummaUsesIt: "Summa uses scenarios when it needs to verify that the learner can apply knowledge to real-world situations. This bridges the gap between theoretical understanding and practical application.",
      techniques: ["Applied Learning", "Contextual Reasoning", "Problem Solving"],
      whenSummaUsesIt: ["Concepts need to be applied in realistic contexts", "The student knows the theory but has not applied it", "Exam questions use scenario-based formats", "Engineering or professional context requires application"],
      example: "A high-traffic web server drops requests during peak hours. Which caching pattern resolves this? You must apply caching knowledge to a realistic problem.",
      whatHappensAfter: [{ step: "Student analyzes scenario", detail: "Problem-solving approach captured" }, { step: "Solution evaluated", detail: "Correct approach and reasoning checked" }, { step: "Application skill assessed", detail: "Whether student can transfer knowledge" }, { step: "Contextual understanding recorded", detail: "Real-world application ability tracked" }],
      usedWith: ["Worked Example", "Short Answer", "Common Mistake Card"],
      decisionSignals: ["Application needed", "Theory-to-practice gap", "Exam uses scenarios"],
    };