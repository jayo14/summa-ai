import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

export function RevenueView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard title="MRR" value="₦2,152,400" change="+24.8%" strokeColor="#10B981" />
        <MetricCard title="ARR" value="₦25,828,800" change="+24.8%" strokeColor="#8B5CF6" />
        <MetricCard title="Net Revenue (30d)" value="₦3,410,000" change="+19.2%" strokeColor="#10B981" />
        <MetricCard title="ARPU" value="₦7,742" change="+5.4%" strokeColor="#3B82F6" />
        <MetricCard title="Churn Rate" value="1.2%" change="-0.4%" strokeColor="#10B981" />
        <MetricCard title="LTV" value="₦185,000" change="+12.0%" strokeColor="#8B5CF6" />
      </div>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center border-b border-mist-green dark:border-[#2A3838] pb-4">
          <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Recent Revenue Transactions</h3>
          <button onClick={() => toast.success("Exporting transactions CSV...")} className="px-3.5 py-1.5 rounded-xl border border-mist-green dark:border-[#2A3838] text-xs font-semibold text-ink dark:text-cream-soft hover:bg-cream-light dark:bg-[#232D2D] transition flex items-center gap-1.5 cursor-pointer">
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-light dark:bg-[#121616] text-grey-green dark:text-[#8FA29B] border-b border-mist-green dark:border-[#2A3838] uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-4">TRANSACTION</th>
                <th className="p-4">CUSTOMER</th>
                <th className="p-4">INSTITUTION</th>
                <th className="p-4">AMOUNT</th>
                <th className="p-4">PROVIDER</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-medium">
              {[
                { id: "TXN-9012", name: "LASUSTECH Annual Renewal", inst: "LASUSTECH", amt: "₦250,000", prov: "Paystack", status: "Successful", date: "May 31, 2024" },
                { id: "TXN-9011", name: "Student Monthly Pro", inst: "University of Lagos", amt: "₦4,500", prov: "Paystack", status: "Successful", date: "May 31, 2024" },
                { id: "TXN-9010", name: "UI Enterprise Upgrade", inst: "University of Ibadan", amt: "₦180,000", prov: "Paystack", status: "Pending", date: "May 30, 2024" },
              ].map((t, idx) => (
                <tr key={idx} className="hover:bg-cream-light dark:bg-[#232D2D] transition">
                  <td className="p-4 font-mono font-bold text-ink dark:text-cream-soft">{t.id}</td>
                  <td className="p-4 text-ink dark:text-cream-soft">{t.name}</td>
                  <td className="p-4 text-grey-green dark:text-[#8FA29B]">{t.inst}</td>
                  <td className="p-4 font-mono font-bold text-ink dark:text-cream-soft">{t.amt}</td>
                  <td className="p-4 text-grey-green dark:text-[#8FA29B]">{t.prov}</td>
                  <td className="p-4"><StatusBadge status={t.status} /></td>
                  <td className="p-4 text-right text-grey-green dark:text-[#8FA29B] font-mono text-[11px]">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- 6. ENGAGEMENT PAGE ---
