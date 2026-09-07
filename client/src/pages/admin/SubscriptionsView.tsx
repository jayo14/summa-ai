import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";

export function SubscriptionsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Subscriptions" value="278" change="+17.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Trial Conversions" value="28.4%" change="+4.1%" strokeColor="#10B981" />
        <MetricCard title="Upgrades (30d)" value="18" change="+3" strokeColor="#3B82F6" />
        <MetricCard title="Churn Rate" value="1.2%" change="-0.4%" strokeColor="#10B981" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "Enterprise Plan", price: "₦1,250,000", period: "/ month", subs: "8 Institutions", mrr: "₦1,000,000" },
          { name: "Pro Plan", price: "₦45,000", period: "/ student / yr", subs: "184 Students", mrr: "₦690,000" },
          { name: "Basic Plan", price: "₦15,000", period: "/ student / yr", subs: "86 Students", mrr: "₦462,400" },
        ].map((plan, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-3 shadow-2xs">
            <div className="text-xs font-semibold text-grey-green dark:text-[#8FA29B]">{plan.name}</div>
            <div className="text-xl font-bold text-ink dark:text-cream-soft">{plan.price} <span className="text-xs text-grey-green dark:text-[#8FA29B] font-normal">{plan.period}</span></div>
            <div className="pt-2 border-t border-mist-green dark:border-[#2A3838] flex justify-between text-xs">
              <span className="text-grey-green dark:text-[#8FA29B]">Subscribers:</span>
              <span className="font-bold text-ink dark:text-cream-soft">{plan.subs}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-grey-green dark:text-[#8FA29B]">Monthly Revenue:</span>
              <span className="font-bold font-mono text-teal-dark dark:text-accent-lime">{plan.mrr}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 5. REVENUE PAGE ---
