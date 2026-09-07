import React from "react";
import { ComponentMeta } from "../types";

export const confidence_check: ComponentMeta = {
      id: "confidence_check",
      title: "9. Confidence Check",
      category: "Core Learning",
      desc: "Rate how confident you feel (1–5) and pair it directly with actual test performance.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-ink dark:text-cream-soft leading-tight">
            How confident do you feel about Big-O time complexity analysis?
          </p>
          <div className="flex items-center justify-between gap-1 py-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className={`size-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                  level === 4
                    ? "bg-teal-dark/10 dark:bg-accent-lime text-white shadow-xs"
                    : "bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] hover:bg-mist-green/50 dark:hover:bg-[#2A3838]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-grey-green dark:text-[#8FA29B] text-center font-medium">1 = Unsure · 5 = Mastered</div>
        </div>
      ),
      whatIsIt: "Rate how confident you feel (1 to 5) and pair it directly with actual test performance. Surfaces overconfidence and underconfidence.",
      whySummaUsesIt: "Summa uses confidence checks to calibrate the learner's self-awareness. Knowing what you don't know is as important as knowing what you do. This pairing reveals calibration gaps.",
      techniques: ["Metacognition", "Self-Assessment Calibration", "Learning Awareness"],
      whenSummaUsesIt: ["After a quiz or practice session", "The student may be overconfident or underconfident", "Calibration of self-assessment is needed", "Before recommending next steps"],
      example: "How confident do you feel about Big-O time complexity analysis? You rate 4 out of 5. Then you score 60% on a quiz, revealing overconfidence.",
      whatHappensAfter: [{ step: "Student rates confidence", detail: "Self-assessment captured (1-5)" }, { step: "Performance compared", detail: "Confidence vs actual score analyzed" }, { step: "Calibration gap flagged", detail: "Over or under-confidence identified" }, { step: "Next action adjusted", detail: "If overconfident: more practice. If underconfident: encouragement plus proof" }],
      usedWith: ["Multiple Choice", "Short Answer", "Mastery Card"],
      decisionSignals: ["Self-awareness check needed", "After assessment", "Calibration matters"],
    };
