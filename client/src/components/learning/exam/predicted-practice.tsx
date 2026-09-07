import React from "react";
import { ComponentMeta } from "../types";

export const predicted_practice: ComponentMeta = {
      id: "predicted_practice",
      title: "38. Predicted Practice",
      category: "Exam Components",
      desc: "Generated practice questions based on patterns — clearly labeled as AI-generated.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Predicted Questions</span>
            <span className="px-1.5 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded text-[7px] font-bold text-teal-dark dark:text-accent-lime">AI-Generated</span>
          </div>
          <div className="space-y-1">
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              Explain BFS vs DFS with a real-world use case.
            </div>
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              Write pseudocode for inserting into a BST.
            </div>
          </div>
          <div className="text-[7px] text-grey-green dark:text-[#8FA29B] italic">Based on 5-year exam pattern analysis</div>
        </div>
      ),
      whatIsIt: "Generated practice questions based on patterns, clearly labeled as AI-generated.",
      whySummaUsesIt: "Summa uses predicted practice to provide exam-like practice that mirrors likely question patterns. Always labeled as generated to maintain trust and transparency.",
      techniques: ["Pattern-Based Practice", "Exam Simulation", "Transparent Generation"],
      whenSummaUsesIt: ["Exam patterns suggest likely topics", "Practice questions aligned with exam style are needed", "The student wants realistic exam preparation", "Transparency about generation source matters"],
      example: "Predicted Questions (AI-Generated): Explain BFS vs DFS with a real-world use case. Write pseudocode for inserting into a BST.",
      whatHappensAfter: [{ step: "Questions generated", detail: "Pattern-aligned practice created" }, { step: "Student attempts", detail: "Practice completed with exam conditions" }, { step: "Performance assessed", detail: "Readiness updated based on results" }, { step: "Next questions generated", detail: "Adaptive practice continues" }],
      usedWith: ["Past Question Analysis", "Exam Simulation", "Exam Readiness"],
      decisionSignals: ["Patterns available", "Realistic practice needed", "Transparency matters"],
    };
