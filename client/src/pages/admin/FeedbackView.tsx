import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

export function FeedbackView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Feedback" value="640" change="+8.4%" strokeColor="#8B5CF6" />
        <MetricCard title="Average Rating" value="4.8 / 5.0" change="+0.1" strokeColor="#10B981" />
        <MetricCard title="Open Bug Reports" value="12" change="-4" strokeColor="#10B981" />
        <MetricCard title="Feature Requests" value="118" change="+14" strokeColor="#3B82F6" />
      </div>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-ink dark:text-cream-soft">User Satisfaction & Reports</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-light dark:bg-[#121616] text-grey-green dark:text-[#8FA29B] border-b border-mist-green dark:border-[#2A3838] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">USER</th>
              <th className="p-4">TYPE</th>
              <th className="p-4">RATING</th>
              <th className="p-4">MESSAGE</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {[
              { user: "Amina Bello", type: "Feature Request", rating: "5 ★", msg: "Would love dark mode export for flashcard sets!", status: "Open" },
              { user: "John Doe", type: "Bug Report", rating: "4 ★", msg: "Quiz timer paused on tab switch.", status: "In Review" },
            ].map((f, idx) => (
              <tr key={idx} className="hover:bg-cream-light dark:bg-[#232D2D] transition">
                <td className="p-4 font-bold text-ink dark:text-cream-soft">{f.user}</td>
                <td className="p-4 text-grey-green dark:text-[#8FA29B]">{f.type}</td>
                <td className="p-4 font-bold text-amber-500">{f.rating}</td>
                <td className="p-4 text-ink dark:text-cream-soft">{f.msg}</td>
                <td className="p-4"><StatusBadge status={f.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 12. INTEGRATIONS PAGE ---
