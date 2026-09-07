import React, { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

export function AuditLogsView() {
  const logs = [
    { time: "2026-09-04 16:25", actor: "alex@summa.ai", action: "ROLE_ELEVATED", target: "usr-prof-1", details: "Assigned Instructor role for CSC 201", status: "Successful" },
    { time: "2026-09-04 14:30", actor: "alex@summa.ai", action: "SYSTEM_POLICY_UPDATED", target: "SYSTEM", details: "Enabled Hybrid Memory Vector Indexing & Gemini API Rate Limits", status: "Successful" },
    { time: "2026-09-03 11:15", actor: "system@summa.ai", action: "DATABASE_BACKUP", target: "Postgres DB", details: "Completed nightly automated snapshot", status: "Successful" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Events (30d)" value="14,820" change="+8.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Admin Actions" value="1,240" change="+12" strokeColor="#10B981" />
        <MetricCard title="Security Events" value="85" change="-3" strokeColor="#10B981" />
        <MetricCard title="Failed Actions" value="4" change="0" strokeColor="#3B82F6" />
      </div>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-ink dark:text-cream-soft">System Activity & Audit Log Trail</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-light dark:bg-[#121616] text-grey-green dark:text-[#8FA29B] border-b border-mist-green dark:border-[#2A3838] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">TIMESTAMP</th>
              <th className="p-4">ACTOR</th>
              <th className="p-4">ACTION</th>
              <th className="p-4">TARGET / RESOURCE</th>
              <th className="p-4">DETAILS</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] font-mono">
            {logs.map((l, idx) => (
              <tr key={idx} className="hover:bg-cream-light dark:bg-[#232D2D] transition">
                <td className="p-4 text-grey-green dark:text-[#8FA29B] text-[11px]">{l.time}</td>
                <td className="p-4 font-bold text-ink dark:text-cream-soft">{l.actor}</td>
                <td className="p-4 font-bold text-teal-dark dark:text-accent-lime">{l.action}</td>
                <td className="p-4 text-ink dark:text-cream-soft">{l.target}</td>
                <td className="p-4 font-sans text-grey-green dark:text-[#8FA29B]">{l.details}</td>
                <td className="p-4 font-sans"><StatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 15. GLOBAL NOTIFICATIONS DRAWER ---
