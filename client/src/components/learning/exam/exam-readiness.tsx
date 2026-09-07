import React from "react";
import { ComponentMeta } from "../types";

export const exam_readiness: ComponentMeta = {
      id: "exam_readiness",
      title: "35. Exam Readiness",
      category: "Exam Components",
      desc: "Overall readiness percentage with topic breakdown and risk areas.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Exam Readiness</span>
            <span className="text-lg font-extrabold text-teal-dark dark:text-accent-lime font-mono">68%</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[8px]">
              <span className="size-1.5 rounded-full bg-teal-dark dark:bg-accent-lime" />
              <span className="text-grey-green dark:text-[#8FA29B]">Strong: OOP, Memory Mgmt</span>
            </div>
            <div className="flex items-center gap-2 text-[8px]">
              <span className="size-1.5 rounded-full bg-mist-green dark:bg-[#2A3838]" />
              <span className="text-grey-green dark:text-[#8FA29B]">Partial: Graphs, Trees</span>
            </div>
            <div className="flex items-center gap-2 text-[8px]">
              <span className="size-1.5 rounded-full bg-destructive dark:bg-[#be747e]" />
              <span className="text-grey-green dark:text-[#8FA29B]">Weak: B-Trees, Hashing</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Overall readiness percentage with topic breakdown and risk areas.",
      whySummaUsesIt: "Summa uses exam readiness to give an honest, evidence-based assessment of preparation. No false confidence, just data.",
      techniques: ["Readiness Assessment", "Risk Analysis", "Preparation Planning"],
      whenSummaUsesIt: ["An exam is approaching and readiness needs assessment", "The student wants an honest readiness number", "Topic-level breakdown is needed", "Risk areas must be identified"],
      example: "Exam Readiness: 68%. Strong: OOP, Memory Mgmt. Partial: Graphs, Trees. Weak: B-Trees, Hashing.",
      whatHappensAfter: [{ step: "Readiness calculated", detail: "Overall percentage computed" }, { step: "Topics broken down", detail: "Strong, partial, and weak areas listed" }, { step: "Risk areas flagged", detail: "High-risk topics highlighted" }, { step: "Study plan adjusted", detail: "Focus shifts to weak areas" }],
      usedWith: ["Exam Countdown", "Topic Coverage", "Weak Area Card"],
      decisionSignals: ["Exam approaching", "Honest assessment needed", "Topic-level breakdown matters"],
    };
