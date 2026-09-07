import React from "react";
import { ComponentMeta } from "../types";

export const next_action: ComponentMeta = {
      id: "next_action",
      title: "29. Next Action Card",
      category: "Progress / Guidance",
      desc: "Recommends the single best next step based on current learning state.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">Best Next Step</div>
          <div>
            <p className="text-[10px] font-semibold text-ink dark:text-cream-soft leading-snug">
              Practice applying Kirchhoff's laws to solve a 3-loop circuit problem.
            </p>
            <p className="text-[8px] text-grey-green dark:text-[#8FA29B] mt-1">Based on: Weak in circuit analysis (52% mastery)</p>
          </div>
          <button className="w-full py-1.5 bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-[9px] font-bold rounded-lg">Start Practice</button>
        </div>
      ),
      whatIsIt: "Recommends the single best next step based on current learning state.",
      whySummaUsesIt: "Summa uses next action cards to eliminate decision fatigue. Instead of the student wondering what to study next, Summa recommends the highest-impact action.",
      techniques: ["Decision Support", "Optimal Sequencing", "Learning Optimization"],
      whenSummaUsesIt: ["The student finishes a study session", "The student is unsure what to do next", "Multiple paths are available", "The highest-impact action needs identification"],
      example: "Best Next Step: Practice applying Kirchhoff's laws to solve a 3-loop circuit problem. Based on: Weak in circuit analysis (52% mastery).",
      whatHappensAfter: [{ step: "Action recommended", detail: "Single best next step identified" }, { step: "Student accepts or modifies", detail: "Action taken or adjusted" }, { step: "Learning state updated", detail: "Progress from action recorded" }, { step: "Next action recalculated", detail: "New recommendation generated" }],
      usedWith: ["Session Plan", "Weak Area Card", "Learning Path"],
      decisionSignals: ["Decision fatigue possible", "Multiple paths available", "Highest-impact action matters"],
    };