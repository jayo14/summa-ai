import React, { useState, useEffect } from "react";
import { Database } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/StatusBadge";

export function IntegrationsView() {
  const integrations = [
    { name: "Paystack Payments", category: "Payments", desc: "Process local cards, bank transfers, and USSD payments.", status: "Operational", sync: "2 mins ago" },
    { name: "OpenAI GPT-4o API", category: "AI Services", desc: "Powers academic chat, reasoning, and synthesis engines.", status: "Operational", sync: "Active" },
    { name: "Supabase Postgres & Auth", category: "Infrastructure", desc: "Database persistence, Row Level Security, and JWT verification.", status: "Operational", sync: "Realtime" },
    { name: "Google Workspace OAuth", category: "Authentication", desc: "Allows institutional single-sign-on (SSO) for students.", status: "Operational", sync: "1 hour ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-dark dark:text-accent-lime bg-teal-dark dark:bg-accent-lime/10 px-2.5 py-1 rounded-md">
                  {item.category}
                </span>
                <StatusBadge status={item.status} />
              </div>
              <h3 className="font-bold text-base text-ink dark:text-cream-soft">{item.name}</h3>
              <p className="text-xs text-grey-green dark:text-[#8FA29B] leading-relaxed">{item.desc}</p>
            </div>

            <div className="pt-3 border-t border-mist-green dark:border-[#2A3838] flex items-center justify-between text-xs">
              <span className="text-grey-green dark:text-[#8FA29B] font-mono text-[11px]">Sync: {item.sync}</span>
              <button onClick={() => toast.info(`Configuring ${item.name}`)} className="px-3 py-1.5 rounded-xl border border-mist-green dark:border-[#2A3838] font-semibold text-ink dark:text-cream-soft hover:bg-cream-light dark:bg-[#232D2D] transition cursor-pointer">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 13. SETTINGS PAGE ---
