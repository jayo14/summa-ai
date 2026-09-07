import React from "react";
import { ComponentMeta } from "../types";

export const topic_coverage: ComponentMeta = {
      id: "topic_coverage",
      title: "36. Topic Coverage",
      category: "Exam Components",
      desc: "Shows which syllabus topics are covered, partially covered, or missing.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs space-y-1.5">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Syllabus Coverage</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "85%" }} />
              </div>
              <span className="text-[8px] font-bold text-teal-dark dark:text-accent-lime w-8 text-right">85%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-mist-green dark:bg-[#2A3838] rounded-full" style={{ width: "60%" }} />
              </div>
              <span className="text-[8px] font-bold text-grey-green dark:text-[#8FA29B] w-8 text-right">60%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-destructive dark:bg-[#be747e] rounded-full" style={{ width: "25%" }} />
              </div>
              <span className="text-[8px] font-bold text-destructive dark:text-[#be747e] w-8 text-right">25%</span>
            </div>
          </div>
          <div className="text-[7px] text-grey-green dark:text-[#8FA29B]">18 covered · 4 partial · 2 missing</div>
        </div>
      ),
      whatIsIt: "Shows which syllabus topics are covered, partially covered, or missing.",
      whySummaUsesIt: "Summa uses topic coverage to give visibility into syllabus completion. The student sees exactly what has been learned and what gaps remain.",
      techniques: ["Coverage Analysis", "Gap Identification", "Syllabus Tracking"],
      whenSummaUsesIt: ["The syllabus needs to be tracked", "Coverage gaps need to be visible", "The student wants to see what is missing", "Exam preparation requires full coverage"],
      example: "Syllabus Coverage: 85% strong, 60% partial, 25% missing. 18 covered, 4 partial, 2 missing.",
      whatHappensAfter: [{ step: "Coverage displayed", detail: "Topic-level completion shown" }, { step: "Gaps identified", detail: "Missing and partial topics highlighted" }, { step: "Study plan updated", detail: "Gaps prioritized for study" }, { step: "Coverage tracked", detail: "Progress toward full coverage monitored" }],
      usedWith: ["Exam Readiness", "Learning Path", "Weak Area Card"],
      decisionSignals: ["Syllabus tracking needed", "Coverage gaps visible", "Full coverage required"],
    };
