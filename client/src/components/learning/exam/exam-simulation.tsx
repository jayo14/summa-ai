import React from "react";
import { ComponentMeta } from "../types";

export const exam_simulation: ComponentMeta = {
      id: "exam_simulation",
      title: "39. Exam Simulation",
      category: "Exam Components",
      desc: "Timed realistic practice exam with conditions matching the actual test.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Exam Simulation</span>
            <span className="text-[9px] font-mono font-bold text-teal-dark dark:text-accent-lime">1:45:00</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-grey-green dark:text-[#8FA29B]">Questions</span>
              <span className="font-bold text-ink dark:text-cream-soft">30 of 40</span>
            </div>
            <div className="w-full h-1 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
              <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "75%" }} />
            </div>
          </div>
          <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">No hints · No lookup · Timed</div>
        </div>
      ),
      whatIsIt: "Timed realistic practice exam with conditions matching the actual test.",
      whySummaUsesIt: "Summa uses exam simulations to give the student authentic test experience. No hints, no lookup, timed conditions build exam readiness.",
      techniques: ["Exam Simulation", "Timed Practice", "Authentic Conditions"],
      whenSummaUsesIt: ["The exam is approaching and realistic practice is needed", "The student needs to experience timed conditions", "Full-length practice under exam rules", "Stamina and pacing need practice"],
      example: "Exam Simulation: 1 hour 45 minutes. 30 of 40 questions completed. No hints, no lookup, timed.",
      whatHappensAfter: [{ step: "Simulation starts", detail: "Timed exam conditions activated" }, { step: "Student completes exam", detail: "All responses captured under time pressure" }, { step: "Results evaluated", detail: "Score, time per question, and weak areas analyzed" }, { step: "Readiness recalculated", detail: "Exam readiness updated based on performance" }],
      usedWith: ["Exam Readiness", "Post-Exam Reflection", "Predicted Practice"],
      decisionSignals: ["Realistic practice needed", "Timed conditions important", "Exam stamina matters"],
    };
