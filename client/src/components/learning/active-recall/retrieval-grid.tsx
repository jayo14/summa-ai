import React from "react";
import { ComponentMeta } from "../types";

export const retrieval_grid: ComponentMeta = {
      id: "retrieval_grid",
      title: "22. Retrieval Grid",
      category: "Active-Recall / Retention",
      desc: "Multi-concept matrix prompting recall across connected course topics.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2 shadow-2xs space-y-1">
          <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime block">Matrix Memory Check</span>
          <div className="grid grid-cols-2 gap-1 text-[8px]">
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded font-medium text-ink dark:text-cream-soft">Encapsulation</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded font-medium text-ink dark:text-cream-soft">Inheritance</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded font-medium text-ink dark:text-cream-soft">Polymorphism</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded font-medium text-ink dark:text-cream-soft">Abstraction</div>
          </div>
        </div>
      ),
      whatIsIt: "Multi-concept matrix prompting recall across connected course topics.",
      whySummaUsesIt: "Summa uses retrieval grids when multiple related concepts need simultaneous recall. This builds the connections between ideas and strengthens the network of knowledge.",
      techniques: ["Interleaved Practice", "Network Strengthening", "Cross-Topic Retrieval"],
      whenSummaUsesIt: ["Multiple related concepts need review", "Connections between topics matter", "Interleaved practice is appropriate", "The student needs to see the big picture"],
      example: "Matrix Memory Check: Encapsulation, Inheritance, Polymorphism, Abstraction. Recall all four OOP pillars in context.",
      whatHappensAfter: [{ step: "Grid presented", detail: "Multiple concepts shown simultaneously" }, { step: "Student recalls each", detail: "Individual concept recall assessed" }, { step: "Connections mapped", detail: "Which concepts link together" }, { step: "Network strength updated", detail: "Cross-concept associations recorded" }],
      usedWith: ["Retrieval Grid", "Matching", "Categorization"],
      decisionSignals: ["Multiple concepts need review", "Connections matter", "Interleaved practice appropriate"],
    };
