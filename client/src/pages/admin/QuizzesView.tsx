import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

export function QuizzesView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Quizzes" value="420" change="+14.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Total Attempts" value="34,190" change="+21.0%" strokeColor="#3B82F6" />
        <MetricCard title="Average Score" value="78.4%" change="+2.1%" strokeColor="#10B981" />
        <MetricCard title="Pass Rate" value="84.2%" change="+1.5%" strokeColor="#10B981" />
      </div>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Recent Assessment Runs</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-light dark:bg-[#121616] text-grey-green dark:text-[#8FA29B] border-b border-mist-green dark:border-[#2A3838] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">QUIZ NAME</th>
              <th className="p-4">COURSE</th>
              <th className="p-4">ATTEMPTS</th>
              <th className="p-4">AVG SCORE</th>
              <th className="p-4">PASS RATE</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {[
              { name: "Calculus & Derivatives Checkpoint", course: "MAT 101", att: "1,420", score: "82.4%", pass: "89.1%", status: "Active" },
              { name: "Object-Oriented Design Principles", course: "CSC 201", att: "2,150", score: "76.0%", pass: "81.4%", status: "Active" },
            ].map((q, idx) => (
              <tr key={idx} className="hover:bg-cream-light dark:bg-[#232D2D] transition">
                <td className="p-4 font-bold text-ink dark:text-cream-soft">{q.name}</td>
                <td className="p-4 text-grey-green dark:text-[#8FA29B]">{q.course}</td>
                <td className="p-4 font-mono text-ink dark:text-cream-soft">{q.att}</td>
                <td className="p-4 font-mono font-bold text-ink dark:text-cream-soft">{q.score}</td>
                <td className="p-4 font-mono font-bold text-teal-dark dark:text-accent-lime">{q.pass}</td>
                <td className="p-4"><StatusBadge status={q.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 9. LIVE SESSIONS PAGE ---
