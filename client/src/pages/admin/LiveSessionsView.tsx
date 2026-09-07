import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

export function LiveSessionsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Live Sessions Now" value="3" change="Active" strokeColor="#10B981" />
        <MetricCard title="Sessions Today" value="14" change="+4" strokeColor="#3B82F6" />
        <MetricCard title="Total Participants Today" value="1,840" change="+18.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Avg Attendance Rate" value="88.5%" change="+3.2%" strokeColor="#10B981" />
      </div>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Live Broadcast Monitor</h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime text-xs font-semibold border border-teal-dark/30 dark:border-accent-lime/30">
            <span className="size-2 rounded-full bg-teal-dark/10 dark:bg-accent-lime animate-ping" />
            3 Streams Streaming Live
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-cream-light dark:bg-[#121616] text-grey-green dark:text-[#8FA29B] border-b border-mist-green dark:border-[#2A3838] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">SESSION TITLE</th>
              <th className="p-4">HOST / LECTURER</th>
              <th className="p-4">INSTITUTION</th>
              <th className="p-4">PARTICIPANTS</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {[
              { title: "CSC 201: Dynamic Dispatch Review", host: "Dr. Marcus Vance", inst: "University of Lagos", parts: "248 live", status: "Live" },
              { title: "PHY 102: Electromagnetic Waves", host: "Prof. Kenneth Okoro", inst: "University of Ibadan", parts: "182 live", status: "Live" },
              { title: "MAT 204: Linear Algebra Q&A", host: "Dr. Sarah Alabi", inst: "LASUSTECH", parts: "94 live", status: "Live" },
            ].map((s, idx) => (
              <tr key={idx} className="hover:bg-cream-light dark:bg-[#232D2D] transition">
                <td className="p-4 font-bold text-ink dark:text-cream-soft">{s.title}</td>
                <td className="p-4 text-grey-green dark:text-[#8FA29B]">{s.host}</td>
                <td className="p-4 text-grey-green dark:text-[#8FA29B]">{s.inst}</td>
                <td className="p-4 font-mono font-bold text-teal-dark dark:text-accent-lime">{s.parts}</td>
                <td className="p-4"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 10. MESSAGES PAGE ---
