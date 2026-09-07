import React from "react";
import { ComponentMeta } from "../types";

export const past_question: ComponentMeta = {
      id: "past_question",
      title: "37. Past Question Analysis",
      category: "Exam Components",
      desc: "Analyzes past exam patterns to identify frequently tested topics.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Past Questions (5 years)</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-grey-green dark:text-[#8FA29B]">Trees & Graphs</span>
              <span className="font-bold text-ink dark:text-cream-soft">Every year</span>
            </div>
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-grey-green dark:text-[#8FA29B]">Memory Management</span>
              <span className="font-bold text-ink dark:text-cream-soft">4/5 years</span>
            </div>
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-grey-green dark:text-[#8FA29B]">B-Trees</span>
              <span className="font-bold text-ink dark:text-cream-soft">3/5 years</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Analyzes past exam patterns to identify frequently tested topics.",
      whySummaUsesIt: "Summa uses past question analysis to focus study on what is most likely to appear on the exam. Pattern analysis reveals what the examiner actually tests.",
      techniques: ["Pattern Analysis", "Exam Prediction", "Strategic Study"],
      whenSummaUsesIt: ["Past exam papers are available", "The student wants to know what to focus on", "Exam patterns can be identified", "Strategic preparation is valuable"],
      example: "Past Questions (5 years): Trees and Graphs every year. Memory Management 4 of 5 years. B-Trees 3 of 5 years.",
      whatHappensAfter: [{ step: "Patterns analyzed", detail: "Frequently tested topics identified" }, { step: "Focus areas recommended", detail: "Study prioritized by exam frequency" }, { step: "Practice aligned", detail: "Practice questions matched to exam patterns" }, { step: "Confidence built", detail: "Student knows what to expect" }],
      usedWith: ["Predicted Practice", "Exam Readiness", "Topic Coverage"],
      decisionSignals: ["Past papers available", "Pattern analysis valuable", "Strategic study helps"],
    };
