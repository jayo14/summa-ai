import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Database,
  DollarSign,
  Download,
  Filter,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "instructor" | "student";
  status: "active" | "suspended";
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

interface AdminStats {
  overview: {
    total_users: number;
    active_users: number;
    students: number;
    instructors: number;
    admins: number;
    dau: number;
    total_messages: number;
    cognee_memories_indexed: number;
    study_materials_uploaded: number;
    quizzes_completed: number;
  };
  telemetry: {
    total_tokens_used: number;
    input_tokens: number;
    output_tokens: number;
    estimated_cost_usd: number;
    avg_response_latency_ms: number;
    cache_hit_rate_pct: number;
    vector_search_latency_ms: number;
  };
  popular_topics: {
    name: string;
    sessions: number;
    mastery_avg: number;
  }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "audit">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, auditRes] = await Promise.all([
        fetch("/api/v1/admin/stats"),
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/admin/audit-logs"),
      ]);

      if (statsRes.ok) {
        const sJson = await statsRes.json();
        setStats(sJson.data);
      }
      if (usersRes.ok) {
        const uJson = await usersRes.json();
        setUsers(uJson.users || []);
      }
      if (auditRes.ok) {
        const aJson = await auditRes.json();
        setAuditLogs(aJson.audit_logs || []);
      }
    } catch (err) {
      toast.error("Failed to load admin telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Role update failed");

      toast.success(`User role updated to ${newRole.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to update user role.");
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");

      toast.success(`User account status set to ${newStatus.toUpperCase()}`);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-slate-300">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-purple-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">Summa AI Admin & Platform Usage</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <Lock size={11} /> RBAC Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor active learners, AI response token usage, Cognee vector indexing, and manage access roles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh Telemetry
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "overview" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 size={14} /> Platform Telemetry
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "users" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users size={14} /> User Management & RBAC ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "audit" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert size={14} /> Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users size={13} className="text-purple-400" /> Active Students
              </span>
              <div className="text-2xl font-bold text-white">{stats.overview.total_users}</div>
              <div className="text-[11px] text-emerald-400 font-medium">DAU: {stats.overview.dau} online</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MessageSquare size={13} className="text-indigo-400" /> Total Messages
              </span>
              <div className="text-2xl font-bold text-white">{stats.overview.total_messages.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500">Conversations & Turns</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Brain size={13} className="text-cyan-400" /> Memory Vectors
              </span>
              <div className="text-2xl font-bold text-white">{stats.overview.cognee_memories_indexed}</div>
              <div className="text-[11px] text-slate-500">Cognee Graph Memories</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Zap size={13} className="text-amber-400" /> Token Usage
              </span>
              <div className="text-2xl font-bold text-white">{(stats.telemetry.total_tokens_used / 1000).toFixed(1)}k</div>
              <div className="text-[11px] text-amber-400/90 font-medium">Est. Cost: ${stats.telemetry.estimated_cost_usd}</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Activity size={13} className="text-emerald-400" /> Response Speed
              </span>
              <div className="text-2xl font-bold text-white">{stats.telemetry.avg_response_latency_ms.toFixed(0)} ms</div>
              <div className="text-[11px] text-emerald-400">Cache hit: {stats.telemetry.cache_hit_rate_pct}%</div>
            </div>
          </div>

          {/* Engagement & Token Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Popular Topics */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-purple-400" />
                  <h2 className="text-sm font-bold text-white">Popular Course Topics & Mastery</h2>
                </div>
                <span className="text-xs text-slate-500 font-mono">CSC 201 Scope</span>
              </div>

              <div className="space-y-3">
                {stats.popular_topics.map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{t.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.sessions} interactive study sessions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">{t.mastery_avg}% mastery</div>
                      <div className="text-[10px] text-slate-500">Average retention</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Telemetry Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="size-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">AI Engine & Latency</h2>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Input Prompt Tokens</span>
                  <span className="font-mono text-slate-200 font-semibold">{stats.telemetry.input_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Output Response Tokens</span>
                  <span className="font-mono text-slate-200 font-semibold">{stats.telemetry.output_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Vector Search Latency</span>
                  <span className="font-mono text-emerald-400 font-semibold">{stats.telemetry.vector_search_latency_ms} ms</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Study Materials Uploaded</span>
                  <span className="font-mono text-slate-200 font-semibold">{stats.overview.study_materials_uploaded} documents</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400">Quizzes Completed</span>
                  <span className="font-mono text-purple-300 font-semibold">{stats.overview.quizzes_completed} quizzes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT & RBAC TAB */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, degree..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={13} className="text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Roles</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">RBAC Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Degree / Specialization</th>
                  <th className="p-3.5">Last Active</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/60 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{u.name || "Student Learner"}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs font-semibold rounded-md px-2.5 py-1 border focus:outline-none cursor-pointer ${
                          u.role === "admin"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : u.role === "instructor"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                        }`}
                      >
                        <option value="student" className="bg-slate-900 text-white">Student</option>
                        <option value="instructor" className="bg-slate-900 text-white">Instructor</option>
                        <option value="admin" className="bg-slate-900 text-white">Admin</option>
                      </select>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {u.status === "active" ? <CheckCircle2 size={10} /> : <UserX size={10} />}
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-400">
                      {u.onboarding_data?.degree || "CSC 201 · Computer Science"}
                    </td>

                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {u.last_active ? new Date(u.last_active).toLocaleString() : "Recently"}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleStatusChange(u.id, u.status)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                          u.status === "active"
                            ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                        }`}
                      >
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === "audit" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 text-xs font-mono text-slate-400">
            Security & Role Change Audit Log
          </div>
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target User</th>
                <th className="p-3.5">Audit Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/60 transition">
                  <td className="p-3.5 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-semibold text-purple-300">{log.actor_email}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{log.target_email}</td>
                  <td className="p-3.5 text-slate-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
