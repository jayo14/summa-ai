import React from "react";
import { ArrowRight, Bell, Building, CheckCircle, FileText, Info } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";

// MRR bar data
const mrrBars = [
  { newMRR: 40, expansionMRR: 60 },
  { newMRR: 45, expansionMRR: 55 },
  { newMRR: 30, expansionMRR: 45 },
  { newMRR: 55, expansionMRR: 65 },
  { newMRR: 40, expansionMRR: 50 },
  { newMRR: 60, expansionMRR: 75 },
  { newMRR: 35, expansionMRR: 50 },
  { newMRR: 65, expansionMRR: 80 },
  { newMRR: 50, expansionMRR: 60 },
  { newMRR: 55, expansionMRR: 70 },
  { newMRR: 70, expansionMRR: 85 },
  { newMRR: 45, expansionMRR: 60 },
  { newMRR: 50, expansionMRR: 65 },
  { newMRR: 60, expansionMRR: 75 },
  { newMRR: 40, expansionMRR: 55 },
  { newMRR: 50, expansionMRR: 65 },
  { newMRR: 35, expansionMRR: 50 },
  { newMRR: 45, expansionMRR: 60 },
  { newMRR: 40, expansionMRR: 55 },
  { newMRR: 55, expansionMRR: 70 },
  { newMRR: 65, expansionMRR: 85 },
  { newMRR: 50, expansionMRR: 65 },
  { newMRR: 45, expansionMRR: 60 },
  { newMRR: 55, expansionMRR: 75 },
  { newMRR: 40, expansionMRR: 55 },
  { newMRR: 60, expansionMRR: 75 },
  { newMRR: 70, expansionMRR: 85 },
  { newMRR: 50, expansionMRR: 65 },
  { newMRR: 65, expansionMRR: 80 },
  { newMRR: 55, expansionMRR: 70 },
];

