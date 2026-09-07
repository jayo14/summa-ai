import React from "react";
import { ArrowRight } from "lucide-react";
import { ComponentMeta } from "../types";

export const short_answer: ComponentMeta = {
      id: "short_answer",
      title: "2. Short Answer",
      desc: "Student writes an open explanation → Summa evaluates key ideas and offers precise feedback.",
      category: "Core Learning",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-ink dark:text-cream-soft leading-tight">
            Explain the difference between stack and heap memory.
          </p>
          <div className="relative mt-1.5">
            <div className="w-full h-14 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl p-2 text-[10px] text-grey-green dark:text-[#8FA29B] font-sans leading-tight">
              Stack holds static local frames; heap allocates dynamic objects...
            </div>
            <button className="absolute right-1.5 bottom-1.5 size-5 rounded-full bg-teal-dark/10 dark:bg-accent-lime/100 text-white flex items-center justify-center shadow-xs">
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      ),
      whatIsIt: "An open-ended question where the student writes a free-text response. Summa evaluates key ideas and provides precise feedback.",
      whySummaUsesIt: "Summa uses short answer when it needs to evaluate understanding beyond recognition, when the learner must actively construct an explanation. This reveals depth that multiple choice cannot.",
      techniques: ["Active Recall", "Elaborative Learning", "Assessment"],
      whenSummaUsesIt: ["Student has learned a concept and needs to demonstrate understanding", "Summa wants to check if the student can articulate, not just recognize", "The concept has multiple key ideas that need coverage", "Before marking a concept as understood"],
      example: "After explaining stack vs heap memory, Summa asks you to write a short explanation of the difference. Your response is evaluated for completeness and accuracy.",
      whatHappensAfter: [{ step: "Student writes response", detail: "Free text captured" }, { step: "Summa evaluates key ideas", detail: "Checks for required concepts and accuracy" }, { step: "Feedback delivered", detail: "What was correct, what was missing, what was wrong" }, { step: "Mastery estimate updated", detail: "Depth of understanding recorded" }],
      usedWith: ["Explanation Card", "Worked Example", "Mastery Card"],
      decisionSignals: ["Depth check needed", "Articulation reveals true understanding", "Concept has nuance"],
    };
