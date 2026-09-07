import React from "react";
import { ComponentMeta } from "../types";

export const recall_prompt: ComponentMeta = {
      id: "recall_prompt",
      title: "19. Recall Prompt",
      category: "Active-Recall / Retention",
      desc: "'Without looking, explain...' Active memory retrieval prompt before showing hints.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">Closed-Book Recall</div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-medium leading-tight">
            Without looking at your notes, state the 3 ACID properties in database transactions.
          </p>
          <button className="py-1 bg-teal-dark/10 dark:bg-accent-lime text-white text-[9px] font-bold rounded-lg shadow-xs">Reveal Answer</button>
        </div>
      ),
      whatIsIt: "Without looking, explain... Active memory retrieval prompt before showing hints.",
      whySummaUsesIt: "Summa uses recall prompts to force active retrieval from memory. The effort of recalling strengthens the memory trace more than re-reading or re-explanation.",
      techniques: ["Retrieval Practice", "Active Recall", "Memory Strengthening"],
      whenSummaUsesIt: ["A concept was previously learned and needs recall testing", "The student has not retrieved this information recently", "Active effort will strengthen the memory", "Before showing any hints or answers"],
      example: "Without looking at your notes, state the 3 ACID properties in database transactions.",
      whatHappensAfter: [{ step: "Student attempts recall", detail: "Memory retrieval effort captured" }, { step: "Success or struggle noted", detail: "Recall strength assessed" }, { step: "Feedback delivered", detail: "Correct answers confirmed or gaps filled" }, { step: "Recall strength updated", detail: "Retention estimate adjusted" }],
      usedWith: ["Flashcard Stack", "Spaced Review", "Confidence Check"],
      decisionSignals: ["Concept previously learned", "Recall effort strengthens memory", "No hints needed yet"],
    };
