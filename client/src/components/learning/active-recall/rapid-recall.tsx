import React from "react";
import { ComponentMeta } from "../types";

export const rapid_recall: ComponentMeta = {
      id: "rapid_recall",
      title: "21. Rapid Recall",
      category: "Active-Recall / Retention",
      desc: "Sequence of short, timed questions to build instant recognition speed.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime">⚡ SPEED ROUND</span>
            <span className="text-[9px] font-mono font-bold text-teal-dark dark:text-accent-lime">0:14s</span>
          </div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-semibold">
            What is the default value of a boolean in Java?
          </p>
          <div className="grid grid-cols-2 gap-1">
            <div className="p-1 bg-teal-dark/10 dark:bg-accent-lime/10 text-ink dark:text-cream-soft text-[9px] font-bold rounded text-center">false</div>
            <div className="p-1 bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] text-[9px] font-bold rounded text-center">true</div>
          </div>
        </div>
      ),
      whatIsIt: "Sequence of short, timed questions to build instant recognition speed.",
      whySummaUsesIt: "Summa uses rapid recall when the student needs to build automaticity. Speed of recall is itself a measure of mastery, not just correctness.",
      techniques: ["Speed Training", "Automaticity Building", "Fluency Development"],
      whenSummaUsesIt: ["The student knows the material but needs faster recall", "Automaticity is the learning goal", "The student is preparing for timed assessments", "Quick-fire review session is appropriate"],
      example: "What is the default value of a boolean in Java? You have 14 seconds. Answer: false.",
      whatHappensAfter: [{ step: "Timed question presented", detail: "Question with countdown" }, { step: "Response captured", detail: "Answer and time recorded" }, { step: "Speed assessed", detail: "Correctness plus speed evaluated" }, { step: "Automaticity tracked", detail: "Recall speed trend monitored" }],
      usedWith: ["Rapid Recall", "Confidence Check", "Spaced Review"],
      decisionSignals: ["Speed matters", "Automaticity needed", "Timed assessment prep"],
    };
