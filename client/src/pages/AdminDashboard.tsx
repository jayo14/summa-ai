import React, { useEffect, useState } from "react";
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
  Folder,
  HelpCircle,
  Info,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  User,
  Users,
  UserX,
  Zap,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, UserStatus } from "@/types/roles";
import { SummaLogo } from "@/components/SummaLogo";
import {
  UsersView,
  UserDrawer,
  InstitutionsView,
  AnalyticsView,
  SubscriptionsView,
  RevenueView,
  EngagementView,
  ContentView,
  QuizzesView,
  LiveSessionsView,
  MessagesView,
  FeedbackView,
  IntegrationsView,
  AdminSettingsView,
  AuditLogsView,
  NotificationsDrawer,
  StatusBadge,
  MetricCard,
} from "@/components/AdminViews";

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

type NavItem =
  | "overview"
  | "users"
  | "institutions"
  | "analytics"
  | "subscriptions"
  | "revenue"
  | "engagement"
  | "content"
  | "quizzes"
  | "sessions"
  | "messages"
  | "feedback"
  | "integrations"
  | "settings"
  | "audit"
  | "team";

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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const navMeta: Record<NavItem, { title: string; desc: string }> = {
    overview: { title: "Overview", desc: "Welcome back, Admin 👋" },
    users: { title: "Users", desc: "Manage students, lecturers and administrators." },
    institutions: { title: "Institutions", desc: "Manage organizations using Summa AI." },
    analytics: { title: "Analytics", desc: "Deep platform usage, token consumption, and learning telemetry." },
    subscriptions: { title: "Subscriptions", desc: "Manage the SaaS subscription engine & recurring plans." },
    revenue: { title: "Revenue", desc: "Track subscriptions, payments and recurring revenue." },
    engagement: { title: "Engagement", desc: "Measure active retention, session length, and feature adoption." },
    content: { title: "Content", desc: "Manage educational courses, lectures, documents, and notes." },
    quizzes: { title: "Quizzes & Results", desc: "Assessment performance, completion rates, and question analytics." },
    sessions: { title: "Live Sessions", desc: "Monitor live interactive classes and scheduled learning broadcasts." },
    messages: { title: "Messages", desc: "Broadcast announcements, system notifications, and direct user messages." },
    feedback: { title: "Feedback", desc: "Centralize user bug reports, feature requests, and satisfaction ratings." },
    integrations: { title: "Integrations", desc: "External API services, payment gateways, and AI provider health." },
    settings: { title: "Platform Settings", desc: "Configure global Summa AI admin behavior and environment flags." },
    audit: { title: "Audit Logs", desc: "Immutable administrative activity trail and security telemetry." },
    team: { title: "Team Governance", desc: "RBAC policies and administrative account permissions." },
  };

  useEffect(() => {
    if (params?.tab && params.tab !== activeItem) {
      setActiveItem(params.tab as NavItem);
    }
  }, [params?.tab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uJson, aJson] = await Promise.all([
        fetchApi<any>("/admin/users"),
        fetchApi<any>("/admin/audit-logs"),
      ]);

      if (uJson?.users) {
        setUsers(uJson.users);
      }
      if (aJson?.audit_logs) {
        setAuditLogs(aJson.audit_logs);
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
      await fetchApi(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: targetRole }),
      });

      toast.success(`User role updated to ${targetRole.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to update user role.");
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    try {
      await fetchApi(`/admin/users/${userId}/status`, {
        method: "PATCH",
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

  // Stacked bar values matching exact visual design
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

  const sidebarNav: { key: NavItem; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { key: "users", label: "Users", icon: <Users size={18} /> },
    { key: "institutions", label: "Institutions", icon: <Building size={18} /> },
    { key: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    { key: "subscriptions", label: "Subscriptions", icon: <CreditCard size={18} /> },
    { key: "revenue", label: "Revenue", icon: <CreditCard size={18} /> },
    { key: "engagement", label: "Engagement", icon: <Activity size={18} /> },
    { key: "content", label: "Content", icon: <Folder size={18} /> },
    { key: "quizzes", label: "Quizzes & Results", icon: <CheckCircle size={18} /> },
    { key: "sessions", label: "Live Sessions", icon: <Radio size={18} /> },
    { key: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
    { key: "feedback", label: "Feedback", icon: <MessageSquare size={18} /> },
    { key: "integrations", label: "Integrations", icon: <Layers size={18} /> },
    { key: "settings", label: "Settings", icon: <Settings size={18} /> },
    { key: "audit", label: "Audit Logs", icon: <FileText size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans antialiased selection:bg-purple-100">
      {/* LEFT SIDEBAR - Summa AI Admin Fixed & Pixel Perfect */}
      <aside className="w-[250px] h-screen sticky top-0 bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 select-none py-4 px-3 z-30">
        <div className="flex flex-col min-h-0">
          {/* Logo & Collapse Header */}
          <div className="h-12 px-2 flex items-center justify-between mb-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 text-slate-900">
              <SummaLogo />
            </Link>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
              <Menu size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5 text-[13px] font-medium text-slate-600 overflow-y-auto pr-1">
            {sidebarNav.map((item) => {
              const active = activeItem === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveItem(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                    active
                      ? "bg-[#6366F1]/10 text-[#4F46E5] font-semibold"
                      : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className={active ? "text-[#4F46E5]" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Plan Card & Functional Sign Out Button */}
        <div className="shrink-0 space-y-3 pt-3">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="text-[11px] text-slate-400 font-medium">Current Plan</div>
            <div className="font-bold text-sm text-slate-900">Enterprise</div>
            <div className="text-xs font-semibold text-[#10B981]">
              ₦1,250,000 <span className="text-slate-400 font-normal">/ month</span>
            </div>
            <div className="text-[11px] text-slate-400">Renews on Jun 1, 2024</div>
            <button className="pt-1 text-xs text-[#6366F1] font-semibold hover:underline flex items-center gap-1 cursor-pointer">
              Manage plan <ArrowRight size={13} />
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 transition cursor-pointer border border-rose-200/60 shadow-2xs"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-y-auto">
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{navMeta[activeItem]?.title || "Overview"}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              {navMeta[activeItem]?.desc || "Welcome back, Admin 👋"}
            </p>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-3 text-xs">
            {/* Date Range Picker */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl font-medium text-slate-700 shadow-2xs cursor-pointer">
              <span>📅</span>
              <span>May 1 – May 31, 2024</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {/* Compare Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl font-medium text-slate-700 shadow-2xs cursor-pointer">
              <span className="text-slate-400">Compare to:</span>
              <span>Apr 1 – Apr 30</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="size-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Admin Avatar"
                  className="size-full object-cover"
                />
              </div>
              <div className="text-left leading-tight hidden md:block">
                <div className="font-semibold text-xs text-slate-900">Admin</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  Super Admin <ChevronDown size={10} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY DASHBOARD */}
        <div className="p-8 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Top Bar Action */}
          <div className="flex items-center justify-between">
            <div></div>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white transition flex items-center gap-2 shadow-sm cursor-pointer">
              <Download size={14} />
              <span>Export report</span>
            </button>
          </div>

          {activeItem === "overview" && (
            <div className="space-y-6">
              {/* 6 TOP METRIC CARDS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* 1. Total Users */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Users</span>
                <Info size={13} className="text-slate-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">12,241</span>
                <span className="text-[11px] font-semibold text-[#10B981]">+18.6%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
              <svg className="w-full h-7 stroke-[#8B5CF6] fill-none" viewBox="0 0 100 25">
                <path d="M0,20 Q20,10 40,22 T80,12 T100,6" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* 2. Active Users */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Users (30d)</span>
                <Info size={13} className="text-slate-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">8,632</span>
                <span className="text-[11px] font-semibold text-[#10B981]">+21.3%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
              <svg className="w-full h-7 stroke-[#10B981] fill-none" viewBox="0 0 100 25">
                <path d="M0,22 Q25,15 50,18 T80,10 T100,4" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* 3. Institutions */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Institutions</span>
                <Info size={13} className="text-slate-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">34</span>
                <span className="text-[11px] font-semibold text-[#10B981]">+13.3%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
              <svg className="w-full h-7 stroke-[#3B82F6] fill-none" viewBox="0 0 100 25">
                <path d="M0,18 Q20,12 40,20 T80,10 T100,3" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* 4. Monthly Recurring Revenue */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Monthly Recurring Revenue</span>
                <Info size={13} className="text-slate-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">₦2,152,400</span>
                <span className="text-[11px] font-semibold text-[#10B981]">+24.8%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
              <svg className="w-full h-7 stroke-[#8B5CF6] fill-none" viewBox="0 0 100 25">
                <path d="M0,20 Q25,12 50,18 T80,10 T100,4" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* 5. Paid Subscriptions */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Paid Subscriptions</span>
                <Info size={13} className="text-slate-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">278</span>
                <span className="text-[11px] font-semibold text-[#10B981]">+17.2%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
              <svg className="w-full h-7 stroke-[#F97316] fill-none" viewBox="0 0 100 25">
                <path d="M0,22 Q20,16 40,20 T80,12 T100,8" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* 6. Avg. Daily Sessions */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Avg. Daily Sessions</span>
                <Info size={13} className="text-slate-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">3,126</span>
                <span className="text-[11px] font-semibold text-[#10B981]">+15.1%</span>
              </div>
              <div className="text-[10px] text-slate-400">vs Apr 1 – Apr 30</div>
              <svg className="w-full h-7 stroke-[#14B8A6] fill-none" viewBox="0 0 100 25">
                <path d="M0,16 Q20,12 40,18 T80,10 T100,5" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* MIDDLE SECTION: MRR OVERVIEW + USERS BREAKDOWN + LIVE SYSTEM STATUS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* MRR Overview Stacked Bar Chart (6 Cols) */}
            <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                    <span>MRR Overview</span>
                    <Info size={13} className="text-slate-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900">₦2,152,400</span>
                    <span className="text-xs font-semibold text-[#10B981]">+24.8%</span>
                    <span className="text-[11px] text-slate-400">vs Apr 1 – Apr 30</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-medium text-slate-700 cursor-pointer">
                  <span>Daily</span>
                  <ChevronDown size={13} />
                </div>
              </div>

              {/* Stacked Bars Chart Graphic */}
              <div className="flex gap-2 py-4">
                {/* Y-Axis */}
                <div className="flex flex-col justify-between text-[10px] text-slate-400 font-mono py-1 pr-2">
                  <span>₦2.5M</span>
                  <span>₦2M</span>
                  <span>₦1.5M</span>
                  <span>₦1M</span>
                  <span>₦0.5M</span>
                  <span>₦0</span>
                </div>

                {/* Stacked Bars */}
                <div className="flex-1 space-y-3">
                  <div className="h-44 flex items-end justify-between gap-1 px-1">
                    {mrrBars.map((b, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                        <div
                          className="w-full bg-[#8B5CF6] rounded-t-xs"
                          style={{ height: `${b.newMRR}%` }}
                        ></div>
                        <div
                          className="w-full bg-[#10B981] rounded-b-xs"
                          style={{ height: `${b.expansionMRR}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
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

              {/* Legend & Footer link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-600 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#8B5CF6]"></span> New MRR
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#10B981]"></span> Expansion MRR
                  </span>
                </div>
                <button
                  onClick={() => setActiveItem("revenue")}
                  className="text-[#6366F1] font-semibold hover:underline flex items-center gap-1"
                >
                  View revenue analytics <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Users Breakdown Donut Chart (3 Cols) */}
            <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700">
                  <span>Users Breakdown</span>
                  <Info size={13} className="text-slate-400" />
                </div>
              </div>

              {/* Donut Graphic & Legend */}
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative size-44 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="3.8" />
                    {/* Students 77.7% */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#8B5CF6" strokeWidth="3.8" strokeDasharray="77.7 22.3" strokeDashoffset="0" />
                    {/* Lecturers 14.9% */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="3.8" strokeDasharray="14.9 85.1" strokeDashoffset="-77.7" />
                    {/* Admins 3.1% */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="3.8" strokeDasharray="3.1 96.9" strokeDashoffset="-92.6" />
                    {/* Others 4.3% */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="3.8" strokeDasharray="4.3 95.7" strokeDashoffset="-95.7" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-xl font-bold text-slate-900 font-mono">12,241</div>
                    <div className="text-[11px] text-slate-400">Total Users</div>
                  </div>
                </div>

                {/* Legend Table */}
                <div className="w-full space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="size-2.5 rounded-full bg-[#8B5CF6]"></span> Students
                    </span>
                    <span className="text-slate-900 font-mono font-semibold">9,512 (77.7%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="size-2.5 rounded-full bg-[#10B981]"></span> Lecturers
                    </span>
                    <span className="text-slate-900 font-mono font-semibold">1,824 (14.9%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="size-2.5 rounded-full bg-[#F59E0B]"></span> Admins
                    </span>
                    <span className="text-slate-900 font-mono font-semibold">378 (3.1%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="size-2.5 rounded-full bg-[#3B82F6]"></span> Others
                    </span>
                    <span className="text-slate-900 font-mono font-semibold">527 (4.3%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end text-xs">
                <button
                  onClick={() => setActiveItem("users")}
                  className="text-[#6366F1] font-semibold hover:underline flex items-center gap-1"
                >
                  View users <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Live System Status (3 Cols) */}
            <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700">
                  <span>Live System</span>
                  <Info size={13} className="text-slate-400" />
                </div>
              </div>

              {/* Status List */}
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
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle size={15} className="text-[#10B981]" />
                      <span>{item.name}</span>
                    </span>
                    <span className="text-[#10B981] font-semibold text-[11px]">{item.status}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end text-xs">
                <button className="text-[#6366F1] font-semibold hover:underline flex items-center gap-1">
                  View status page <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: TOP INSTITUTIONS + RECENT ACTIVITY + QUICK ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Institutions Table (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Top Institutions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider">
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
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-semibold text-slate-900">{inst.name}</td>
                        <td className="py-3 text-slate-600 font-mono">{inst.users}</td>
                        <td className="py-3 text-slate-600 font-mono">{inst.active}</td>
                        <td className="py-3 text-slate-700">{inst.sub}</td>
                        <td className="py-3 text-right font-mono font-semibold text-slate-900">{inst.mrr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-start text-xs">
                <button
                  onClick={() => setActiveItem("institutions")}
                  className="text-[#6366F1] font-semibold hover:underline flex items-center gap-1"
                >
                  View all institutions <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Recent Activity (4 Cols) */}
            <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Recent Activity</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider">
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
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="py-3 text-slate-900 font-semibold">{act.event}</td>
                        <td className="py-3 text-slate-600 truncate max-w-[160px]">{act.details}</td>
                        <td className="py-3 text-right text-slate-400 font-mono text-[11px]">{act.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-start text-xs">
                <button
                  onClick={() => setActiveItem("audit")}
                  className="text-[#6366F1] font-semibold hover:underline flex items-center gap-1"
                >
                  View all activity <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Quick Actions (3 Cols) */}
            <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Quick Actions</span>
              </div>

              <div className="space-y-2 py-1 text-xs font-semibold text-slate-700">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-[#E2E8F0] text-left">
                  <Building size={16} className="text-slate-500" />
                  <span>Add Institution</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-[#E2E8F0] text-left">
                  <Bell size={16} className="text-slate-500" />
                  <span>Create Announcement</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-[#E2E8F0] text-left">
                  <Download size={16} className="text-slate-500" />
                  <span>Export Users</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-[#E2E8F0] text-left">
                  <FileText size={16} className="text-slate-500" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SWITCHING ENGINE */}
          {activeItem === "users" && <UsersView onUserClick={(u) => setSelectedUser(u)} />}
          {activeItem === "institutions" && <InstitutionsView />}
          {activeItem === "analytics" && <AnalyticsView />}
          {activeItem === "subscriptions" && <SubscriptionsView />}
          {activeItem === "revenue" && <RevenueView />}
          {activeItem === "engagement" && <EngagementView />}
          {activeItem === "content" && <ContentView />}
          {activeItem === "quizzes" && <QuizzesView />}
          {activeItem === "sessions" && <LiveSessionsView />}
          {activeItem === "messages" && <MessagesView />}
          {activeItem === "feedback" && <FeedbackView />}
          {activeItem === "integrations" && <IntegrationsView />}
          {activeItem === "settings" && <AdminSettingsView />}
          {activeItem === "audit" && <AuditLogsView />}
          
          {/* USER DETAILS DRAWER */}
          {selectedUser && (
            <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
          )}

          {/* NOTIFICATIONS DRAWER */}
          <NotificationsDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

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
