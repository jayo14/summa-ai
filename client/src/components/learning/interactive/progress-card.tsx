import React from "react";
import { ComponentMeta } from "../types";

export const progress_card: ComponentMeta = {
      id: "progress_card",
      title: "Stats & Mastery Card",
      category: "Analytics & Progress",
      desc: "Track your progress, see your strengths and weaknesses, and stay motivated.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex items-center justify-around">
          <div className="relative size-16 flex items-center justify-center">
            <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-mist-green dark:text-[#2A3838] stroke-current" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-teal-dark dark:text-accent-lime stroke-current" strokeDasharray="72, 100" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center leading-none">
              <span className="text-xs font-bold text-ink dark:text-cream-soft">72%</span>
            </div>
          </div>
          <div className="space-y-1 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-teal-dark dark:bg-accent-lime" />
              <span className="font-semibold text-ink dark:text-cream-soft">Strong (4)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-mist-green dark:bg-[#2A3838]" />
              <span className="font-semibold text-ink dark:text-cream-soft">Developing (3)</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Track your progress, see strengths and weaknesses, and stay motivated by evidence.",
      whySummaUsesIt: "Summa uses progress cards to give transparent visibility into learning health. The student sees their overall mastery, strong areas, and developing areas at a glance.",
      techniques: ["Progress Visualization", "Mastery Tracking", "Motivation Through Evidence"],
      whenSummaUsesIt: ["The student wants to see overall progress", "Strengths and weaknesses need visibility", "Motivation from evidence is needed", "Learning health should be transparent"],
      example: "Overall Mastery: 72%. Strong areas: 4. Developing areas: 3. See your progress over time.",
      whatHappensAfter: [{ step: "Progress displayed", detail: "Overall mastery and breakdown shown" }, { step: "Student reviews", detail: "Strengths and weaknesses identified" }, { step: "Motivation maintained", detail: "Evidence-based progress keeps momentum" }, { step: "Focus adjusted", detail: "Student directs effort to developing areas" }],
      usedWith: ["Mastery Card", "Weak Area Card", "Session Summary"],
      decisionSignals: ["Progress visibility needed", "Motivation from evidence", "Strengths and weaknesses matter"],
    };