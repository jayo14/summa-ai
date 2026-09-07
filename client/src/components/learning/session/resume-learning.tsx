import React from "react";
import { ComponentMeta } from "../types";

export const resume_learning: ComponentMeta = {
      id: "resume_learning",
      title: "33. Resume Learning",
      category: "Session Components",
      desc: "Continue where you stopped — picks up at the exact concept and step.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Resume Where You Stopped</div>
          <div className="p-2 bg-cream-light dark:bg-[#232D2D] rounded-lg space-y-1">
            <div className="text-[9px] font-semibold text-ink dark:text-cream-soft">Binary Trees — Postorder Traversal</div>
            <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">Step 2 of 4: Writing recursive case</div>
            <div className="w-full h-1 bg-mist-green dark:bg-[#2A3838] rounded-full overflow-hidden">
              <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "50%" }} />
            </div>
          </div>
          <button className="w-full py-1.5 bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-[9px] font-bold rounded-lg">Continue</button>
        </div>
      ),
      whatIsIt: "Continue where you stopped, picking up at the exact concept and step.",
      whySummaUsesIt: "Summa uses resume learning to eliminate the friction of starting a new session. The student picks up exactly where they left off, with zero re-orientation needed.",
      techniques: ["Session Continuity", "Friction Reduction", "Context Preservation"],
      whenSummaUsesIt: ["The student returns after a break", "The previous session was incomplete", "Continuity matters for learning momentum", "Re-orientation time should be minimized"],
      example: "Resume Where You Stopped: Binary Trees, Postorder Traversal. Step 2 of 4: Writing recursive case.",
      whatHappensAfter: [{ step: "Context restored", detail: "Previous session state loaded" }, { step: "Student resumes", detail: "Picks up at exact stopping point" }, { step: "Session continues", detail: "Learning flows without interruption" }, { step: "Progress accumulated", detail: "New progress added to previous session" }],
      usedWith: ["Session Plan", "Session Progress", "Learning Path"],
      decisionSignals: ["Returning student", "Previous session incomplete", "Continuity matters"],
    };