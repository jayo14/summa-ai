import React, { useState, useEffect } from "react";
import { User, Users } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";

export function EngagementView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="User Retention (30d)" value="68.4%" change="+5.1%" strokeColor="#10B981" />
        <MetricCard title="Avg Session Duration" value="24.5m" change="+2.4m" strokeColor="#8B5CF6" />
        <MetricCard title="AI Conversations" value="42,100" change="+18.9%" strokeColor="#3B82F6" />
        <MetricCard title="Quiz Completion Rate" value="84.2%" change="+3.0%" strokeColor="#10B981" />
      </div>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Student Activation & Conversion Funnel</h3>
        <div className="space-y-3 pt-2">
          {[
            { step: "Registered Users", count: "12,241", pct: "100%" },
            { step: "Activated Account", count: "10,480", pct: "85.6%" },
            { step: "First AI Session", count: "9,210", pct: "75.2%" },
            { step: "Completed Quiz", count: "8,410", pct: "68.7%" },
            { step: "Active Subscriber", count: "2,780", pct: "22.7%" },
          ].map((f, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-ink dark:text-cream-soft">{f.step}</span>
                <span className="font-mono text-grey-green dark:text-[#8FA29B]">{f.count} ({f.pct})</span>
              </div>
              <div className="w-full h-3 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-teal-dark dark:bg-accent-lime" style={{ width: f.pct }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 7. CONTENT PAGE ---
