import React from "react";
import { ComponentMeta } from "../types";

export const hint_ladder: ComponentMeta = {
      id: "hint_ladder",
      title: "13. Hint Ladder",
      category: "Teaching Components",
      desc: "Progressive hints (Hint 1 → Hint 2 → Guided Clue) without immediately giving away the answer.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-ink dark:text-cream-soft">Stuck on recursion base case?</div>
          <div className="space-y-1">
            <div className="px-2 py-1 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 text-ink dark:text-cream-soft text-[9px] rounded font-medium">
              💡 Hint 1: What condition causes n to stop decrementing?
            </div>
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] text-grey-green dark:text-[#8FA29B] text-[9px] rounded opacity-60">
              🔒 Hint 2 (Locked)
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Progressive hints (Hint 1, Hint 2, stronger hint, solution) without immediately giving away the answer.",
      whySummaUsesIt: "Summa uses hint ladders when a student is struggling but still has enough understanding to reach the answer independently. Instead of giving away the solution, Summa progressively increases support.",
      techniques: ["Scaffolding", "Guided Practice", "Active Recall", "Error Correction"],
      whenSummaUsesIt: ["Student is stuck but not completely lost", "The problem is solvable with the right nudge", "Giving the answer would skip important learning", "The student has partial understanding"],
      example: "Stuck on recursion base case? Hint 1: What condition causes n to stop decrementing? Hint 2: Think about when n equals 0 or 1.",
      whatHappensAfter: [{ step: "Hint 1 delivered", detail: "Gentle nudge toward the answer" }, { step: "Student responds", detail: "If correct: advance. If wrong: Hint 2" }, { step: "Progressive support", detail: "Each hint provides more specific guidance" }, { step: "Resolution", detail: "Student reaches answer with or without final reveal" }],
      usedWith: ["Worked Example", "Short Answer", "Confidence Check"],
      decisionSignals: ["Student is stuck", "Partial understanding exists", "Answer reveal would skip learning"],
    };
