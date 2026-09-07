import React from "react";
import { ComponentMeta } from "../types";

export const source_card: ComponentMeta = {
      id: "source_card",
      title: "42. Source / Provenance Card",
      category: "Resource Components",
      desc: "Shows where Summa's teaching content originates — uploaded material or web source.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Source</div>
          <div className="p-2 bg-cream-light dark:bg-[#232D2D] rounded-lg space-y-1">
            <div className="text-[8px] font-semibold text-ink dark:text-cream-soft">CSC 201 Lecture Notes — Week 8</div>
            <div className="text-[7px] text-grey-green dark:text-[#8FA29B]">Uploaded by: Prof. Adebayo</div>
            <div className="text-[7px] text-teal-dark dark:text-accent-lime">Page 14-16 · Binary Tree Properties</div>
          </div>
          <div className="text-[7px] text-grey-green dark:text-[#8FA29B] italic">Verified from uploaded material</div>
        </div>
      ),
      whatIsIt: "Shows where Summa's teaching content originates, uploaded material or web source.",
      whySummaUsesIt: "Summa uses source cards to maintain transparency about where information comes from. Students deserve to know the provenance of what they are learning.",
      techniques: ["Source Transparency", "Provenance Tracking", "Trust Building"],
      whenSummaUsesIt: ["Summa is teaching from uploaded materials", "The source of information matters", "Transparency builds trust", "The student wants to verify or explore further"],
      example: "Source: CSC 201 Lecture Notes, Week 8. Uploaded by: Prof. Adebayo. Page 14-16: Binary Tree Properties.",
      whatHappensAfter: [{ step: "Source displayed", detail: "Origin of teaching content shown" }, { step: "Student verifies", detail: "Can check the original material" }, { step: "Trust maintained", detail: "Transparency reinforces credibility" }, { step: "Source accessed", detail: "Student can explore the original material" }],
      usedWith: ["Citation Drawer", "Resource Card", "Recommended Resource"],
      decisionSignals: ["Source matters", "Transparency needed", "Student wants to verify"],
    };