export function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* 6 TOP METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* 1. Total Users */}
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-grey-green dark:text-[#8FA29B] font-medium">
            <span>Total Users</span>
            <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-ink dark:text-cream-soft">12,241</span>
            <span className="text-[11px] font-semibold text-teal-dark dark:text-accent-lime">+18.6%</span>
          </div>
          <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">vs Apr 1 – Apr 30</div>
          <svg className="w-full h-7 stroke-teal-dark dark:stroke-accent-lime fill-none" viewBox="0 0 100 25">
            <path d="M0,20 Q20,10 40,22 T80,12 T100,6" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        {/* 2. Active Users */}
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-grey-green dark:text-[#8FA29B] font-medium">
            <span>Active Users (30d)</span>
            <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-ink dark:text-cream-soft">8,632</span>
            <span className="text-[11px] font-semibold text-teal-dark dark:text-accent-lime">+21.3%</span>
          </div>
          <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">vs Apr 1 – Apr 30</div>
          <svg className="w-full h-7 stroke-teal-dark dark:stroke-accent-lime fill-none" viewBox="0 0 100 25">
            <path d="M0,22 Q25,15 50,18 T80,10 T100,4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        {/* 3. Institutions */}
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-grey-green dark:text-[#8FA29B] font-medium">
            <span>Institutions</span>
            <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-ink dark:text-cream-soft">34</span>
            <span className="text-[11px] font-semibold text-teal-dark dark:text-accent-lime">+13.3%</span>
          </div>
          <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">vs Apr 1 – Apr 30</div>
          <svg className="w-full h-7 stroke-teal-dark dark:stroke-accent-lime fill-none" viewBox="0 0 100 25">
            <path d="M0,18 Q20,12 40,20 T80,10 T100,3" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        {/* 4. Monthly Recurring Revenue */}
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-grey-green dark:text-[#8FA29B] font-medium">
            <span>Monthly Recurring Revenue</span>
            <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-ink dark:text-cream-soft">₦2,152,400</span>
            <span className="text-[11px] font-semibold text-teal-dark dark:text-accent-lime">+24.8%</span>
          </div>
          <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">vs Apr 1 – Apr 30</div>
          <svg className="w-full h-7 stroke-teal-dark dark:stroke-accent-lime fill-none" viewBox="0 0 100 25">
            <path d="M0,20 Q25,12 50,18 T80,10 T100,4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        {/* 5. Paid Subscriptions */}
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-grey-green dark:text-[#8FA29B] font-medium">
            <span>Paid Subscriptions</span>
            <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-ink dark:text-cream-soft">278</span>
            <span className="text-[11px] font-semibold text-teal-dark dark:text-accent-lime">+17.2%</span>
          </div>
          <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">vs Apr 1 – Apr 30</div>
          <svg className="w-full h-7 stroke-teal-dark dark:stroke-accent-lime fill-none" viewBox="0 0 100 25">
            <path d="M0,22 Q20,16 40,20 T80,12 T100,8" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        {/* 6. Avg. Daily Sessions */}
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-grey-green dark:text-[#8FA29B] font-medium">
            <span>Avg. Daily Sessions</span>
            <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-ink dark:text-cream-soft">3,126</span>
            <span className="text-[11px] font-semibold text-teal-dark dark:text-accent-lime">+15.1%</span>
          </div>
          <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">vs Apr 1 – Apr 30</div>
          <svg className="w-full h-7 stroke-teal-dark dark:stroke-accent-lime fill-none" viewBox="0 0 100 25">
            <path d="M0,16 Q20,12 40,18 T80,10 T100,5" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MRR Overview */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-ink dark:text-cream-soft font-bold">
                <span>MRR Overview</span>
                <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-ink dark:text-cream-soft">₦2,152,400</span>
                <span className="text-xs font-semibold text-teal-dark dark:text-accent-lime">+24.8%</span>
                <span className="text-[11px] text-grey-green dark:text-[#8FA29B]">vs Apr 1 – Apr 30</span>
              </div>
            </div>
          </div>

          {/* Stacked Bars Chart */}
          <div className="flex gap-2 py-4">
            <div className="flex flex-col justify-between text-[10px] text-grey-green dark:text-[#8FA29B] font-mono py-1 pr-2">
              <span>₦2.5M</span>
              <span>₦2M</span>
              <span>₦1.5M</span>
              <span>₦1M</span>
              <span>₦0.5M</span>
              <span>₦0</span>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-44 flex items-end justify-between gap-1 px-1">
                {mrrBars.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                    <div className="w-full bg-teal-dark dark:bg-accent-lime rounded-t-xs" style={{ height: `${b.newMRR}%` }} />
                    <div className="w-full bg-teal-dark dark:bg-accent-lime rounded-b-xs" style={{ height: `${b.expansionMRR}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-grey-green dark:text-[#8FA29B] font-mono pt-1">
                <span>May 1</span>
                <span>May 6</span>
                <span>May 11</span>
                <span>May 16</span>
                <span>May 21</span>
                <span>May 26</span>
                <span>May 31</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-mist-green/50 dark:border-[#2A3838] flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-grey-green dark:text-[#8FA29B] text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime" /> New MRR
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime" /> Expansion MRR
              </span>
            </div>
          </div>
        </div>

        {/* Users Breakdown */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-ink dark:text-cream-soft">
            <span>Users Breakdown</span>
            <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
          </div>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative size-44 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="3.8" />
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#8B5CF6" strokeWidth="3.8" strokeDasharray="77.7 22.3" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="3.8" strokeDasharray="14.9 85.1" strokeDashoffset="-77.7" />
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="3.8" strokeDasharray="3.1 96.9" strokeDashoffset="-92.6" />
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="3.8" strokeDasharray="4.3 95.7" strokeDashoffset="-95.7" />
              </svg>
              <div className="absolute text-center">
                <div className="text-xl font-bold text-ink dark:text-cream-soft font-mono">12,241</div>
                <div className="text-[11px] text-grey-green dark:text-[#8FA29B]">Total Users</div>
              </div>
            </div>
            <div className="w-full space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-grey-green dark:text-[#8FA29B]">
                  <span className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime" /> Students
                </span>
                <span className="text-ink dark:text-cream-soft font-mono font-semibold">9,512 (77.7%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-grey-green dark:text-[#8FA29B]">
                  <span className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime" /> Lecturers
                </span>
                <span className="text-ink dark:text-cream-soft font-mono font-semibold">1,824 (14.9%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-grey-green dark:text-[#8FA29B]">
                  <span className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime" /> Admins
                </span>
                <span className="text-ink dark:text-cream-soft font-mono font-semibold">378 (3.1%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-grey-green dark:text-[#8FA29B]">
                  <span className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime" /> Others
                </span>
                <span className="text-ink dark:text-cream-soft font-mono font-semibold">527 (4.3%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live System Status */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-ink dark:text-cream-soft">
            <span>Live System</span>
            <Info size={13} className="text-grey-green dark:text-[#8FA29B]" />
          </div>
          <div className="space-y-4 py-1 text-xs">
            {[
              { name: "AI Chat", status: "Operational" },
              { name: "Quiz Engine", status: "Operational" },
              { name: "Live Classes", status: "Operational" },
              { name: "File Processing", status: "Operational" },
              { name: "Embeddings", status: "Operational" },
              { name: "Notifications", status: "Operational" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink dark:text-cream-soft font-medium">
                  <CheckCircle size={15} className="text-teal-dark dark:text-accent-lime" />
                  <span>{item.name}</span>
                </span>
                <span className="text-teal-dark dark:text-accent-lime font-semibold text-[11px]">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Institutions */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-mist-green/50 dark:border-[#2A3838]">
            <span className="font-bold text-xs text-ink dark:text-cream-soft">Top Institutions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-grey-green dark:text-[#8FA29B] border-b border-mist-green/50 dark:border-[#2A3838] text-[10px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3">INSTITUTION</th>
                  <th className="pb-3">USERS</th>
                  <th className="pb-3">ACTIVE (30D)</th>
                  <th className="pb-3">SUBSCRIPTION</th>
                  <th className="pb-3 text-right">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { name: "University of Lagos", users: "2,341", active: "1,842", sub: "Enterprise", mrr: "₦420,000" },
                  { name: "LASUSTECH", users: "1,832", active: "1,425", sub: "Pro", mrr: "₦250,000" },
                  { name: "University of Ibadan", users: "1,201", active: "978", sub: "Pro", mrr: "₦180,000" },
                  { name: "Babcock University", users: "987", active: "754", sub: "Pro", mrr: "₦150,000" },
                  { name: "Covenant University", users: "842", active: "623", sub: "Basic", mrr: "₦72,000" },
                ].map((inst, i) => (
                  <tr key={i} className="hover:bg-cream-light dark:bg-[#232D2D] transition">
                    <td className="py-3 font-semibold text-ink dark:text-cream-soft">{inst.name}</td>
                    <td className="py-3 text-grey-green dark:text-[#8FA29B] font-mono">{inst.users}</td>
                    <td className="py-3 text-grey-green dark:text-[#8FA29B] font-mono">{inst.active}</td>
                    <td className="py-3 text-ink dark:text-cream-soft">{inst.sub}</td>
                    <td className="py-3 text-right font-mono font-semibold text-ink dark:text-cream-soft">{inst.mrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-mist-green/50 dark:border-[#2A3838]">
            <span className="font-bold text-xs text-ink dark:text-cream-soft">Recent Activity</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-grey-green dark:text-[#8FA29B] border-b border-mist-green/50 dark:border-[#2A3838] text-[10px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3">EVENT</th>
                  <th className="pb-3">DETAILS</th>
                  <th className="pb-3 text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { event: "New user registered", details: "john.doe@student.unilag.edu.ng", time: "2m ago" },
                  { event: "Subscription created", details: "LASUSTECH – Pro Plan", time: "15m ago" },
                  { event: "Payment received", details: "₦250,000 from LASUSTECH", time: "18m ago" },
                  { event: "Quiz completed", details: "Calculus Basics – 92%", time: "25m ago" },
                  { event: "Live class started", details: "Operating Systems Lecture", time: "32m ago" },
                ].map((act, i) => (
                  <tr key={i} className="hover:bg-cream-light dark:bg-[#232D2D] transition">
                    <td className="py-3 text-ink dark:text-cream-soft font-semibold">{act.event}</td>
                    <td className="py-3 text-grey-green dark:text-[#8FA29B] truncate max-w-[160px]">{act.details}</td>
                    <td className="py-3 text-right text-grey-green dark:text-[#8FA29B] font-mono text-[11px]">{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-mist-green/50 dark:border-[#2A3838]">
            <span className="font-bold text-xs text-ink dark:text-cream-soft">Quick Actions</span>
          </div>
          <div className="space-y-2 py-1 text-xs font-semibold text-ink dark:text-cream-soft">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream-light dark:bg-[#232D2D] transition border border-transparent hover:border-[#E2E8F0] text-left">
              <Building size={16} className="text-grey-green dark:text-[#8FA29B]" />
              <span>Add Institution</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream-light dark:bg-[#232D2D] transition border border-transparent hover:border-[#E2E8F0] text-left">
              <Bell size={16} className="text-grey-green dark:text-[#8FA29B]" />
              <span>Create Announcement</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream-light dark:bg-[#232D2D] transition border border-transparent hover:border-[#E2E8F0] text-left">
              <FileText size={16} className="text-grey-green dark:text-[#8FA29B]" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
