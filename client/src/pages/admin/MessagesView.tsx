import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";

export function MessagesView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Messages Sent (30d)" value="14,280" change="+19.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Delivery Rate" value="99.4%" change="+0.2%" strokeColor="#10B981" />
        <MetricCard title="Read Rate" value="82.9%" change="+3.1%" strokeColor="#3B82F6" />
        <MetricCard title="Failed Messages" value="90" change="-12" strokeColor="#10B981" />
      </div>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Broadcast & Announcement Center</h3>
          <button onClick={() => toast.info("Composer opened.")} className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-dark dark:bg-accent-lime text-white hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition flex items-center gap-2 cursor-pointer">
            <Send size={14} /> Compose Message
          </button>
        </div>

        <div className="p-4 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-xs text-grey-green dark:text-[#8FA29B]">
          Select target audience (All Institutions, Specific Students, or Lecturers) to send push announcements.
        </div>
      </div>
    </div>
  );
}

// --- 11. FEEDBACK PAGE ---
