import React, { useState, useEffect } from "react";
import { Database, Plus } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

export function ContentView() {
  const contentItems = [
    { title: "CSC 201: Object-Oriented Programming Notes", type: "Course", inst: "University of Lagos", author: "Dr. Vance", views: "14,210", status: "Published" },
    { title: "Data Structures & Algorithms Slide Deck", type: "Lecture", inst: "LASUSTECH", author: "Prof. Okoro", views: "9,840", status: "Published" },
    { title: "Database Systems Past Questions 2023", type: "Document", inst: "University of Ibadan", author: "Dr. Alabi", views: "18,400", status: "Published" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Content Objects" value="1,480" change="+12.4%" strokeColor="#8B5CF6" />
        <MetricCard title="Published Content" value="1,240" change="+8.1%" strokeColor="#10B981" />
        <MetricCard title="Total Views (30d)" value="342,000" change="+24.0%" strokeColor="#3B82F6" />
        <MetricCard title="Downloads" value="48,200" change="+15.2%" strokeColor="#10B981" />
      </div>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Academic Content Repository</h3>
          <button onClick={() => toast.info("Content upload modal opened.")} className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-dark dark:bg-accent-lime text-white hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition flex items-center gap-2 cursor-pointer">
            <Plus size={14} /> Upload Content
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-cream-light dark:bg-[#121616] text-grey-green dark:text-[#8FA29B] border-b border-mist-green dark:border-[#2A3838] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">CONTENT TITLE</th>
              <th className="p-4">TYPE</th>
              <th className="p-4">INSTITUTION</th>
              <th className="p-4">AUTHOR</th>
              <th className="p-4">VIEWS</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {contentItems.map((c, idx) => (
              <tr key={idx} className="hover:bg-cream-light dark:bg-[#232D2D] transition">
                <td className="p-4 font-bold text-ink dark:text-cream-soft">{c.title}</td>
                <td className="p-4 text-grey-green dark:text-[#8FA29B]">{c.type}</td>
                <td className="p-4 text-grey-green dark:text-[#8FA29B]">{c.inst}</td>
                <td className="p-4 text-grey-green dark:text-[#8FA29B]">{c.author}</td>
                <td className="p-4 font-mono text-ink dark:text-cream-soft">{c.views}</td>
                <td className="p-4"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 8. QUIZZES & RESULTS PAGE ---
