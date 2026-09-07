import React from "react";
import { ComponentMeta } from "../types";

export const ordering: ComponentMeta = {
      id: "ordering",
      title: "6. Ordering",
      category: "Core Learning",
      desc: "Arrange events, execution steps or multi-stage algorithms into the correct sequence.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs space-y-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded-lg">
            <span className="size-3.5 rounded-full bg-teal-dark dark:bg-accent-lime text-white font-bold text-[8px] flex items-center justify-center">1</span>
            <span className="text-[9px] font-semibold text-ink dark:text-cream-soft">Compile Source Code</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg">
            <span className="size-3.5 rounded-full bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] font-bold text-[8px] flex items-center justify-center">2</span>
            <span className="text-[9px] font-medium text-ink dark:text-cream-soft">Generate Bytecode</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg">
            <span className="size-3.5 rounded-full bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] font-bold text-[8px] flex items-center justify-center">3</span>
            <span className="text-[9px] font-medium text-ink dark:text-cream-soft">Load via JVM ClassLoader</span>
          </div>
        </div>
      ),
      whatIsIt: "Arrange events, steps, or processes into the correct sequence. Tests understanding of procedural and chronological knowledge.",
      whySummaUsesIt: "Summa uses ordering when the sequence of events or steps is critical to understanding. It reveals whether the learner understands not just what happens, but in what order and why.",
      techniques: ["Procedural Knowledge", "Sequential Reasoning", "Process Understanding"],
      whenSummaUsesIt: ["A process has critical sequential dependencies", "Algorithm steps need to be understood in order", "Historical events require chronological knowledge", "The student understands components but not the flow"],
      example: "Put in order: Compile Source Code, Generate Bytecode, Load via JVM ClassLoader. This tests understanding of the Java compilation pipeline.",
      whatHappensAfter: [{ step: "Student orders items", detail: "Sequence captured" }, { step: "Sequence validated", detail: "Correct order confirmed or corrected" }, { step: "Procedural understanding assessed", detail: "Whether student grasps dependencies" }, { step: "Next action determined", detail: "Advance or review based on accuracy" }],
      usedWith: ["Categorization", "Concept Breakdown", "Worked Example"],
      decisionSignals: ["Sequence matters", "Process understanding needed", "Steps have dependencies"],
    };
