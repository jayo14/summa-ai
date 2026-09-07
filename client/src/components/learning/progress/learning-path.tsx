import React from "react";
import { ComponentMeta } from "../types";

export const learning_path: ComponentMeta = {
      id: "learning_path",
      title: "24. Learning Path",
      category: "Progress / Guidance",
      desc: "Visual topic progression showing completed, current, and upcoming concepts.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center">
          <div className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase mb-2">Data Structures</div>
          <div className="space-y-1.5 pl-3 border-l-2 border-teal-dark/30 dark:border-accent-lime/30">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime -ml-[11px] border-2 border-white dark:border-[#1C2323]" />
              <span className="text-[9px] text-grey-green dark:text-[#8FA29B] line-through">Arrays ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime -ml-[11px] border-2 border-white dark:border-[#1C2323]" />
              <span className="text-[9px] text-grey-green dark:text-[#8FA29B] line-through">Linked Lists ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime -ml-[11px] border-2 border-white dark:border-[#1C2323] ring-2 ring-teal-dark/30 dark:ring-accent-lime/30" />
              <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Binary Trees ←</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-cream-light dark:bg-[#232D2D] -ml-[11px] border-2 border-white dark:border-[#1C2323]" />
              <span className="text-[9px] text-grey-green dark:text-[#8FA29B] opacity-50">Graphs</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Visual topic progression showing completed, current, and upcoming concepts in a structured path.",
      whySummaUsesIt: "Summa uses learning paths to give students a clear roadmap. Seeing progress and what comes next reduces anxiety and maintains motivation.",
      techniques: ["Progress Visualization", "Roadmap Learning", "Goal Setting"],
      whenSummaUsesIt: ["A topic has multiple sequential concepts", "The student needs to see their progress", "Motivation from visible advancement is needed", "The learning journey has a clear structure"],
      example: "Data Structures path: Arrays (done), Linked Lists (done), Binary Trees (current), Graphs (upcoming).",
      whatHappensAfter: [{ step: "Path displayed", detail: "Current position in learning journey shown" }, { step: "Student completes concept", detail: "Progress updated on path" }, { step: "Next concept highlighted", detail: "Clear next step identified" }, { step: "Path adjusted", detail: "If struggling, path may redirect or add practice" }],
      usedWith: ["Session Plan", "Milestone Card", "Next Action Card"],
      decisionSignals: ["Sequential learning in progress", "Student needs roadmap", "Progress visibility helps"],
    };
