import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Code2,
  CreditCard,
  Database,
  FileText,
  Folder,
  HardDrive,
  HelpCircle,
  Key,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  SquareCheck,
  User,
  Users,
  UserX,
  Zap,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, UserStatus } from "@/types/roles";
import { fetchApi } from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  provider?: string;
  onboarded: boolean;
  onboarding_data?: {
    degree?: string;
    field_of_study?: string;
  };
  last_active?: string;
  created_at?: string;
}

interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_user_id: string;
  target_email: string;
  details: string;
  timestamp: string;
}

interface TrackingLog {
  id: string;
  timestamp: string;
  user_email: string;
  endpoint: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  vector_retrieval_ms: number;
  status_code: number;
  feedback?: "up" | "down" | null;
  prompt_sample: string;
  response_sample: string;
  context_chunks: number;
  cost_usd: number;
}

type NavItem =
  | "overview"
  | "playground"
  | "assistants"
  | "finetuning"
  | "batches"
  | "evaluation"
  | "storage"
  | "usage"
  | "apikeys"
  | "billing"
  | "team"
  | "projects"
  | "settings"
  | "logs"
  | "audit";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, params] = useRoute("/admin/:tab");
  const currentTabFromUrl = (params?.tab as NavItem) || "overview";

  const handleSignOut = () => {
    logout();
    toast.success("Signed out successfully.");
    window.location.href = "/sign-in";
  };

  const [activeItem, setActiveItem] = useState<NavItem>(currentTabFromUrl);
  const [usageTab, setUsageTab] = useState<"cost" | "requests" | "tokens">("cost");
  const [selectedLog, setSelectedLog] = useState<TrackingLog | null>(null);

  // Users & Governance
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  useEffect(() => {
    if (params?.tab && params.tab !== activeItem) {
      setActiveItem(params.tab as NavItem);
    }
  }, [params?.tab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, auditRes, logsRes] = await Promise.all([
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/admin/audit-logs"),
        fetch("/api/v1/admin/logs"),
      ]);

      if (usersRes.ok) {
        const uJson = await usersRes.json();
        setUsers(uJson.users || []);
      }
      if (auditRes.ok) {
        const aJson = await auditRes.json();
        setAuditLogs(aJson.audit_logs || []);
      }
      if (logsRes.ok) {
        const lJson = await logsRes.json();
        setTrackingLogs(
          (lJson.logs || []).map((l: any) => ({
            ...l,
            cost_usd: (l.total_tokens / 1000000) * 0.25,
          }))
        );
      }
    } catch (err) {
      toast.error("Failed to refresh admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRoleStr: string) => {
    const targetRole = newRoleStr === "admin" ? UserRole.ADMIN : UserRole.USER;
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      if (!res.ok) throw new Error("Role update failed");

      toast.success(`User role updated to ${targetRole.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to update user role.");
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");

      toast.success(`User status updated to ${newStatus.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to update account status.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const haystack = `${u.name || ""} ${u.email} ${u.onboarding_data?.degree || ""}`.toLowerCase();
    const matchesSearch = !searchQuery || haystack.includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Daily usage bar chart height percentages matching exact OpenAI visual
  const barHeights = [
    25, 45, 30, 65, 55, 80, 35, 90, 40, 30, 50, 60, 45, 55, 75, 40, 50, 65, 55, 70, 85, 80, 65, 95, 75, 85, 90, 80, 100, 70, 45
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] flex font-sans antialiased selection:bg-slate-200">
      {/* LEFT SIDEBAR - Mirror-perfect OpenAI Style */}
      <aside className="w-[240px] bg-[#F9FAFB] border-r border-[#E5E7EB] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo Bar */}
          <div className="h-14 px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-900 hover:opacity-80 transition">
              {/* OpenAI Spiral Logo Icon */}
              <svg className="size-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
                <path d="M12 6v12M6 12h12" />
              </svg>
              <span className="font-bold text-lg tracking-tight text-slate-900">OpenAI</span>
            </Link>
            <button className="p-1 rounded text-slate-500 hover:text-slate-900 transition">
              <Menu size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-2 py-1 space-y-0.5 text-[13px] font-medium text-slate-700">
            <button
              onClick={() => setActiveItem("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "overview"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard size={17} className="text-slate-600" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveItem("playground")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "playground"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <Code2 size={17} className="text-slate-600" />
              <span>Playground</span>
            </button>

            <button
              onClick={() => setActiveItem("assistants")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "assistants"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <User size={17} className="text-slate-600" />
              <span>Assistants</span>
            </button>

            <button
              onClick={() => setActiveItem("finetuning")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "finetuning"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <Sliders size={17} className="text-slate-600" />
              <span>Fine-tuning</span>
            </button>

            <button
              onClick={() => setActiveItem("batches")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "batches"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <Layers size={17} className="text-slate-600" />
              <span>Batches</span>
            </button>

            <button
              onClick={() => setActiveItem("evaluation")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "evaluation"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <SquareCheck size={17} className="text-slate-600" />
              <span>Evaluation</span>
            </button>

            <button
              onClick={() => setActiveItem("storage")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "storage"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <HardDrive size={17} className="text-slate-600" />
              <span>Storage</span>
            </button>

            <button
              onClick={() => setActiveItem("usage")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "usage"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <BarChart2 size={17} className="text-slate-600" />
              <span>Usage</span>
            </button>

            <button
              onClick={() => setActiveItem("apikeys")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "apikeys"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <Key size={17} className="text-slate-600" />
              <span>API keys</span>
            </button>

            <button
              onClick={() => setActiveItem("billing")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "billing"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <CreditCard size={17} className="text-slate-600" />
              <span>Billing</span>
            </button>

            <button
              onClick={() => setActiveItem("team")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "team"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <Users size={17} className="text-slate-600" />
              <span>Team</span>
            </button>

            <button
              onClick={() => setActiveItem("projects")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "projects"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <Folder size={17} className="text-slate-600" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => setActiveItem("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                activeItem === "settings"
                  ? "bg-[#ECECF1] text-slate-900 font-semibold"
                  : "hover:bg-[#F0F0F0] text-slate-700 hover:text-slate-900"
              }`}
            >
              <Settings size={17} className="text-slate-600" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Cards */}
        <div className="p-3 space-y-3">
          {/* Plan Card */}
          <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs space-y-1.5">
            <div className="text-[11px] text-slate-500 font-medium">Plan</div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Pay-as-you-go</span>
              <span className="font-bold text-xs text-emerald-600">$23.47</span>
            </div>
            <div className="text-[10px] text-slate-400">Credit balance</div>
            <div className="pt-1 text-[11px]">
              <a href="#billing" onClick={() => setActiveItem("billing")} className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                View billing <ArrowRight size={11} />
              </a>
            </div>
          </div>

          {/* Project Dropdown Box */}
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500 font-medium px-1">Project</div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs flex items-center justify-between text-xs text-slate-900 font-medium cursor-pointer">
              <span>Default project</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition shadow-2xs cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CANVAS AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] overflow-y-auto">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <h1 className="text-xl font-bold text-slate-900 capitalize">
            {activeItem === "overview" ? "Overview" : activeItem === "team" ? "Team" : activeItem}
          </h1>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-5 text-xs">
            <button className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition font-medium">
              <FileText size={14} /> Docs
            </button>
            <button className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition font-medium">
              <HelpCircle size={14} /> Help
            </button>
            <button className="relative text-slate-600 hover:text-slate-900 transition">
              <Bell size={16} />
            </button>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 pl-2">
              <div className="size-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                JS
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-semibold text-slate-900">John Samuel</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-0.5">
                  <span>Personal</span>
                  <ChevronDown size={10} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <div className="p-8 space-y-6 max-w-[1240px] w-full mx-auto">
          {/* Action Row above Top Metrics */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Top metrics</h2>

            <div className="flex items-center gap-2.5">
              {/* Date Range Picker Dropdown */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer">
                <span>📅</span>
                <span>May 1 – May 31, 2024</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>

              {/* Black Action Button */}
              <button
                onClick={fetchAdminData}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#000000] hover:bg-slate-800 text-white transition flex items-center gap-1.5 shadow-2xs"
              >
                <Plus size={14} />
                <span>Create new</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* OVERVIEW SECTION - Mirror Perfect OpenAI Layout */}
          {activeItem === "overview" && (
            <div className="space-y-6">
              {/* TOP METRICS ROW (5 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* 1. Total usage */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Total usage</span>
                    <HelpCircle size={13} className="text-slate-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">$23.47</span>
                    <span className="text-xs font-semibold text-[#10B981]">+34.6%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
                  <svg className="w-full h-7 stroke-[#10B981] fill-none" viewBox="0 0 100 25">
                    <path d="M0,20 Q20,10 40,22 T80,12 T100,6" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* 2. Total requests */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Total requests</span>
                    <HelpCircle size={13} className="text-slate-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">1.29M</span>
                    <span className="text-xs font-semibold text-[#10B981]">+18.3%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
                  <svg className="w-full h-7 stroke-[#8B5CF6] fill-none" viewBox="0 0 100 25">
                    <path d="M0,22 Q25,15 50,18 T80,10 T100,4" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* 3. Tokens used */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Tokens used</span>
                    <HelpCircle size={13} className="text-slate-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">3.42B</span>
                    <span className="text-xs font-semibold text-[#10B981]">+21.7%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
                  <svg className="w-full h-7 stroke-[#3B82F6] fill-none" viewBox="0 0 100 25">
                    <path d="M0,18 Q20,12 40,20 T80,10 T100,3" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* 4. Failed requests */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Failed requests</span>
                    <HelpCircle size={13} className="text-slate-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">0.27%</span>
                    <span className="text-xs font-semibold text-[#10B981]">-12.5%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
                  <svg className="w-full h-7 stroke-[#F97316] fill-none" viewBox="0 0 100 25">
                    <path d="M0,8 Q20,14 40,10 T80,20 T100,24" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* 5. Avg. latency */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Avg. latency</span>
                    <HelpCircle size={13} className="text-slate-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">612ms</span>
                    <span className="text-xs font-semibold text-[#10B981]">-8.4%</span>
                  </div>
                  <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
                  <svg className="w-full h-7 stroke-[#14B8A6] fill-none" viewBox="0 0 100 25">
                    <path d="M0,14 Q20,16 40,10 T80,14 T100,8" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* MIDDLE SECTION: USAGE BAR CHART + MODEL USAGE DONUT + NOTIFICATIONS & STATUS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Usage Bar Chart (7 Cols) */}
                <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">Usage</span>
                      <HelpCircle size={13} className="text-slate-400" />
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex bg-[#F3F4F6] p-0.5 rounded-lg border border-slate-200">
                        {(["cost", "requests", "tokens"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setUsageTab(t)}
                            className={`px-3 py-1 rounded-md capitalize font-medium transition ${
                              usageTab === t ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500"
                            }`}
                          >
                            {t === "cost" ? "Cost" : t === "requests" ? "Requests" : "Tokens"}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 bg-[#F3F4F6] px-3 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium">
                        <span>Daily</span>
                        <ChevronDown size={13} />
                      </div>

                      <div className="p-1 rounded bg-[#F3F4F6] border border-slate-200 text-slate-500 cursor-pointer">
                        <Sliders size={13} />
                      </div>
                    </div>
                  </div>

                  {/* Daily Bar Graphic with Y-Axis */}
                  <div className="flex gap-2 py-2">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between text-[11px] text-slate-400 font-mono py-1 pr-1 border-r border-slate-100">
                      <span>$20</span>
                      <span>$15</span>
                      <span>$10</span>
                      <span>$5</span>
                      <span>$0</span>
                    </div>

                    {/* Bars Container */}
                    <div className="flex-1 space-y-2">
                      <div className="h-40 flex items-end justify-between gap-1.5 px-1">
                        {barHeights.map((h, i) => (
                          <div key={i} className="flex-1 bg-[#10B981] hover:bg-[#059669] rounded-t transition cursor-pointer" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
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

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#10B981]"></span> USD
                    </span>
                    <button onClick={() => setActiveItem("usage")} className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                      View usage details <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Model Usage Donut Chart (5 Cols) */}
                <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">Model usage</span>
                      <HelpCircle size={13} className="text-slate-400" />
                    </div>
                  </div>

                  {/* Donut & Legend Container */}
                  <div className="flex items-center justify-between gap-4 py-2">
                    {/* SVG Donut Graphic */}
                    <div className="relative size-36 shrink-0 flex items-center justify-center">
                      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E5E7EB" strokeWidth="4.2" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="4.2" strokeDasharray="60 40" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="4.2" strokeDasharray="17 83" strokeDashoffset="-60" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#84CC16" strokeWidth="4.2" strokeDasharray="13 87" strokeDashoffset="-77" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#8B5CF6" strokeWidth="4.2" strokeDasharray="5 95" strokeDashoffset="-90" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F97316" strokeWidth="4.2" strokeDasharray="2 98" strokeDashoffset="-95" />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#9CA3AF" strokeWidth="4.2" strokeDasharray="1 99" strokeDashoffset="-97" />
                      </svg>
                      <div className="absolute text-center">
                        <div className="text-base font-bold text-slate-900 font-mono">3.42B</div>
                        <div className="text-[11px] text-slate-500">Tokens</div>
                      </div>
                    </div>

                    {/* Legend Table */}
                    <div className="flex-1 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <span className="size-2.5 rounded-full bg-[#3B82F6]"></span> gpt-4o
                        </span>
                        <span className="text-slate-500">60.1%</span>
                        <span className="text-slate-900 font-semibold">2.06B</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <span className="size-2.5 rounded-full bg-[#10B981]"></span> gpt-4-turbo
                        </span>
                        <span className="text-slate-500">17.4%</span>
                        <span className="text-slate-900 font-semibold">594M</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <span className="size-2.5 rounded-full bg-[#84CC16]"></span> gpt-3.5-turbo
                        </span>
                        <span className="text-slate-500">13.7%</span>
                        <span className="text-slate-900 font-semibold">469M</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <span className="size-2.5 rounded-full bg-[#8B5CF6]"></span> text-embedding-3-small
                        </span>
                        <span className="text-slate-500">5.4%</span>
                        <span className="text-slate-900 font-semibold">185M</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <span className="size-2.5 rounded-full bg-[#F97316]"></span> dall-e-3
                        </span>
                        <span className="text-slate-500">2.1%</span>
                        <span className="text-slate-900 font-semibold">72M</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <span className="size-2.5 rounded-full bg-[#9CA3AF]"></span> Other
                        </span>
                        <span className="text-slate-500">1.3%</span>
                        <span className="text-slate-900 font-semibold">44M</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end text-xs">
                    <button onClick={() => setActiveItem("usage")} className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                      View model usage <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: RECENT ACTIVITY + PROJECTS & NOTIFICATIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Activity Table (8 Cols) */}
                <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">Recent activity</span>
                      <HelpCircle size={13} className="text-slate-400" />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-slate-400 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider">
                        <tr>
                          <th className="pb-3">TIME</th>
                          <th className="pb-3">TYPE</th>
                          <th className="pb-3">MODEL</th>
                          <th className="pb-3">TOKENS</th>
                          <th className="pb-3">COST</th>
                          <th className="pb-3 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50 transition cursor-pointer">
                          <td className="py-3.5 text-slate-500 font-sans">May 31, 10:24 AM</td>
                          <td className="py-3.5 font-sans font-medium text-slate-900">Chat Completions</td>
                          <td className="py-3.5 text-slate-700">gpt-4o</td>
                          <td className="py-3.5 text-slate-900">2,153</td>
                          <td className="py-3.5 text-slate-700">$0.043</td>
                          <td className="py-3.5 text-right font-sans">
                            <span className="inline-flex items-center gap-1 text-[#10B981] font-semibold text-xs">
                              <span className="size-1.5 rounded-full bg-[#10B981]"></span> Success
                            </span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition cursor-pointer">
                          <td className="py-3.5 text-slate-500 font-sans">May 31, 10:21 AM</td>
                          <td className="py-3.5 font-sans font-medium text-slate-900">Chat Completions</td>
                          <td className="py-3.5 text-slate-700">gpt-4o</td>
                          <td className="py-3.5 text-slate-900">1,584</td>
                          <td className="py-3.5 text-slate-700">$0.032</td>
                          <td className="py-3.5 text-right font-sans">
                            <span className="inline-flex items-center gap-1 text-[#10B981] font-semibold text-xs">
                              <span className="size-1.5 rounded-full bg-[#10B981]"></span> Success
                            </span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition cursor-pointer">
                          <td className="py-3.5 text-slate-500 font-sans">May 31, 10:18 AM</td>
                          <td className="py-3.5 font-sans font-medium text-slate-900">Embeddings</td>
                          <td className="py-3.5 text-slate-700">text-embedding-3-small</td>
                          <td className="py-3.5 text-slate-900">5,120</td>
                          <td className="py-3.5 text-slate-700">$0.002</td>
                          <td className="py-3.5 text-right font-sans">
                            <span className="inline-flex items-center gap-1 text-[#10B981] font-semibold text-xs">
                              <span className="size-1.5 rounded-full bg-[#10B981]"></span> Success
                            </span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition cursor-pointer">
                          <td className="py-3.5 text-slate-500 font-sans">May 31, 10:17 AM</td>
                          <td className="py-3.5 font-sans font-medium text-slate-900">Image Generation</td>
                          <td className="py-3.5 text-slate-700">dall-e-3</td>
                          <td className="py-3.5 text-slate-400">-</td>
                          <td className="py-3.5 text-slate-700">$0.040</td>
                          <td className="py-3.5 text-right font-sans">
                            <span className="inline-flex items-center gap-1 text-[#10B981] font-semibold text-xs">
                              <span className="size-1.5 rounded-full bg-[#10B981]"></span> Success
                            </span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition cursor-pointer">
                          <td className="py-3.5 text-slate-500 font-sans">May 31, 10:15 AM</td>
                          <td className="py-3.5 font-sans font-medium text-slate-900">Chat Completions</td>
                          <td className="py-3.5 text-slate-700">gpt-3.5-turbo</td>
                          <td className="py-3.5 text-slate-900">1,024</td>
                          <td className="py-3.5 text-slate-700">$0.001</td>
                          <td className="py-3.5 text-right font-sans">
                            <span className="inline-flex items-center gap-1 text-[#F97316] font-semibold text-xs">
                              <span className="size-1.5 rounded-full bg-[#F97316]"></span> Rate limit
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <button onClick={() => setActiveItem("logs")} className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                      View all activity <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Projects & Notifications Side Cards (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Projects Card */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">Projects</span>
                        <HelpCircle size={13} className="text-slate-400" />
                      </div>
                      <button onClick={() => setActiveItem("projects")} className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                        View all projects <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-sans font-medium text-slate-900">
                          <span className="size-6 rounded bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">D</span>
                          <span>Default project</span>
                        </div>
                        <span className="text-slate-500">612K</span>
                        <span className="text-slate-500">1.72B</span>
                        <span className="text-slate-900 font-semibold">$12.21</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-sans font-medium text-slate-900">
                          <span className="size-6 rounded bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">A</span>
                          <span>My AI App</span>
                        </div>
                        <span className="text-slate-500">321K</span>
                        <span className="text-slate-500">953M</span>
                        <span className="text-slate-900 font-semibold">$7.43</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-sans font-medium text-slate-900">
                          <span className="size-6 rounded bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center">R</span>
                          <span>Research Assistant</span>
                        </div>
                        <span className="text-slate-500">189K</span>
                        <span className="text-slate-500">512M</span>
                        <span className="text-slate-900 font-semibold">$3.21</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-sans font-medium text-slate-900">
                          <span className="size-6 rounded bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">D</span>
                          <span>Data Analysis</span>
                        </div>
                        <span className="text-slate-500">98K</span>
                        <span className="text-slate-500">231M</span>
                        <span className="text-slate-900 font-semibold">$0.62</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-sans font-medium text-slate-900">
                          <span className="size-6 rounded bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">O</span>
                          <span>Others</span>
                        </div>
                        <span className="text-slate-500">79K</span>
                        <span className="text-slate-500">16M</span>
                        <span className="text-slate-900 font-semibold">$0.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Card */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-900">Notifications</span>
                      <button className="text-[11px] text-blue-600 font-medium hover:underline">View all</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5">
                        <span className="size-2 rounded-full bg-[#10B981] mt-1 shrink-0"></span>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900">Payment successful</div>
                          <div className="text-[10px] text-slate-400">May 31, 9:41 AM</div>
                          <div className="text-[11px] text-slate-600">$20.00 was added to your balance.</div>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <span className="size-2 rounded-full bg-[#3B82F6] mt-1 shrink-0"></span>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900">System update</div>
                          <div className="text-[10px] text-slate-400">May 30, 2:15 PM</div>
                          <div className="text-[11px] text-slate-600">We've updated the function calling capabilities in gpt-4o.</div>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <span className="size-2 rounded-full bg-[#8B5CF6] mt-1 shrink-0"></span>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900">New model available</div>
                          <div className="text-[10px] text-slate-400">May 29, 11:09 AM</div>
                          <div className="text-[11px] text-slate-600">gpt-4o-mini is now available in the API.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Status Card */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-900">System status</span>
                      <a href="#status" className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-1">
                        View status page <ArrowRight size={11} />
                      </a>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">API</span>
                        <span className="text-[#10B981] text-[11px] font-semibold flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-[#10B981]"></span> Operational
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">ChatGPT</span>
                        <span className="text-[#10B981] text-[11px] font-semibold flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-[#10B981]"></span> Operational
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Playground</span>
                        <span className="text-[#10B981] text-[11px] font-semibold flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-[#10B981]"></span> Operational
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Assistants</span>
                        <span className="text-[#10B981] text-[11px] font-semibold flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-[#10B981]"></span> Operational
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">API status</span>
                        <span className="text-[#10B981] text-[11px] font-semibold flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-[#10B981]"></span> Operational
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-[#10B981] font-bold">
                      <CheckCircle size={14} /> All systems operational
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEAM GOVERNANCE & RBAC SECTION */}
          {activeItem === "team" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <div className="relative flex-1 w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search team members by name, email..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[#E5E7EB] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">RBAC Filter:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-slate-50 border border-[#E5E7EB] text-slate-900 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    <option value={UserRole.ADMIN}>Admin ({UserRole.ADMIN})</option>
                    <option value={UserRole.USER}>User ({UserRole.USER})</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FAFB] text-slate-400 border-b border-[#E5E7EB] uppercase font-mono text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">RBAC Role (Enum)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Degree / Specialization</th>
                      <th className="p-4">Last Active</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {(u.name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{u.name || "Team Member"}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`text-xs font-bold rounded-lg px-3 py-1 border focus:outline-none cursor-pointer ${
                              u.role === UserRole.ADMIN
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            <option value={UserRole.USER} className="bg-white text-slate-900">
                              USER (Enum)
                            </option>
                            <option value={UserRole.ADMIN} className="bg-white text-slate-900">
                              ADMIN (Enum)
                            </option>
                          </select>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === UserStatus.ACTIVE
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}>
                            <span className={`size-1.5 rounded-full ${u.status === UserStatus.ACTIVE ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                            {u.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="p-4 text-slate-600">
                          {u.onboarding_data?.degree || "Computer Science"}
                        </td>

                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                          {u.last_active ? new Date(u.last_active).toLocaleString() : "Active Now"}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleStatusChange(u.id, u.status)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                              u.status === UserStatus.ACTIVE
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                          >
                            {u.status === UserStatus.ACTIVE ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
