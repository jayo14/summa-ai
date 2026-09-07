import React from "react";
import { ComponentMeta } from "../types";

export const worked_example: ComponentMeta = {
      id: "worked_example",
      title: "12. Worked Example",
      category: "Teaching Components",
      desc: "Problem → step-by-step breakdown → explicit reasoning → verified final answer.",
      badgeBg: "bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft",
      icon: (
        <svg className="w-5 h-5 text-ink dark:text-cream-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-ink dark:text-cream-soft">Problem: Integrate ∫ 2x dx</div>
          <div className="pl-2 border-l-2 border-teal-dark dark:border-accent-lime text-[9px] text-grey-green dark:text-[#8FA29B] space-y-0.5">
            <div>Step 1: Apply power rule ∫ x^n dx = x^(n+1)/(n+1)</div>
            <div>Step 2: 2 * (x^2 / 2) = x^2</div>
          </div>
          <div className="px-2 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-mono text-[9px] font-bold rounded">
            Result: x² + C
          </div>
        </div>
      ),
      whatIsIt: "Problem, step-by-step breakdown, explicit reasoning, verified final answer.",
      whySummaUsesIt: "Summa uses worked examples when the student needs to see expert problem-solving in action. This reduces cognitive load by providing a model before independent practice.",
      techniques: ["Worked Examples", "Scaffolding", "Cognitive Load Management"],
      whenSummaUsesIt: ["The student has not yet solved this type of problem", "The problem type has specific steps that need demonstration", "Before asking the student to solve independently", "The concept involves multi-step reasoning"],
      example: "Problem: Integrate 2x dx. Step 1: Apply power rule. Step 2: 2 times x squared over 2. Result: x squared plus C.",
      whatHappensAfter: [{ step: "Worked example shown", detail: "Expert solution with reasoning displayed" }, { step: "Student attempts similar problem", detail: "Independent practice with new parameters" }, { step: "Performance evaluated", detail: "Comparison against expert model" }, { step: "Scaffolding adjusted", detail: "More examples or independent practice based on result" }],
      usedWith: ["Hint Ladder", "Short Answer", "Scenario"],
      decisionSignals: ["First exposure to problem type", "Multi-step reasoning needed", "Student needs expert model"],
    };
