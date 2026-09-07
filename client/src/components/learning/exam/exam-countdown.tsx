import React from "react";
import { ComponentMeta } from "../types";

export const exam_countdown: ComponentMeta = {
      id: "exam_countdown",
      title: "34. Exam Countdown",
      category: "Exam Components",
      desc: "Shows days remaining with readiness status and recommended focus areas.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">CSC 201 Final</div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-teal-dark dark:text-accent-lime font-mono">12</div>
            <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">days remaining</div>
          </div>
          <div className="text-[8px] text-grey-green dark:text-[#8FA29B] text-center">Focus: Graph algorithms (38% mastery)</div>
        </div>
      ),
      whatIsIt: "Shows days remaining with readiness status and recommended focus areas.",
      whySummaUsesIt: "Summa uses exam countdowns to create urgency and focus. Knowing exactly how many days remain helps the student allocate effort to the highest-impact areas.",
      techniques: ["Urgency Creation", "Focus Allocation", "Time Management"],
      whenSummaUsesIt: ["An exam date is known and approaching", "The student needs motivation from time pressure", "Focus areas need to be prioritized by deadline", "Study time should be allocated efficiently"],
      example: "CSC 201 Final: 12 days remaining. Focus: Graph algorithms (38% mastery).",
      whatHappensAfter: [{ step: "Countdown displayed", detail: "Days remaining and focus areas shown" }, { step: "Student adjusts plan", detail: "Study plan prioritizes weak areas" }, { step: "Focus narrows", detail: "Effort concentrated on high-impact topics" }, { step: "Readiness tracked", detail: "Daily readiness improvement monitored" }],
      usedWith: ["Exam Readiness", "Weak Area Card", "Next Action Card"],
      decisionSignals: ["Exam date known", "Time pressure helps", "Focus allocation matters"],
    };
