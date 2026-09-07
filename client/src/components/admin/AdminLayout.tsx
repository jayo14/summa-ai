import React, { useEffect, useState } from "react";
import {
  Activity,
  BarChart2,
  Bell,
  Building,
  CheckCircle,
  ChevronDown,
  CreditCard,
  FileText,
  Folder,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Radio,
  Settings,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { SummaLogo } from "@/components/SummaLogo";

type AdminTab =
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
  | "components"
  | "settings"
  | "audit";

const sidebarNav: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
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
  { key: "components", label: "Components", icon: <LayoutDashboard size={18} /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} /> },
  { key: "audit", label: "Audit Logs", icon: <FileText size={18} /> },
];

const navMeta: Record<AdminTab, { title: string; desc: string }> = {
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
  components: { title: "Components", desc: "Beautiful, focused learning experiences designed to help you understand, practice and master your goals." },
  settings: { title: "Platform Settings", desc: "Configure global Summa AI admin behavior and environment flags." },
  audit: { title: "Audit Logs", desc: "Immutable administrative activity trail and security telemetry." },
};

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTab;
}

export function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    toast.success("Signed out successfully.");
    window.location.href = "/sign-in";
  };

  const handleTabChange = (tab: AdminTab) => {
    navigate(`/admin/${tab}`);
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-[#121616] text-[#0F172A] flex font-sans antialiased selection:bg-purple-100">
      {/* LEFT SIDEBAR */}
      <aside
        className={`${
          isCollapsed ? "w-[72px]" : "w-[250px]"
        } transition-all duration-300 ease-in-out h-screen fixed left-0 top-0 bg-white dark:bg-[#1C2323] border-r border-mist-green dark:border-[#2A3838] flex flex-col justify-between shrink-0 select-none py-4 px-3 z-30`}
      >
        <div className="flex flex-col min-h-0">
          {/* Logo & Collapse Header */}
          <div className={`h-12 px-2 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-4 shrink-0`}>
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-2 text-ink dark:text-cream-soft overflow-hidden whitespace-nowrap">
                <SummaLogo />
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1.5 rounded-lg text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft hover:bg-mist-green/50 dark:hover:bg-[#2A3838] transition cursor-pointer"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5 text-[13px] font-medium text-grey-green dark:text-[#8FA29B] overflow-y-auto pr-1">
            {sidebarNav.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                  } rounded-xl text-left transition ${
                    active
                      ? "bg-teal-dark dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-semibold"
                      : "hover:bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft"
                  }`}
                >
                  <span className={active ? "text-teal-dark dark:text-accent-lime" : "text-grey-green dark:text-[#8FA29B]"}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Sign Out Button */}
        <div className="shrink-0 space-y-3 pt-3">
          <button
            onClick={handleSignOut}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center justify-center ${
              isCollapsed ? "p-2.5" : "gap-2 px-3 py-2.5"
            } rounded-xl text-xs font-semibold text-destructive dark:text-[#be747e] hover:text-destructive dark:text-[#be747e] bg-destructive/10 dark:bg-[#be747e]/10 hover:bg-destructive/20 dark:hover:bg-[#be747e]/20 transition cursor-pointer border border-destructive/30 dark:border-[#be747e]/30/60 shadow-2xs`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CANVAS */}
      <main className={`flex-1 flex flex-col min-w-0 bg-cream-light dark:bg-[#121616] min-h-screen ${isCollapsed ? "ml-[72px]" : "ml-[250px]"} transition-all duration-300 ease-in-out`}>
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white dark:bg-[#1C2323] border-b border-mist-green dark:border-[#2A3838] px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-bold text-ink dark:text-cream-soft">{navMeta[activeTab]?.title || "Overview"}</h1>
            <p className="text-xs text-grey-green dark:text-[#8FA29B] flex items-center gap-1">
              {navMeta[activeTab]?.desc || "Welcome back, Admin 👋"}
            </p>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-3 text-xs">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-grey-green dark:text-[#8FA29B] hover:bg-cream-light dark:hover:bg-[#232D2D] transition shadow-2xs cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2.5 rounded-xl border border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-grey-green dark:text-[#8FA29B] hover:bg-cream-light dark:hover:bg-[#232D2D] transition shadow-2xs cursor-pointer"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-destructive/10 dark:bg-[#be747e]/100 text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="size-9 rounded-full bg-teal-dark dark:bg-accent-lime text-white dark:text-ink font-bold text-xs flex items-center justify-center overflow-hidden border border-mist-green dark:border-[#2A3838]">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || user?.email || "Admin"} className="size-full object-cover" />
                ) : (
                  <span>{(() => {
                    const name = user?.name || user?.email || "";
                    const parts = name.split(/[@.\s]+/).filter(Boolean);
                    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
                    return (name.slice(0, 2) || "AD").toUpperCase();
                  })()}</span>
                )}
              </div>
              <div className="text-left leading-tight hidden md:block">
                <div className="font-semibold text-xs text-ink dark:text-cream-soft">{user?.name || user?.email?.split("@")[0] || "Admin"}</div>
                <div className="text-[10px] text-grey-green dark:text-[#8FA29B] flex items-center gap-0.5">
                  {user?.role?.toUpperCase() || "ADMIN"} <ChevronDown size={10} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="p-8 space-y-6 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
