import React from "react";
import { ComponentMeta } from "../types";

export const milestone_card: ComponentMeta = {
      id: "milestone_card",
      title: "25. Milestone Card",
      category: "Progress / Guidance",
      desc: "Meaningful achievement based on demonstrated evidence, not points or streaks.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-teal-dark/10 dark:bg-accent-lime/10 flex items-center justify-center text-teal-dark dark:text-accent-lime text-sm">🏆</div>
            <div>
              <div className="text-[10px] font-bold text-ink dark:text-cream-soft">Mastery Achieved</div>
              <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">Binary Search Trees</div>
            </div>
          </div>
          <div className="text-[9px] text-grey-green dark:text-[#8FA29B] leading-snug">
            Scored 92% across 3 quizzes with consistent recall after 7-day interval.
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded text-[7px] font-bold text-teal-dark dark:text-accent-lime">Evidence-based</span>
          </div>
        </div>
      ),
      whatIsIt: "Meaningful achievement based on demonstrated evidence, not points or streaks.",
      whySummaUsesIt: "Summa uses milestones to mark genuine learning achievements. Unlike gamified rewards, milestones are evidence-based and tied to actual mastery.",
      techniques: ["Achievement Recognition", "Evidence-Based Progress", "Motivation"],
      whenSummaUsesIt: ["A concept has been mastered with evidence", "The student has demonstrated sustained understanding", "A meaningful learning goal was achieved", "Recognition reinforces continued effort"],
      example: "Mastery Achieved: Binary Search Trees. Scored 92% across 3 quizzes with consistent recall after 7-day interval.",
      whatHappensAfter: [{ step: "Milestone earned", detail: "Evidence-based achievement recorded" }, { step: "Student notified", detail: "Recognition delivered" }, { step: "Path updated", detail: "Next concept unlocked" }, { step: "Confidence boosted", detail: "Self-efficacy enhanced through evidence" }],
      usedWith: ["Mastery Card", "Learning Path", "Session Summary"],
      decisionSignals: ["Evidence-based mastery confirmed", "Sustained understanding proven", "Achievement worthy of recognition"],
    };
