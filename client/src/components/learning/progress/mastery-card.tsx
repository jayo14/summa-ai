import React from "react";
import { ComponentMeta } from "../types";

export const mastery_card: ComponentMeta = {
      id: "mastery_card",
      title: "26. Mastery Card",
      category: "Progress / Guidance",
      desc: "Shows concept strength with concrete evidence and decay timeline.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Polymorphism</span>
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime">88%</span>
          </div>
          <div className="w-full h-1.5 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
            <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "88%" }} />
          </div>
          <div className="flex items-center justify-between text-[8px] text-grey-green dark:text-[#8FA29B]">
            <span>3 quizzes passed</span>
            <span>Decay in 5 days</span>
          </div>
        </div>
      ),
      whatIsIt: "Shows concept strength with concrete evidence and decay timeline.",
      whySummaUsesIt: "Summa uses mastery cards to give students transparent visibility into how well they know something and when they need to review.",
      techniques: ["Mastery Tracking", "Decay Monitoring", "Transparent Assessment"],
      whenSummaUsesIt: ["The student wants to know how well they know something", "Decay timeline needs to be communicated", "Mastery evidence should be visible", "The student is tracking their own progress"],
      example: "Polymorphism: 88% mastery. 3 quizzes passed. Decay in 5 days.",
      whatHappensAfter: [{ step: "Mastery displayed", detail: "Current strength shown with evidence" }, { step: "Decay predicted", detail: "When review will be needed" }, { step: "Student decides", detail: "Review now or wait until decay approaches" }, { step: "Mastery tracked over time", detail: "Trend monitored for learning health" }],
      usedWith: ["Confidence Check", "Spaced Review", "Readiness Card"],
      decisionSignals: ["Student wants visibility", "Decay timeline relevant", "Evidence of mastery available"],
    };
