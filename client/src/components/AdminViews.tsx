import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Bell,
  Building,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Database,
  Download,
  FileText,
  Filter,
  Folder,
  Globe,
  HelpCircle,
  Info,
  Key,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  User,
  Users,
  UserX,
  X,
  Zap,
} from "lucide-react";
import { UserRole, UserStatus } from "@/types/roles";

// --- REUSABLE UI BADGES & COMPONENTS ---

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let bg = "bg-slate-100 text-slate-700";
  let dot = "bg-slate-500";

  if (["active", "published", "completed", "operational", "successful", "paid", "delivered"].includes(s)) {
    bg = "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    dot = "bg-emerald-500";
  } else if (["pending", "processing", "scheduled", "trial", "draft"].includes(s)) {
    bg = "bg-amber-50 text-amber-700 border border-amber-200/60";
    dot = "bg-amber-500";
  } else if (["suspended", "inactive", "failed", "degraded", "cancelled", "unread"].includes(s)) {
    bg = "bg-rose-50 text-rose-700 border border-rose-200/60";
    dot = "bg-rose-500";
  } else if (["live", "pro", "enterprise"].includes(s)) {
    bg = "bg-indigo-50 text-indigo-700 border border-indigo-200/60";
    dot = "bg-indigo-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${bg}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  comparison = "vs Apr 1 – Apr 30",
  strokeColor = "#8B5CF6",
}: {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  comparison?: string;
  strokeColor?: string;
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 shadow-2xs">
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>{title}</span>
        <Info size={13} className="text-slate-400" />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold text-slate-900">{value}</span>
        {change && (
          <span className={`text-[11px] font-semibold ${isPositive ? "text-[#10B981]" : "text-rose-500"}`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-[10px] text-slate-400">{comparison}</div>
      <svg className="w-full h-7 fill-none" viewBox="0 0 100 25" style={{ stroke: strokeColor }}>
        <path d="M0,20 Q20,10 40,22 T80,12 T100,6" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// --- 1. USERS SUB-PAGE ---
export function UsersView({ onUserClick }: { onUserClick: (user: any) => void }) {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const sampleUsers = [
    { id: "u-1", name: "John Doe", email: "john.doe@unilag.edu.ng", role: "Student", institution: "University of Lagos", status: "Active", joined: "May 12, 2024", sessions: 42, sub: "Pro" },
    { id: "u-2", name: "Dr. Sarah Alabi", email: "s.alabi@lasustech.edu.ng", role: "Lecturer", institution: "LASUSTECH", status: "Active", joined: "Apr 04, 2024", sessions: 128, sub: "Enterprise" },
    { id: "u-3", name: "Prof. Kenneth Okoro", email: "k.okoro@ui.edu.ng", role: "Lecturer", institution: "University of Ibadan", status: "Active", joined: "Mar 18, 2024", sessions: 96, sub: "Pro" },
    { id: "u-4", name: "Amina Bello", email: "a.bello@student.babcock.edu.ng", role: "Student", institution: "Babcock University", status: "Pending", joined: "May 28, 2024", sessions: 3, sub: "Basic" },
    { id: "u-5", name: "David Adeleke", email: "david@covenant.edu.ng", role: "Admin", institution: "Covenant University", status: "Active", joined: "Jan 15, 2024", sessions: 310, sub: "Enterprise" },
    { id: "u-6", name: "Chidi Nnamdi", email: "chidi.n@student.unilag.edu.ng", role: "Student", institution: "University of Lagos", status: "Suspended", joined: "Feb 20, 2024", sessions: 19, sub: "Basic" },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Users" value="12,241" change="+18.6%" strokeColor="#8B5CF6" />
        <MetricCard title="Active Users" value="8,632" change="+21.3%" strokeColor="#10B981" />
        <MetricCard title="New Users (30d)" value="1,420" change="+14.2%" strokeColor="#3B82F6" />
        <MetricCard title="Students" value="9,512" change="+19.1%" strokeColor="#8B5CF6" />
        <MetricCard title="Lecturers" value="1,824" change="+11.5%" strokeColor="#10B981" />
        <MetricCard title="Administrators" value="378" change="+4.0%" strokeColor="#F59E0B" />
      </div>

      {/* Controls & Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, email, or institution..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-[#E2E8F0] text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="Student">Students</option>
              <option value="Lecturer">Lecturers</option>
              <option value="Admin">Admins</option>
            </select>

            <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition flex items-center gap-2 shadow-2xs">
              <Plus size={14} /> Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 border-b border-[#E2E8F0] uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-4">USER</th>
                <th className="p-4">ROLE</th>
                <th className="p-4">INSTITUTION</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">SESSIONS</th>
                <th className="p-4">SUBSCRIPTION</th>
                <th className="p-4">JOINED</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {sampleUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => onUserClick(u)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-[#6366F1]/10 text-[#4F46E5] font-bold text-xs flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{u.role}</td>
                  <td className="p-4 text-slate-600">{u.institution}</td>
                  <td className="p-4"><StatusBadge status={u.status} /></td>
                  <td className="p-4 font-mono text-slate-700">{u.sessions}</td>
                  <td className="p-4 font-medium text-slate-900">{u.sub}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{u.joined}</td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- USER DETAILS DRAWER ---
export function UserDrawer({ user, onClose }: { user: any; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "activity" | "learning" | "billing">("overview");

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#6366F1] text-white font-bold text-sm flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{user.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50">
              <X size={18} />
            </button>
          </div>

          {/* Drawer Tabs */}
          <div className="flex border-b border-[#E2E8F0] px-6 text-xs font-semibold text-slate-500">
            {(["overview", "activity", "learning", "billing"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 px-3 capitalize border-b-2 transition ${
                  tab === t ? "border-[#6366F1] text-[#4F46E5]" : "border-transparent hover:text-slate-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 text-xs">
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                    <div className="text-[10px] text-slate-400">Role</div>
                    <div className="font-bold text-slate-900 mt-0.5">{user.role}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                    <div className="text-[10px] text-slate-400">Status</div>
                    <div className="mt-1"><StatusBadge status={user.status} /></div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                    <div className="text-[10px] text-slate-400">Institution</div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">{user.institution}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                    <div className="text-[10px] text-slate-400">Subscription</div>
                    <div className="font-bold text-slate-900 mt-0.5">{user.sub}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="font-bold text-slate-900">Learning Summary</div>
                  <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Sessions</span>
                      <span className="font-mono font-bold text-slate-900">{user.sessions}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Quizzes Attempted</span>
                      <span className="font-mono font-bold text-slate-900">28</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Average Score</span>
                      <span className="font-mono font-bold text-emerald-600">88.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "activity" && (
              <div className="space-y-3">
                {[
                  { title: "Completed Quiz: Calculus Basics", time: "2 hours ago" },
                  { title: "Started Live Session: AI Ethics", time: "1 day ago" },
                  { title: "Uploaded Material: Physics_Notes.pdf", time: "3 days ago" },
                ].map((act, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-0.5">
                    <div className="font-semibold text-slate-900">{act.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{act.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-[#E2E8F0] bg-[#F8FAFC] flex gap-3">
          <button className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-semibold text-xs hover:bg-rose-50 transition">
            Suspend Account
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-[#6366F1] text-white font-semibold text-xs hover:bg-[#4F46E5] transition">
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. INSTITUTIONS SUB-PAGE ---
export function InstitutionsView() {
  const insts = [
    { name: "University of Lagos", type: "Federal", users: "2,341", active: "1,842", plan: "Enterprise", mrr: "₦420,000", status: "Active" },
    { name: "LASUSTECH", type: "State", users: "1,832", active: "1,425", plan: "Pro", mrr: "₦250,000", status: "Active" },
    { name: "University of Ibadan", type: "Federal", users: "1,201", active: "978", plan: "Pro", mrr: "₦180,000", status: "Active" },
    { name: "Babcock University", type: "Private", users: "987", active: "754", plan: "Pro", mrr: "₦150,000", status: "Active" },
    { name: "Covenant University", type: "Private", users: "842", active: "623", plan: "Basic", mrr: "₦72,000", status: "Trial" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Institutions" value="34" change="+13.3%" strokeColor="#3B82F6" />
        <MetricCard title="Active Institutions" value="31" change="+10.0%" strokeColor="#10B981" />
        <MetricCard title="Enterprise Institutions" value="8" change="+25.0%" strokeColor="#8B5CF6" />
        <MetricCard title="Institution Users" value="7,203" change="+18.4%" strokeColor="#3B82F6" />
        <MetricCard title="Institution MRR" value="₦1,072,000" change="+22.1%" strokeColor="#10B981" />
        <MetricCard title="Pending Trials" value="3" change="-1" isPositive={false} strokeColor="#F59E0B" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Registered Institutions</h3>
          <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition flex items-center gap-2 shadow-2xs">
            <Plus size={14} /> Add Institution
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 border-b border-[#E2E8F0] uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-4">INSTITUTION</th>
                <th className="p-4">TYPE</th>
                <th className="p-4">TOTAL USERS</th>
                <th className="p-4">ACTIVE (30D)</th>
                <th className="p-4">PLAN</th>
                <th className="p-4">MRR</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {insts.map((i, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition cursor-pointer">
                  <td className="p-4 font-bold text-slate-900">{i.name}</td>
                  <td className="p-4 text-slate-600">{i.type}</td>
                  <td className="p-4 font-mono text-slate-700">{i.users}</td>
                  <td className="p-4 font-mono text-slate-700">{i.active}</td>
                  <td className="p-4 font-semibold text-slate-900">{i.plan}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">{i.mrr}</td>
                  <td className="p-4"><StatusBadge status={i.status} /></td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- 3. REVENUE SUB-PAGE ---
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

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4">
          <h3 className="font-bold text-sm text-slate-900">Recent Revenue Transactions</h3>
          <button className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5">
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 border-b border-[#E2E8F0] uppercase text-[10px] font-semibold tracking-wider">
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
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-slate-900">{t.id}</td>
                  <td className="p-4 text-slate-800">{t.name}</td>
                  <td className="p-4 text-slate-600">{t.inst}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">{t.amt}</td>
                  <td className="p-4 text-slate-600">{t.prov}</td>
                  <td className="p-4"><StatusBadge status={t.status} /></td>
                  <td className="p-4 text-right text-slate-400 font-mono text-[11px]">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- 4. INTEGRATIONS SUB-PAGE ---
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
          <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366F1] bg-[#6366F1]/10 px-2.5 py-1 rounded-md">
                  {item.category}
                </span>
                <StatusBadge status={item.status} />
              </div>
              <h3 className="font-bold text-base text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Sync: {item.sync}</span>
              <button className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] font-semibold text-slate-700 hover:bg-slate-50 transition">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 5. SETTINGS SUB-PAGE ---
export function SettingsView() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-3xl space-y-6 shadow-2xs text-xs">
      <div className="border-b border-[#E2E8F0] pb-4 space-y-1">
        <h3 className="font-bold text-base text-slate-900">Platform Settings</h3>
        <p className="text-slate-400">Configure global Summa AI admin behavior and environment flags.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700">Platform Name</label>
          <input type="text" defaultValue="Summa AI" className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none" />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700">Default Currency</label>
          <select className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none">
            <option>Nigerian Naira (₦ - NGN)</option>
            <option>US Dollar ($ - USD)</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-[#E2E8F0]">
          <div>
            <div className="font-semibold text-slate-900">Maintenance Mode</div>
            <div className="text-slate-400 text-[11px]">Temporarily restrict student portal access for core updates.</div>
          </div>
          <input type="checkbox" className="size-4 accent-[#6366F1]" />
        </div>
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
        <button className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] font-semibold text-slate-700 hover:bg-slate-50 transition">
          Cancel
        </button>
        <button className="px-5 py-2.5 rounded-xl bg-[#6366F1] text-white font-semibold hover:bg-[#4F46E5] transition shadow-2xs">
          Save Settings
        </button>
      </div>
    </div>
  );
}
