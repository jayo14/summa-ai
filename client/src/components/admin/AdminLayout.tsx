import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { useIsMobile } from "@/hooks/useMobile";
import { SummaLogo } from "@/components/SummaLogo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  { key: "overview", label: "Overview", icon: <LayoutDashboard size={18} aria-hidden="true" /> },
  { key: "users", label: "Users", icon: <Users size={18} aria-hidden="true" /> },
  { key: "institutions", label: "Institutions", icon: <Building size={18} aria-hidden="true" /> },
  { key: "analytics", label: "Analytics", icon: <BarChart2 size={18} aria-hidden="true" /> },
  { key: "subscriptions", label: "Subscriptions", icon: <CreditCard size={18} aria-hidden="true" /> },
  { key: "revenue", label: "Revenue", icon: <CreditCard size={18} aria-hidden="true" /> },
  { key: "engagement", label: "Engagement", icon: <Activity size={18} aria-hidden="true" /> },
  { key: "content", label: "Content", icon: <Folder size={18} aria-hidden="true" /> },
  { key: "quizzes", label: "Quizzes & Results", icon: <CheckCircle size={18} aria-hidden="true" /> },
  { key: "sessions", label: "Live Sessions", icon: <Radio size={18} aria-hidden="true" /> },
  { key: "messages", label: "Messages", icon: <MessageSquare size={18} aria-hidden="true" /> },
  { key: "feedback", label: "Feedback", icon: <MessageSquare size={18} aria-hidden="true" /> },
  { key: "integrations", label: "Integrations", icon: <Layers size={18} aria-hidden="true" /> },
  { key: "components", label: "Components", icon: <LayoutDashboard size={18} aria-hidden="true" /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} aria-hidden="true" /> },
  { key: "audit", label: "Audit Logs", icon: <FileText size={18} aria-hidden="true" /> },
];

