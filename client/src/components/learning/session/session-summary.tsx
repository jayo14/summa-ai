import React from "react";
import { ComponentMeta } from "../types";

export const session_summary: ComponentMeta = {
      id: "session_summary",
      title: "32. Session Summary",
      category: "Session Components",
      desc: "What was learned, what remains weak, and what happens next.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Session Summary</div>
          <div className="space-y-1">
            <div className="text-[8px]"><span className="font-bold text-teal-dark dark:text-accent-lime">Learned:</span> <span className="text-grey-green dark:text-[#8FA29B]">Binary Tree traversal (inorder, preorder)</span></div>
            <div className="text-[8px]"><span className="font-bold text-destructive dark:text-[#be747e]">Weak:</span> <span className="text-grey-green dark:text-[#8FA29B]">Postorder recursion still shaky</span></div>
            <div className="text-[8px]"><span className="font-bold text-ink dark:text-cream-soft">Next:</span> <span className="text-grey-green dark:text-[#8FA29B]">Practice 3 postorder problems</span></div>
          </div>
        </div>
      ),
      whatIsIt: "What was learned, what remains weak, and what happens next. Post-session intelligence.",
      whySummaUsesIt: "Summa uses session summaries to close the loop on each study session. The student leaves knowing exactly what they accomplished and what comes next.",
      techniques: ["Session Closure", "Intelligence Summary", "Next Step Planning"],
      whenSummaUsesIt: ["A study session is ending", "The student needs to know what they accomplished", "Weak areas need to be identified for next session", "The next study session needs to be planned"],
      example: "Learned: Binary Tree traversal (inorder, preorder). Weak: Postorder recursion still shaky. Next: Practice 3 postorder problems.",
      whatHappensAfter: [{ step: "Summary delivered", detail: "Learned, weak, and next steps presented" }, { step: "Student reviews", detail: "Confirms understanding of progress" }, { step: "Weak areas queued", detail: "Weaknesses scheduled for next session" }, { step: "Next session planned", detail: "Recommended activities for next session generated" }],
      usedWith: ["Session Progress", "Weak Area Card", "Resume Learning"],
      decisionSignals: ["Session ending", "Closure needed", "Next session planning matters"],
    };
