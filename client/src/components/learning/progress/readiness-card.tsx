import React from "react";
import { ComponentMeta } from "../types";

export const readiness_card: ComponentMeta = {
      id: "readiness_card",
      title: "27. Readiness Card",
      category: "Progress / Guidance",
      desc: "Shows exam or topic readiness percentage based on coverage and mastery.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">CSC 201 Final Exam</span>
            <span className="text-[9px] font-mono font-bold text-teal-dark dark:text-accent-lime">74%</span>
          </div>
          <div className="w-full h-2 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
            <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "74%" }} />
          </div>
          <div className="grid grid-cols-3 gap-1 text-[8px]">
            <div className="text-center"><span className="font-bold text-teal-dark dark:text-accent-lime">18</span><br/><span className="text-grey-green dark:text-[#8FA29B]">Covered</span></div>
            <div className="text-center"><span className="font-bold text-ink dark:text-cream-soft">4</span><br/><span className="text-grey-green dark:text-[#8FA29B]">Partial</span></div>
            <div className="text-center"><span className="font-bold text-destructive dark:text-[#be747e]">2</span><br/><span className="text-grey-green dark:text-[#8FA29B]">Missing</span></div>
          </div>
        </div>
      ),
      whatIsIt: "Exam or topic readiness percentage based on coverage and mastery across all relevant concepts.",
      whySummaUsesIt: "Summa uses readiness cards to give a single, honest number that reflects how prepared the student is. No sugar-coating, just evidence-based readiness.",
      techniques: ["Readiness Assessment", "Coverage Analysis", "Preparation Planning"],
      whenSummaUsesIt: ["An exam or assessment is approaching", "The student wants to know if they are ready", "Coverage and mastery need to be combined into one signal", "Study planning needs a readiness baseline"],
      example: "CSC 201 Final Exam: 74% ready. 18 topics covered, 4 partial, 2 missing.",
      whatHappensAfter: [{ step: "Readiness calculated", detail: "Coverage plus mastery combined" }, { step: "Gaps identified", detail: "Specific weak areas highlighted" }, { step: "Study plan adjusted", detail: "Focus shifts to gaps" }, { step: "Readiness tracked", detail: "Progress toward exam readiness monitored" }],
      usedWith: ["Exam Countdown", "Weak Area Card", "Next Action Card"],
      decisionSignals: ["Exam approaching", "Readiness assessment needed", "Coverage plus mastery matters"],
    };
