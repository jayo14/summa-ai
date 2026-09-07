import React from "react";
import { ComponentMeta } from "../types";

export const post_exam_reflection: ComponentMeta = {
      id: "post_exam_reflection",
      title: "40. Post-Exam Reflection",
      category: "Exam Components",
      desc: "Guided reflection on what felt difficult and where gaps remain.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Post-Exam Reflection</div>
          <div className="space-y-1.5">
            <div className="px-2 py-1.5 bg-cream-light dark:bg-[#232D2D] rounded-lg text-[8px] text-grey-green dark:text-[#8FA29B] italic">
              "Graph traversal questions felt unclear..."
            </div>
            <div className="px-2 py-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded-lg text-[8px] text-ink dark:text-cream-soft font-medium">
              → Focus area: BFS/DFS implementation
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Guided reflection on what felt difficult and where gaps remain.",
      whySummaUsesIt: "Summa uses post-exam reflection to help students process their performance. Reflection turns exam experience into learning insight.",
      techniques: ["Reflective Learning", "Metacognition", "Performance Processing"],
      whenSummaUsesIt: ["An exam or practice exam was completed", "The student needs to process what happened", "Gaps need to be identified through reflection", "Emotional processing of performance matters"],
      example: "Post-Exam Reflection: What felt difficult? Graph traversal questions felt unclear. Focus area: BFS/DFS implementation.",
      whatHappensAfter: [{ step: "Reflection prompts delivered", detail: "Guided questions about the exam experience" }, { step: "Student reflects", detail: "Difficult areas and feelings captured" }, { step: "Gaps identified", detail: "Specific weaknesses surfaced through reflection" }, { step: "Study plan updated", detail: "Reflected insights incorporated into next steps" }],
      usedWith: ["Exam Simulation", "Weak Area Card", "Next Action Card"],
      decisionSignals: ["Exam completed", "Reflection valuable", "Emotional processing needed"],
    };