const navMeta: Record<AdminTab, { title: string; desc: string }> = {
  overview: { title: "Overview", desc: "Welcome back, Admin" },
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
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const handleSignOut = useCallback(() => {
    logout();
    toast.success("Signed out successfully.");
    window.location.href = "/sign-in";
  }, [logout]);

  const handleTabChange = useCallback((tab: AdminTab) => {
    navigate(`/admin/${tab}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [navigate, isMobile]);

  // Focus main content on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [activeTab]);

  // Keyboard navigation for sidebar
  const handleNavKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const navItems = navRef.current?.querySelectorAll('[role="menuitem"]');
      if (!navItems) return;

      let nextIndex = index;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          nextIndex = index < navItems.length - 1 ? index + 1 : 0;
          break;
        case "ArrowUp":
          e.preventDefault();
          nextIndex = index > 0 ? index - 1 : navItems.length - 1;
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = navItems.length - 1;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleTabChange(sidebarNav[index].key);
          return;
        default:
          return;
      }

      (navItems[nextIndex] as HTMLElement)?.focus();
    },
    [handleTabChange]
  );

  const sidebarContent = (
    <>
      <div className="flex flex-col min-h-0">
        {/* Logo & Collapse Header */}
        <div className={`h-12 px-2 flex items-center ${isCollapsed && !isMobile ? "justify-center" : "justify-between"} mb-4 shrink-0`}>
          {(!isCollapsed || isMobile) && (
            <Link
              href="/"
              className="flex items-center gap-2 text-ink dark:text-cream-soft overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime focus:ring-offset-2 rounded"
              aria-label="Summa AI Home"
            >
              <SummaLogo />
            </Link>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
              className="p-1.5 rounded-lg text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft hover:bg-mist-green/50 dark:hover:bg-[#2A3838] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          ref={navRef}
          role="menubar"
          aria-label="Admin navigation"
          className="space-y-0.5 text-[13px] font-medium text-grey-green dark:text-[#8FA29B] overflow-y-auto pr-1"
        >
          {sidebarNav.map((item, index) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                role="menuitem"
                tabIndex={active ? 0 : -1}
                aria-current={active ? "page" : undefined}
                onClick={() => handleTabChange(item.key)}
                onKeyDown={(e) => handleNavKeyDown(e, index)}
                title={isCollapsed && !isMobile ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed && !isMobile ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                } rounded-xl text-left transition focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime focus:ring-offset-2 ${
                  active
                    ? "bg-teal-dark dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-semibold"
                    : "hover:bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft"
                }`}
              >
                <span className={active ? "text-teal-dark dark:text-accent-lime" : "text-grey-green dark:text-[#8FA29B]"}>
                  {item.icon}
                </span>
                {(!isCollapsed || isMobile) && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: Sign Out Button */}
      <div className="shrink-0 space-y-3 pt-3">
        <button
          onClick={handleSignOut}
          aria-label="Sign out of your account"
          title={isCollapsed && !isMobile ? "Sign Out" : undefined}
          className={`w-full flex items-center justify-center ${
            isCollapsed && !isMobile ? "p-2.5" : "gap-2 px-3 py-2.5"
          } rounded-xl text-xs font-semibold text-destructive dark:text-[#be747e] hover:text-destructive dark:text-[#be747e] bg-destructive/10 dark:bg-[#be747e]/10 hover:bg-destructive/20 dark:hover:bg-[#be747e]/20 transition cursor-pointer border border-destructive/30 dark:border-[#be747e]/30/60 shadow-2xs focus:outline-none focus:ring-2 focus:ring-destructive dark:focus:ring-[#be747e] focus:ring-offset-2`}
        >
          <LogOut size={16} aria-hidden="true" />
          {(!isCollapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream-light dark:bg-[#121616] text-[#0F172A] flex font-sans antialiased selection:bg-purple-100">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-teal-dark focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-dark focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* LEFT SIDEBAR - Mobile: Sheet, Desktop: Fixed aside */}
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[250px] p-0 bg-white dark:bg-[#1C2323]">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
            </SheetHeader>
            <div className="h-full flex flex-col justify-between py-4 px-3">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <aside
          role="navigation"
          aria-label="Admin sidebar"
          className={`${
            isCollapsed ? "w-[72px]" : "w-[250px]"
          } transition-all duration-300 ease-in-out h-screen fixed left-0 top-0 bg-white dark:bg-[#1C2323] border-r border-mist-green dark:border-[#2A3838] flex flex-col justify-between shrink-0 select-none py-4 px-3 z-30`}
        >
          {sidebarContent}
        </aside>
      )}

      {/* RIGHT MAIN CANVAS */}
      <div className={`flex-1 flex flex-col min-w-0 bg-cream-light dark:bg-[#121616] min-h-screen ${isMobile ? "ml-0" : isCollapsed ? "ml-[72px]" : "ml-[250px]"} transition-all duration-300 ease-in-out`}>
        {/* TOP NAVBAR */}
        <header
          role="banner"
          className="h-16 bg-white dark:bg-[#1C2323] border-b border-mist-green dark:border-[#2A3838] px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20"
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="p-2 rounded-lg text-grey-green dark:text-[#8FA29B] hover:text-ink dark:hover:text-cream-soft hover:bg-mist-green/50 dark:hover:bg-[#2A3838] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime"
              >
                <Menu size={20} aria-hidden="true" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-ink dark:text-cream-soft">
                {navMeta[activeTab]?.title || "Overview"}
              </h1>
              <p className="text-xs text-grey-green dark:text-[#8FA29B] flex items-center gap-1">
                {navMeta[activeTab]?.desc || "Welcome back, Admin"}
              </p>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-3 text-xs">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="p-2.5 rounded-xl border border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-grey-green dark:text-[#8FA29B] hover:bg-cream-light dark:hover:bg-[#232D2D] transition shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime focus:ring-offset-2"
            >
              {theme === "dark" ? (
                <Sun size={16} aria-hidden="true" />
              ) : (
                <Moon size={16} aria-hidden="true" />
              )}
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setNotificationsOpen(true)}
              aria-label="View notifications"
              aria-haspopup="dialog"
              className="relative p-2.5 rounded-xl border border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-grey-green dark:text-[#8FA29B] hover:bg-cream-light dark:hover:bg-[#232D2D] transition shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime focus:ring-offset-2"
            >
              <Bell size={16} aria-hidden="true" />
              <span
                aria-label="3 unread notifications"
                className="absolute top-1.5 right-1.5 size-4 rounded-full bg-destructive/10 dark:bg-[#be747e]/100 text-white text-[9px] font-bold flex items-center justify-center"
              >
                3
              </span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2.5 pl-2">
              <div
                className="size-9 rounded-full bg-teal-dark dark:bg-accent-lime text-white dark:text-ink font-bold text-xs flex items-center justify-center overflow-hidden border border-mist-green dark:border-[#2A3838]"
                aria-hidden="true"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span>
                    {(() => {
                      const name = user?.name || user?.email || "";
                      const parts = name.split(/[@.\s]+/).filter(Boolean);
                      if (parts.length >= 2)
                        return (parts[0][0] + parts[1][0]).toUpperCase();
                      return (name.slice(0, 2) || "AD").toUpperCase();
                    })()}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight hidden md:block">
                <div className="font-semibold text-xs text-ink dark:text-cream-soft">
                  {user?.name || user?.email?.split("@")[0] || "Admin"}
                </div>
                <div className="text-[10px] text-grey-green dark:text-[#8FA29B] flex items-center gap-0.5">
                  {user?.role?.toUpperCase() || "ADMIN"} <ChevronDown size={10} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main
          id="main-content"
          ref={mainContentRef}
          role="main"
          tabIndex={-1}
          className="p-4 md:p-8 space-y-6 max-w-[1400px] w-full mx-auto focus:outline-none"
          aria-label={navMeta[activeTab]?.title || "Admin content"}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
