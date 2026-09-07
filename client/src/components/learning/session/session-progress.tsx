import React from "react";
import { ComponentMeta } from "../types";

export const session_progress: ComponentMeta = {
      id: "session_progress",
      title: "31. Session Progress",
      category: "Session Components",
      desc: "Tracks actual learning progress during a session — not gamified points.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Session: 32 min</div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-[8px] mb-0.5">
                <span className="text-grey-green dark:text-[#8FA29B]">Concepts Covered</span>
                <span className="font-bold text-ink dark:text-cream-soft">3 / 4</span>
              </div>
              <div className="w-full h-1 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[8px] mb-0.5">
                <span className="text-grey-green dark:text-[#8FA29B]">Quiz Accuracy</span>
                <span className="font-bold text-teal-dark dark:text-accent-lime">80%</span>
              </div>
              <div className="w-full h-1 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "80%" }} />
              </div>
            </div>
          </div>
          <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">2 concepts need review before next session</div>
        </div>
      ),
      whatIsIt: "Tracks actual learning progress during a session, not gamified points.",
      whySummaUsesIt: "Summa uses session progress to show genuine learning advancement. No points, no streaks, just honest tracking of what was learned and what still needs work.",
      techniques: ["Progress Tracking", "Honest Assessment", "Session Monitoring"],
      whenSummaUsesIt: ["A study session is in progress", "The student wants to see their current progress", "Honest tracking matters more than gamification", "Session effectiveness needs monitoring"],
      example: "Session: 32 min. Concepts Covered: 3 of 4. Quiz Accuracy: 80%. 2 concepts need review.",
      whatHappensAfter: [{ step: "Progress displayed", detail: "Current session metrics shown" }, { step: "Student continues", detail: "Progress updates in real-time" }, { step: "Session concludes", detail: "Final progress captured" }, { step: "Summary generated", detail: "Session summary created from progress data" }],
      usedWith: ["Session Plan", "Session Summary", "Mastery Card"],
      decisionSignals: ["Session in progress", "Real-time tracking needed", "Honest progress matters"],
    };
