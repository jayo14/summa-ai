import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Bell,
  BookOpen,
  Building,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Database,
  Download,
  Eye,
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
  PenSquare,
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
  Star,
  Trash2,
  User,
  Users,
  UserX,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// --- REUSABLE UI BADGES & METRIC CARDS ---

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let bg = "bg-slate-100 text-slate-700 border border-slate-200";
  let dot = "bg-slate-500";

  if (["active", "published", "completed", "operational", "successful", "paid", "delivered", "resolved"].includes(s)) {
    bg = "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    dot = "bg-emerald-500";
  } else if (["pending", "processing", "scheduled", "trial", "draft", "in review", "open"].includes(s)) {
    bg = "bg-amber-50 text-amber-700 border border-amber-200/60";
    dot = "bg-amber-500";
  } else if (["suspended", "inactive", "failed", "degraded", "cancelled", "unread", "offline", "high"].includes(s)) {
    bg = "bg-rose-50 text-rose-700 border border-rose-200/60";
    dot = "bg-rose-500";
  } else if (["live", "pro", "enterprise"].includes(s)) {
    bg = "bg-indigo-50 text-indigo-700 border border-indigo-200/60";
    dot = "bg-indigo-500 animate-pulse";
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
        <Info size={13} className="text-slate-400 cursor-pointer" />
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

// --- 1. USERS PAGE & DRAWER ---

interface AdminUserItem {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  avatar?: string;
  provider?: string;
  onboarded: boolean;
  onboarding_data?: {
    degree?: string;
    field_of_study?: string;
    institution?: string;
    subscription?: string;
  };
  last_active?: string;
  created_at?: string;
}

export function UsersView({
  users = [],
  onUserClick,
  onRoleChange,
  onStatusChange,
  onRefresh,
}: {
  users?: AdminUserItem[];
  onUserClick: (user: any) => void;
  onRoleChange?: (userId: string, newRole: string) => void;
  onStatusChange?: (userId: string, currentStatus: string) => void;
  onRefresh?: () => void;
}) {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("user");
  const [addInstitution, setAddInstitution] = useState("");

  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status?.toLowerCase() === "active").length;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newUsersCount = users.filter((u) => u.created_at && new Date(u.created_at) >= thirtyDaysAgo).length;
  const studentsCount = users.filter((u) => u.role?.toLowerCase() === "user" || u.role?.toLowerCase() === "student").length;
  const lecturersCount = users.filter((u) => u.role?.toLowerCase() === "instructor" || u.role?.toLowerCase() === "lecturer").length;
  const adminsCount = users.filter((u) => u.role?.toLowerCase() === "admin").length;

  const filteredUsers = users.filter((u) => {
    const displayName = u.name || u.email.split("@")[0];
    const institutionName = u.onboarding_data?.institution || u.onboarding_data?.field_of_study || "";
    const haystack = `${displayName} ${u.email} ${institutionName}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    
    let userRoleCategory = "user";
    if (u.role?.toLowerCase() === "admin") userRoleCategory = "admin";
    else if (u.role?.toLowerCase() === "instructor" || u.role?.toLowerCase() === "lecturer") userRoleCategory = "instructor";

    const matchesRole = roleFilter === "ALL" || userRoleCategory === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    if (!addEmail.trim() || !addName.trim()) {
      toast.error("Name and Email are required");
      return;
    }
    try {
      await fetchApi("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: addName.trim(),
          email: addEmail.trim(),
          role: addRole,
          institution: addInstitution.trim() || undefined,
        }),
      });
      toast.success("User added successfully!");
      setShowAddModal(false);
      setAddName("");
      setAddEmail("");
      setAddInstitution("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Users" value={totalUsersCount.toLocaleString()} change="+100% DB" strokeColor="#8B5CF6" />
        <MetricCard title="Active Users" value={activeUsersCount.toLocaleString()} change={`${totalUsersCount ? roundPercent((activeUsersCount / totalUsersCount) * 100) : 0}% active`} strokeColor="#10B981" />
        <MetricCard title="New Users (30d)" value={newUsersCount.toLocaleString()} change="Realtime" strokeColor="#3B82F6" />
        <MetricCard title="Students" value={studentsCount.toLocaleString()} change="Role: User" strokeColor="#8B5CF6" />
        <MetricCard title="Lecturers" value={lecturersCount.toLocaleString()} change="Role: Instructor" strokeColor="#10B981" />
        <MetricCard title="Administrators" value={adminsCount.toLocaleString()} change="Role: Admin" strokeColor="#F59E0B" />
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
              placeholder="Search by name, email, or institution..."
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
              <option value="user">Students / Users</option>
              <option value="instructor">Lecturers / Instructors</option>
              <option value="admin">Admins</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Plus size={14} /> Add User
            </button>
          </div>
        </div>

        {/* Fixed Header & Scrollable Body Container */}
        <div className="w-full rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          {/* Fixed Header Table */}
          <div className="w-full bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <table className="w-full text-left text-xs min-w-[700px] table-fixed">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[12%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">USER</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">ROLE</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">INSTITUTION</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">STATUS</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">SUBSCRIPTION</th>
                  <th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">JOINED</th>
                  <th className="p-4 text-right text-slate-500 font-bold uppercase text-[10px] tracking-wider">ACTION</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Body Table */}
          <ScrollArea className="w-full h-[460px]">
            <table className="w-full text-left text-xs min-w-[700px] table-fixed">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[12%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
              </colgroup>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const displayName = u.name || u.email.split("@")[0];
                    const institutionDisplay = u.onboarding_data?.institution || u.onboarding_data?.field_of_study || "nil";
                    const subscriptionDisplay = u.onboarding_data?.subscription || "nil";
                    const formattedJoined = u.created_at
                      ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "May 12, 2024";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => onUserClick(u)}>
                        <td className="p-4 truncate">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-[#6366F1]/10 text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{displayName}</div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-700 capitalize">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {u.role === "admin" ? "ADMIN" : u.role === "instructor" ? "LECTURER" : "STUDENT"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-medium truncate">{institutionDisplay}</td>
                        <td className="p-4"><StatusBadge status={u.status || "Active"} /></td>
                        <td className="p-4 font-medium text-slate-900 uppercase text-[11px]">{subscriptionDisplay}</td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">{formattedJoined}</td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {onRoleChange && (
                              <button
                                onClick={() => onRoleChange(u.id, u.role === "admin" ? "user" : "admin")}
                                title="Toggle Role"
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#6366F1] hover:bg-[#6366F1]/10 transition shrink-0"
                              >
                                {u.role === "admin" ? "Make User" : "Make Admin"}
                              </button>
                            )}
                            {onStatusChange && (
                              <button
                                onClick={() => onStatusChange(u.id, u.status)}
                                title="Toggle Account Status"
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                                  u.status === "suspended" ? "text-emerald-600 hover:bg-emerald-50" : "text-rose-600 hover:bg-rose-50"
                                }`}
                              >
                                {u.status === "suspended" ? "Activate" : "Suspend"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium text-xs">
                      No users matching search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Samuel Okon"
                  className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="e.g. samuel@unilag.edu.ng"
                  className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none"
                  >
                    <option value="user">Student (User)</option>
                    <option value="instructor">Lecturer (Instructor)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={addInstitution}
                    onChange={(e) => setAddInstitution(e.target.value)}
                    placeholder="e.g. University of Lagos or nil"
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-slate-700 font-semibold text-xs">
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 rounded-xl bg-[#6366F1] text-white font-semibold text-xs hover:bg-[#4F46E5] transition"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function roundPercent(val: number) {
  return Math.round(val * 10) / 10;
}

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
                    <div className="font-bold text-slate-900 mt-0.5 truncate">{user.institution || user.onboarding_data?.institution || user.onboarding_data?.field_of_study || "nil"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                    <div className="text-[10px] text-slate-400">Subscription</div>
                    <div className="font-bold text-slate-900 mt-0.5">{user.sub || user.onboarding_data?.subscription || "nil"}</div>
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
          <button onClick={() => toast.warning("User suspended.")} className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-semibold text-xs hover:bg-rose-50 transition cursor-pointer">
            Suspend Account
          </button>
          <button onClick={() => toast.success("User details saved.")} className="flex-1 py-2.5 rounded-xl bg-[#6366F1] text-white font-semibold text-xs hover:bg-[#4F46E5] transition cursor-pointer">
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. INSTITUTIONS PAGE ---

export function InstitutionsView() {
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [insts, setInsts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Federal");
  const [plan, setPlan] = useState("Enterprise");

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any>("/admin/institutions");
      if (res?.institutions) {
        setInsts(res.institutions);
      }
    } catch (err) {
      toast.error("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleCreate = async () => {
    if (!name) {
      toast.error("Institution name is required");
      return;
    }
    try {
      await fetchApi("/admin/institutions", {
        method: "POST",
        body: JSON.stringify({ name, type, plan }),
      });
      toast.success("Institution registered successfully!");
      setShowAddModal(false);
      setName("");
      fetchInstitutions();
    } catch (err) {
      toast.error("Failed to add institution.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Institutions" value={insts.length.toString()} change="+13.3%" strokeColor="#3B82F6" />
        <MetricCard title="Active Institutions" value={insts.filter(i => i.status === "active").length.toString()} change="+10.0%" strokeColor="#10B981" />
        <MetricCard title="Enterprise Institutions" value={insts.filter(i => i.plan === "Enterprise").length.toString()} change="+25.0%" strokeColor="#8B5CF6" />
        <MetricCard title="Institution Users" value="7,203" change="+18.4%" strokeColor="#3B82F6" />
        <MetricCard title="Institution MRR" value={`₦${insts.reduce((acc, curr) => acc + (curr.mrr || 0), 0).toLocaleString()}`} change="+22.1%" strokeColor="#10B981" />
        <MetricCard title="Pending Trials" value="3" change="-1" isPositive={false} strokeColor="#F59E0B" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Registered Institutions</h3>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition flex items-center gap-2 shadow-2xs cursor-pointer">
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
                <tr key={idx} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedInst(i)}>
                  <td className="p-4 font-bold text-slate-900">{i.name}</td>
                  <td className="p-4 text-slate-600">{i.type}</td>
                  <td className="p-4 font-mono text-slate-700">{i.users}</td>
                  <td className="p-4 font-mono text-slate-700">{i.active}</td>
                  <td className="p-4 font-semibold text-slate-900">{i.plan}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">₦{(i.mrr || 0).toLocaleString()}</td>
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add Partner Institution</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Obafemi Awolowo University" className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category / Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900">
                    <option value="Federal">Federal</option>
                    <option value="State">State</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plan</label>
                  <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900">
                    <option value="Enterprise">Enterprise</option>
                    <option value="Pro">Pro</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-slate-700 font-semibold text-xs">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-[#6366F1] text-white font-semibold text-xs hover:bg-[#4F46E5] transition">Register Institution</button>
            </div>
          </div>
        </div>
      )}

      {selectedInst && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedInst.name}</h3>
                <p className="text-xs text-slate-400 font-mono">ID: INST-{selectedInst.name.substring(0, 4).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedInst(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                <div className="text-slate-400 text-[10px]">Type</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedInst.type}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                <div className="text-slate-400 text-[10px]">Plan</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedInst.plan}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                <div className="text-slate-400 text-[10px]">Monthly Recurring Revenue</div>
                <div className="font-bold text-[#10B981] font-mono mt-0.5">{selectedInst.mrr}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                <div className="text-slate-400 text-[10px]">Status</div>
                <div className="mt-1"><StatusBadge status={selectedInst.status} /></div>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <h4 className="font-bold text-slate-900">Institutional Usage Telemetry</h4>
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex justify-between"><span>Registered Students:</span><span className="font-mono font-bold">{selectedInst.users}</span></div>
                <div className="flex justify-between"><span>Active Students (30d):</span><span className="font-mono font-bold">{selectedInst.active}</span></div>
                <div className="flex justify-between"><span>AI Tokens Consumed:</span><span className="font-mono font-bold">14.2M</span></div>
                <div className="flex justify-between"><span>Quizzes Completed:</span><span className="font-mono font-bold">4,120</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex gap-3">
              <button onClick={() => toast.success("Institution details updated.")} className="flex-1 py-2.5 rounded-xl bg-[#6366F1] text-white font-semibold text-xs hover:bg-[#4F46E5] transition">
                Manage Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 3. ANALYTICS PAGE ---

export function AnalyticsView({ stats }: { stats?: any }) {
  const overview = stats?.overview || {};
  const telemetry = stats?.telemetry || {};
  const popularTopics = stats?.popular_topics || [];

  const totalUsers = overview.total_users || 0;
  const activeUsers = overview.active_users || 0;
  const dauWauRatio = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) + "%" : "0.0%";

  const totalMessages = overview.total_messages || 0;
  const totalTokens = telemetry.total_tokens_used
    ? (telemetry.total_tokens_used > 1000000 ? (telemetry.total_tokens_used / 1000000).toFixed(1) + "M" : (telemetry.total_tokens_used / 1000).toFixed(1) + "k")
    : "0";

  const quizzesCompleted = overview.quizzes_completed || 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="DAU / WAU Ratio" value={dauWauRatio} change="+3.2%" strokeColor="#10B981" />
        <MetricCard title="AI Requests (Total)" value={totalMessages.toLocaleString()} change="Realtime" strokeColor="#8B5CF6" />
        <MetricCard title="AI Tokens Consumed" value={totalTokens} change={`$${telemetry.estimated_cost_usd || 0}`} strokeColor="#3B82F6" />
        <MetricCard title="Quiz Attempts" value={quizzesCompleted.toLocaleString()} change="Verified DB" strokeColor="#10B981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Learning Topics Breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Popular Learning Topics</h3>
              <p className="text-xs text-slate-400">Most requested study modules across active users</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Live Telemetry</span>
          </div>

          <div className="space-y-3">
            {popularTopics.length > 0 ? (
              popularTopics.map((topic: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{topic.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{topic.sessions} active practice sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-[#10B981]">{topic.mastery_avg}%</div>
                    <div className="text-[10px] text-slate-400">Avg. Mastery</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">No popular topics logged yet.</div>
            )}
          </div>
        </div>

        {/* AI Telemetry & Latency Breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI Telemetry & Model Performance</h3>
              <p className="text-xs text-slate-400">LLM token distribution and response latency breakdown</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-semibold">Operational</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
              <div className="text-slate-400 text-[10px]">Input Prompt Tokens</div>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{(telemetry.input_tokens || 0).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
              <div className="text-slate-400 text-[10px]">Output Completion Tokens</div>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{(telemetry.output_tokens || 0).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
              <div className="text-slate-400 text-[10px]">Average Response Latency</div>
              <div className="font-mono font-bold text-[#8B5CF6] text-sm mt-0.5">{telemetry.avg_response_latency_ms || 1120} ms</div>
            </div>
            <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl">
              <div className="text-slate-400 text-[10px]">Vector Search Latency</div>
              <div className="font-mono font-bold text-[#10B981] text-sm mt-0.5">{telemetry.vector_search_latency_ms || 48.2} ms</div>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Estimated LLM Infrastructure Cost:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">${telemetry.estimated_cost_usd || 0.35} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 4. SUBSCRIPTIONS PAGE ---

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
          <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">{plan.name}</div>
            <div className="text-xl font-bold text-slate-900">{plan.price} <span className="text-xs text-slate-400 font-normal">{plan.period}</span></div>
            <div className="pt-2 border-t border-[#E2E8F0] flex justify-between text-xs">
              <span className="text-slate-400">Subscribers:</span>
              <span className="font-bold text-slate-900">{plan.subs}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Monthly Revenue:</span>
              <span className="font-bold font-mono text-[#10B981]">{plan.mrr}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 5. REVENUE PAGE ---

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
          <button onClick={() => toast.success("Exporting transactions CSV...")} className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer">
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

// --- 6. ENGAGEMENT PAGE ---

export function EngagementView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="User Retention (30d)" value="68.4%" change="+5.1%" strokeColor="#10B981" />
        <MetricCard title="Avg Session Duration" value="24.5m" change="+2.4m" strokeColor="#8B5CF6" />
        <MetricCard title="AI Conversations" value="42,100" change="+18.9%" strokeColor="#3B82F6" />
        <MetricCard title="Quiz Completion Rate" value="84.2%" change="+3.0%" strokeColor="#10B981" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900">Student Activation & Conversion Funnel</h3>
        <div className="space-y-3 pt-2">
          {[
            { step: "Registered Users", count: "12,241", pct: "100%" },
            { step: "Activated Account", count: "10,480", pct: "85.6%" },
            { step: "First AI Session", count: "9,210", pct: "75.2%" },
            { step: "Completed Quiz", count: "8,410", pct: "68.7%" },
            { step: "Active Subscriber", count: "2,780", pct: "22.7%" },
          ].map((f, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">{f.step}</span>
                <span className="font-mono text-slate-500">{f.count} ({f.pct})</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#6366F1]" style={{ width: f.pct }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 7. CONTENT PAGE ---

export function ContentView() {
  const contentItems = [
    { title: "CSC 201: Object-Oriented Programming Notes", type: "Course", inst: "University of Lagos", author: "Dr. Vance", views: "14,210", status: "Published" },
    { title: "Data Structures & Algorithms Slide Deck", type: "Lecture", inst: "LASUSTECH", author: "Prof. Okoro", views: "9,840", status: "Published" },
    { title: "Database Systems Past Questions 2023", type: "Document", inst: "University of Ibadan", author: "Dr. Alabi", views: "18,400", status: "Published" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Content Objects" value="1,480" change="+12.4%" strokeColor="#8B5CF6" />
        <MetricCard title="Published Content" value="1,240" change="+8.1%" strokeColor="#10B981" />
        <MetricCard title="Total Views (30d)" value="342,000" change="+24.0%" strokeColor="#3B82F6" />
        <MetricCard title="Downloads" value="48,200" change="+15.2%" strokeColor="#10B981" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Academic Content Repository</h3>
          <button onClick={() => toast.info("Content upload modal opened.")} className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition flex items-center gap-2 cursor-pointer">
            <Plus size={14} /> Upload Content
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-400 border-b border-[#E2E8F0] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">CONTENT TITLE</th>
              <th className="p-4">TYPE</th>
              <th className="p-4">INSTITUTION</th>
              <th className="p-4">AUTHOR</th>
              <th className="p-4">VIEWS</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {contentItems.map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-slate-900">{c.title}</td>
                <td className="p-4 text-slate-600">{c.type}</td>
                <td className="p-4 text-slate-600">{c.inst}</td>
                <td className="p-4 text-slate-600">{c.author}</td>
                <td className="p-4 font-mono text-slate-700">{c.views}</td>
                <td className="p-4"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 8. QUIZZES & RESULTS PAGE ---

export function QuizzesView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Quizzes" value="420" change="+14.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Total Attempts" value="34,190" change="+21.0%" strokeColor="#3B82F6" />
        <MetricCard title="Average Score" value="78.4%" change="+2.1%" strokeColor="#10B981" />
        <MetricCard title="Pass Rate" value="84.2%" change="+1.5%" strokeColor="#10B981" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900">Recent Assessment Runs</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-400 border-b border-[#E2E8F0] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">QUIZ NAME</th>
              <th className="p-4">COURSE</th>
              <th className="p-4">ATTEMPTS</th>
              <th className="p-4">AVG SCORE</th>
              <th className="p-4">PASS RATE</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {[
              { name: "Calculus & Derivatives Checkpoint", course: "MAT 101", att: "1,420", score: "82.4%", pass: "89.1%", status: "Active" },
              { name: "Object-Oriented Design Principles", course: "CSC 201", att: "2,150", score: "76.0%", pass: "81.4%", status: "Active" },
            ].map((q, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-slate-900">{q.name}</td>
                <td className="p-4 text-slate-600">{q.course}</td>
                <td className="p-4 font-mono text-slate-700">{q.att}</td>
                <td className="p-4 font-mono font-bold text-slate-900">{q.score}</td>
                <td className="p-4 font-mono font-bold text-emerald-600">{q.pass}</td>
                <td className="p-4"><StatusBadge status={q.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 9. LIVE SESSIONS PAGE ---

export function LiveSessionsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Live Sessions Now" value="3" change="Active" strokeColor="#10B981" />
        <MetricCard title="Sessions Today" value="14" change="+4" strokeColor="#3B82F6" />
        <MetricCard title="Total Participants Today" value="1,840" change="+18.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Avg Attendance Rate" value="88.5%" change="+3.2%" strokeColor="#10B981" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Live Broadcast Monitor</h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            3 Streams Streaming Live
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-400 border-b border-[#E2E8F0] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">SESSION TITLE</th>
              <th className="p-4">HOST / LECTURER</th>
              <th className="p-4">INSTITUTION</th>
              <th className="p-4">PARTICIPANTS</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {[
              { title: "CSC 201: Dynamic Dispatch Review", host: "Dr. Marcus Vance", inst: "University of Lagos", parts: "248 live", status: "Live" },
              { title: "PHY 102: Electromagnetic Waves", host: "Prof. Kenneth Okoro", inst: "University of Ibadan", parts: "182 live", status: "Live" },
              { title: "MAT 204: Linear Algebra Q&A", host: "Dr. Sarah Alabi", inst: "LASUSTECH", parts: "94 live", status: "Live" },
            ].map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-slate-900">{s.title}</td>
                <td className="p-4 text-slate-600">{s.host}</td>
                <td className="p-4 text-slate-600">{s.inst}</td>
                <td className="p-4 font-mono font-bold text-[#6366F1]">{s.parts}</td>
                <td className="p-4"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 10. MESSAGES PAGE ---

export function MessagesView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Messages Sent (30d)" value="14,280" change="+19.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Delivery Rate" value="99.4%" change="+0.2%" strokeColor="#10B981" />
        <MetricCard title="Read Rate" value="82.9%" change="+3.1%" strokeColor="#3B82F6" />
        <MetricCard title="Failed Messages" value="90" change="-12" strokeColor="#10B981" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Broadcast & Announcement Center</h3>
          <button onClick={() => toast.info("Composer opened.")} className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition flex items-center gap-2 cursor-pointer">
            <Send size={14} /> Compose Message
          </button>
        </div>

        <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-slate-500">
          Select target audience (All Institutions, Specific Students, or Lecturers) to send push announcements.
        </div>
      </div>
    </div>
  );
}

// --- 11. FEEDBACK PAGE ---

export function FeedbackView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Feedback" value="640" change="+8.4%" strokeColor="#8B5CF6" />
        <MetricCard title="Average Rating" value="4.8 / 5.0" change="+0.1" strokeColor="#10B981" />
        <MetricCard title="Open Bug Reports" value="12" change="-4" strokeColor="#10B981" />
        <MetricCard title="Feature Requests" value="118" change="+14" strokeColor="#3B82F6" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900">User Satisfaction & Reports</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-400 border-b border-[#E2E8F0] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">USER</th>
              <th className="p-4">TYPE</th>
              <th className="p-4">RATING</th>
              <th className="p-4">MESSAGE</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {[
              { user: "Amina Bello", type: "Feature Request", rating: "5 ★", msg: "Would love dark mode export for flashcard sets!", status: "Open" },
              { user: "John Doe", type: "Bug Report", rating: "4 ★", msg: "Quiz timer paused on tab switch.", status: "In Review" },
            ].map((f, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-slate-900">{f.user}</td>
                <td className="p-4 text-slate-600">{f.type}</td>
                <td className="p-4 font-bold text-amber-500">{f.rating}</td>
                <td className="p-4 text-slate-700">{f.msg}</td>
                <td className="p-4"><StatusBadge status={f.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 12. INTEGRATIONS PAGE ---

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
              <button onClick={() => toast.info(`Configuring ${item.name}`)} className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
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

export function AdminSettingsView() {
  const [platformName, setPlatformName] = useState("Summa AI");
  const [defaultCurrency, setDefaultCurrency] = useState("NGN");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [websocketEnabled, setWebsocketEnabled] = useState(true);
  const [hybridMemoryEnabled, setHybridMemoryEnabled] = useState(true);
  const [summastudyEnabled, setSummastudyEnabled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any>("/admin/settings");
      if (res?.settings) {
        setPlatformName(res.settings.platform_name || "Summa AI");
        setDefaultCurrency(res.settings.default_currency || "NGN");
        setMaintenanceMode(Boolean(res.settings.maintenance_mode));
        setWebsocketEnabled(Boolean(res.settings.websocket_enabled));
        setHybridMemoryEnabled(Boolean(res.settings.hybrid_memory_enabled));
        setSummastudyEnabled(Boolean(res.settings.summastudy_enabled));
      }
    } catch (err) {
      toast.error("Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (overrideData?: Record<string, any>) => {
    setIsSaving(true);
    const body = overrideData || {
      platform_name: platformName,
      default_currency: defaultCurrency,
      maintenance_mode: maintenanceMode,
      websocket_enabled: websocketEnabled,
      hybrid_memory_enabled: hybridMemoryEnabled,
      summastudy_enabled: summastudyEnabled,
    };

    try {
      const res = await fetchApi<any>("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      if (res?.settings) {
        setPlatformName(res.settings.platform_name);
        setDefaultCurrency(res.settings.default_currency);
        setMaintenanceMode(Boolean(res.settings.maintenance_mode));
        setWebsocketEnabled(Boolean(res.settings.websocket_enabled));
        setHybridMemoryEnabled(Boolean(res.settings.hybrid_memory_enabled));
        setSummastudyEnabled(Boolean(res.settings.summastudy_enabled));
        toast.success("Platform settings and feature flags updated!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update platform settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: string, currentValue: boolean, setter: (val: boolean) => void) => {
    const newValue = !currentValue;
    setter(newValue);
    handleSaveSettings({ [key]: newValue });
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-3xl space-y-4 shadow-2xs text-xs text-slate-500">
        Loading platform settings & feature flags...
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-3xl space-y-6 shadow-2xs text-xs">
      <div className="border-b border-[#E2E8F0] pb-4 space-y-1">
        <h3 className="font-bold text-base text-slate-900">Platform Settings & Feature Flags</h3>
        <p className="text-slate-400">Configure global Summa AI admin behavior, operational switches, and feature toggles.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700">Platform Name</label>
          <input
            type="text"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700">Default Currency</label>
          <select
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none focus:border-[#6366F1]"
          >
            <option value="NGN">Nigerian Naira (₦ - NGN)</option>
            <option value="USD">US Dollar ($ - USD)</option>
          </select>
        </div>

        {/* Feature Flags Section */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
            Global Feature Flags
          </h4>

          {/* WebSocket Feature Flag */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">WebSocket Realtime Engine (WEBSOCKET_ENABLED)</div>
              <div className="text-slate-400 text-[11px]">Enables low-latency bidirectional socket connections for live study streams.</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("websocket_enabled", websocketEnabled, setWebsocketEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                websocketEnabled ? "bg-[#6366F1]" : "bg-slate-300"
              }`}
            >
              <div
                className={`size-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  websocketEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Hybrid Memory Feature Flag */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Hybrid Memory Layer (HYBRID_MEMORY_ENABLED)</div>
              <div className="text-slate-400 text-[11px]">Activates Cognee graph memory and Qdrant vector retrieval during chat sessions.</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("hybrid_memory_enabled", hybridMemoryEnabled, setHybridMemoryEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                hybridMemoryEnabled ? "bg-[#6366F1]" : "bg-slate-300"
              }`}
            >
              <div
                className={`size-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  hybridMemoryEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* SummaStudy Integration Feature Flag */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">SummaStudy API Integration (SUMMASTUDY_ENABLED)</div>
              <div className="text-slate-400 text-[11px]">Gates microservice requests for study planner, spaced repetition, & recommendations.</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("summastudy_enabled", summastudyEnabled, setSummastudyEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                summastudyEnabled ? "bg-[#6366F1]" : "bg-slate-300"
              }`}
            >
              <div
                className={`size-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  summastudyEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Maintenance Mode</div>
              <div className="text-slate-400 text-[11px]">Temporarily restrict student portal access for core backend updates.</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("maintenance_mode", maintenanceMode, setMaintenanceMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                maintenanceMode ? "bg-rose-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`size-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
        <button
          onClick={loadSettings}
          className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          Reset
        </button>
        <button
          onClick={() => handleSaveSettings()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[#6366F1] text-white font-semibold hover:bg-[#4F46E5] transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// --- 13B. COMPONENTS LIBRARY PAGE (Mirror-Perfect Implementation) ---

export function ComponentsView() {
  const [search, setSearch] = useState("");

  const components = [
    // --- CORE LEARNING ---
    {
      id: "multiple_choice",
      title: "1. Multiple Choice",
      category: "Core Learning",
      desc: "Question + options + instant feedback. Pick the best answer to test baseline comprehension.",
      badgeBg: "bg-blue-100/80 text-blue-600",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-center space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-800 leading-tight">
            What is the main function of mitochondria?
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-slate-600">
              <div className="size-2.5 rounded-full border border-slate-300" />
              <span>Protein synthesis</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-slate-700 bg-blue-50/80 border border-blue-200/60 font-medium">
              <div className="size-2.5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <div className="size-1 rounded-full bg-blue-500" />
              </div>
              <span>Energy production (ATP)</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-slate-600">
              <div className="size-2.5 rounded-full border border-slate-300" />
              <span>Cellular division</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "short_answer",
      title: "2. Short Answer",
      desc: "Student writes an open explanation → Summa evaluates key ideas and offers precise feedback.",
      category: "Core Learning",
      badgeBg: "bg-amber-100/80 text-amber-600",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-slate-800 leading-tight">
            Explain the difference between stack and heap memory.
          </p>
          <div className="relative mt-1.5">
            <div className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-500 font-sans leading-tight">
              Stack holds static local frames; heap allocates dynamic objects...
            </div>
            <button className="absolute right-1.5 bottom-1.5 size-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "true_false",
      title: "3. True / False",
      desc: "Simple, rapid-fire statement validation to quickly clear misconceptions.",
      category: "Core Learning",
      badgeBg: "bg-emerald-100/80 text-emerald-600",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Rapid Check</span>
            <p className="text-[11px] font-semibold text-slate-800 leading-tight">
              Java interfaces can contain private helper methods in Java 9+.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-center font-bold text-xs text-emerald-700">
              TRUE ✓
            </div>
            <div className="py-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs text-slate-400 opacity-60">
              FALSE
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "fill_blank",
      title: "4. Fill in the Blank",
      desc: "Excellent for locking in essential technical terminology, syntax, and exact formulas.",
      category: "Core Learning",
      badgeBg: "bg-purple-100/80 text-purple-600",
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-center space-y-3">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            In OOP, <span className="inline-block px-2 py-0.5 bg-purple-50 border border-purple-300 text-purple-700 font-bold rounded">polymorphism</span> allows dynamic method dispatch at runtime.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="font-semibold text-purple-600">Hint:</span> Means "many forms"
          </div>
        </div>
      ),
    },
    {
      id: "matching",
      title: "5. Matching",
      category: "Core Learning",
      desc: "Match concepts ↔ definitions to build strong structural associations.",
      badgeBg: "bg-pink-100/80 text-pink-600",
      icon: (
        <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      preview: (
        <div className="relative w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-between">
          <div className="space-y-2 z-10">
            <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-medium text-slate-700">
              Photosynthesis
            </div>
            <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-medium text-slate-700">
              Mitochondria
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current" viewBox="0 0 200 120">
            <path d="M 80 40 C 120 40, 110 80, 140 80" stroke="#34D399" strokeWidth="1.5" fill="none" />
            <path d="M 80 75 C 110 75, 110 38, 140 38" stroke="#60A5FA" strokeWidth="1.5" fill="none" />
          </svg>
          <div className="space-y-2 z-10 text-right">
            <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-medium text-slate-700">
              ATP energy production
            </div>
            <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-medium text-slate-700">
              Light into glucose
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ordering",
      title: "6. Ordering",
      category: "Core Learning",
      desc: "Arrange events, execution steps or multi-stage algorithms into the correct sequence.",
      badgeBg: "bg-indigo-100/80 text-indigo-600",
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-2xs space-y-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-50/80 border border-indigo-200 rounded-lg">
            <span className="size-3.5 rounded-full bg-indigo-600 text-white font-bold text-[8px] flex items-center justify-center">1</span>
            <span className="text-[9px] font-semibold text-indigo-900">Compile Source Code</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="size-3.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[8px] flex items-center justify-center">2</span>
            <span className="text-[9px] font-medium text-slate-700">Generate Bytecode</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="size-3.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[8px] flex items-center justify-center">3</span>
            <span className="text-[9px] font-medium text-slate-700">Load via JVM ClassLoader</span>
          </div>
        </div>
      ),
    },
    {
      id: "categorization",
      title: "7. Categorization",
      category: "Core Learning",
      desc: "Drag or sort concepts into appropriate categories or taxonomy buckets.",
      badgeBg: "bg-cyan-100/80 text-cyan-600",
      icon: (
        <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-2xs grid grid-cols-2 gap-2">
          <div className="bg-cyan-50/60 border border-cyan-200 rounded-lg p-2 space-y-1">
            <span className="text-[9px] font-bold text-cyan-700 block">Linear Data</span>
            <div className="bg-white border border-cyan-200 rounded px-1.5 py-0.5 text-[8px] font-medium text-slate-700">Arrays</div>
            <div className="bg-white border border-cyan-200 rounded px-1.5 py-0.5 text-[8px] font-medium text-slate-700">Linked Lists</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1">
            <span className="text-[9px] font-bold text-slate-600 block">Non-Linear</span>
            <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[8px] font-medium text-slate-700">Trees</div>
            <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[8px] font-medium text-slate-700">Graphs</div>
          </div>
        </div>
      ),
    },
    {
      id: "teach_back",
      title: "8. Teach-Back",
      category: "Core Learning",
      desc: "'Explain this like you're teaching someone.' Forces Feynman-style active articulation.",
      badgeBg: "bg-teal-100/80 text-teal-600",
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-teal-700 font-bold text-[10px]">
            <span>🎓 Feynman Method</span>
          </div>
          <p className="text-[10px] text-slate-700 font-medium leading-tight">
            How would you explain recursion to a 10-year-old without using technical jargon?
          </p>
          <div className="w-full h-8 bg-teal-50/50 border border-teal-200 rounded-lg p-1.5 text-[9px] text-teal-800 italic">
            "It's like a Russian nesting doll..."
          </div>
        </div>
      ),
    },
    {
      id: "confidence_check",
      title: "9. Confidence Check",
      category: "Core Learning",
      desc: "Rate how confident you feel (1–5) and pair it directly with actual test performance.",
      badgeBg: "bg-emerald-100/80 text-emerald-600",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-slate-800 leading-tight">
            How confident do you feel about Big-O time complexity analysis?
          </p>
          <div className="flex items-center justify-between gap-1 py-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className={`size-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                  level === 4
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-slate-400 text-center font-medium">1 = Unsure · 5 = Mastered</div>
        </div>
      ),
    },
    {
      id: "scenario",
      title: "10. Scenario / Case Study",
      category: "Core Learning",
      desc: "Give a realistic engineering/academic situation for the student to apply knowledge.",
      badgeBg: "bg-sky-100/80 text-sky-600",
      icon: (
        <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex gap-2 items-center">
          <div className="w-16 h-20 bg-sky-50 border border-sky-200 rounded-lg p-1.5 flex flex-col justify-between shrink-0">
            <span className="text-[8px] font-bold text-sky-700 uppercase">CASE #104</span>
            <div className="size-4 rounded bg-sky-500 text-white font-bold text-[8px] flex items-center justify-center">⚙</div>
          </div>
          <div className="flex-1 space-y-1.5">
            <p className="text-[10px] text-slate-700 font-medium leading-snug">
              A high-traffic web server drops requests during peak hours. Which caching pattern resolves this?
            </p>
            <div className="flex justify-end">
              <button className="px-2 py-0.5 rounded bg-sky-500 text-white text-[9px] font-bold">Solve</button>
            </div>
          </div>
        </div>
      ),
    },

    // --- TEACHING COMPONENTS ---
    {
      id: "explanation_card",
      title: "11. Explanation Card",
      category: "Teaching Components",
      desc: "Structured, high-clarity explanation with progressive disclosure of key insights.",
      badgeBg: "bg-blue-100/80 text-blue-700",
      icon: (
        <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-blue-600 uppercase">Core Principle</span>
            <h4 className="text-[11px] font-bold text-slate-800">Dynamic Method Dispatch</h4>
          </div>
          <p className="text-[10px] text-slate-600 leading-snug">
            At runtime, Java checks the actual object type (e.g. <code className="text-blue-600 font-mono">Dog</code>) rather than reference variable type.
          </p>
          <div className="text-[9px] text-blue-600 font-semibold cursor-pointer">▶ Tap to expand deep-dive</div>
        </div>
      ),
    },
    {
      id: "worked_example",
      title: "12. Worked Example",
      category: "Teaching Components",
      desc: "Problem → step-by-step breakdown → explicit reasoning → verified final answer.",
      badgeBg: "bg-slate-100 text-slate-800",
      icon: (
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-800">Problem: Integrate ∫ 2x dx</div>
          <div className="pl-2 border-l-2 border-blue-500 text-[9px] text-slate-600 space-y-0.5">
            <div>Step 1: Apply power rule ∫ x^n dx = x^(n+1)/(n+1)</div>
            <div>Step 2: 2 * (x^2 / 2) = x^2</div>
          </div>
          <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold rounded">
            Result: x² + C
          </div>
        </div>
      ),
    },
    {
      id: "hint_ladder",
      title: "13. Hint Ladder",
      category: "Teaching Components",
      desc: "Progressive hints (Hint 1 → Hint 2 → Guided Clue) without immediately giving away the answer.",
      badgeBg: "bg-amber-100/80 text-amber-700",
      icon: (
        <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-800">Stuck on recursion base case?</div>
          <div className="space-y-1">
            <div className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-[9px] rounded font-medium">
              💡 Hint 1: What condition causes n to stop decrementing?
            </div>
            <div className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-400 text-[9px] rounded opacity-60">
              🔒 Hint 2 (Locked)
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "concept_breakdown",
      title: "14. Concept Breakdown",
      category: "Teaching Components",
      desc: "Deconstructs complex subjects into digestable, modular sub-concepts.",
      badgeBg: "bg-orange-100/80 text-orange-600",
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-800">Database Indexing</div>
          <div className="grid grid-cols-2 gap-1 text-[9px]">
            <div className="p-1.5 bg-orange-50 border border-orange-200 rounded text-orange-900 font-medium">B-Trees</div>
            <div className="p-1.5 bg-orange-50 border border-orange-200 rounded text-orange-900 font-medium">Hash Tables</div>
            <div className="p-1.5 bg-orange-50 border border-orange-200 rounded text-orange-900 font-medium">Scan Overhead</div>
            <div className="p-1.5 bg-orange-50 border border-orange-200 rounded text-orange-900 font-medium">Write Cost</div>
          </div>
        </div>
      ),
    },
    {
      id: "compare_contrast",
      title: "15. Compare & Contrast",
      category: "Teaching Components",
      desc: "Side-by-side distinction matrix highlight key differences between A vs B.",
      badgeBg: "bg-indigo-100/80 text-indigo-700",
      icon: (
        <svg className="w-5 h-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-2 shadow-2xs flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-1 text-center text-[9px] font-bold pb-1 border-b">
            <span className="text-blue-600">Process</span>
            <span className="text-purple-600">Thread</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[8px] pt-1 text-slate-600">
            <div>Isolated memory space</div>
            <div>Shared process memory</div>
            <div>Heavy creation cost</div>
            <div>Lightweight execution</div>
          </div>
        </div>
      ),
    },
    {
      id: "analogy_card",
      title: "16. Analogy Card",
      category: "Teaching Components",
      desc: "Explains abstract technical ideas using relatable real-world mental models.",
      badgeBg: "bg-rose-100/80 text-rose-600",
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-rose-600 uppercase">Analogy</span>
          <p className="text-[10px] text-slate-700 leading-tight">
            <strong>RAM vs Hard Drive:</strong> Like your office desk space vs a filing cabinet in the basement.
          </p>
          <div className="text-[9px] text-slate-400 italic">Quick memory access vs permanent storage</div>
        </div>
      ),
    },
    {
      id: "common_mistake",
      title: "17. Common Mistake Card",
      category: "Teaching Components",
      desc: "Highlights frequent cognitive traps and provides explicit corrections.",
      badgeBg: "bg-red-100/80 text-red-600",
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[9px] font-bold text-red-600 flex items-center gap-1">
            <span>⚠️ Common Misconception</span>
          </div>
          <p className="text-[9px] text-red-900 bg-red-50 p-1.5 rounded border border-red-200 line-through">
            "Overloading happens at runtime."
          </p>
          <p className="text-[9px] text-emerald-900 bg-emerald-50 p-1.5 rounded border border-emerald-200">
            ✓ Correction: Overloading is resolved at <strong>compile-time</strong>.
          </p>
        </div>
      ),
    },
    {
      id: "why_it_works",
      title: "18. Why It Works",
      category: "Teaching Components",
      desc: "Focuses on first-principles underlying mechanics rather than shallow rote memorization.",
      badgeBg: "bg-violet-100/80 text-violet-600",
      icon: (
        <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-violet-600 uppercase">First Principles</span>
          <p className="text-[10px] text-slate-800 font-semibold leading-tight">
            Why Binary Search is O(log n)
          </p>
          <p className="text-[9px] text-slate-500 leading-tight">
            Each step cuts the remaining dataset in half (n/2, n/4, n/8...), making division logarithmic.
          </p>
        </div>
      ),
    },

    // --- ACTIVE-RECALL / RETENTION ---
    {
      id: "recall_prompt",
      title: "19. Recall Prompt",
      category: "Active-Recall / Retention",
      desc: "'Without looking, explain...' Active memory retrieval prompt before showing hints.",
      badgeBg: "bg-emerald-100/80 text-emerald-700",
      icon: (
        <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-emerald-700 uppercase">Closed-Book Recall</div>
          <p className="text-[10px] text-slate-800 font-medium leading-tight">
            Without looking at your notes, state the 3 ACID properties in database transactions.
          </p>
          <button className="py-1 bg-emerald-500 text-white text-[9px] font-bold rounded-lg shadow-xs">Reveal Answer</button>
        </div>
      ),
    },
    {
      id: "spaced_review",
      title: "20. Spaced Review Card",
      category: "Active-Recall / Retention",
      desc: "Resurfaces previously learned concepts at optimal decay intervals (SM-2 decay algorithm).",
      badgeBg: "bg-sky-100/80 text-sky-700",
      icon: (
        <svg className="w-5 h-5 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px]">
            <span className="font-bold text-sky-600">DUE FOR REVIEW</span>
            <span className="text-slate-400 font-mono">Decay: 3 days</span>
          </div>
          <p className="text-[10px] text-slate-800 font-semibold">
            SQL Group By vs Having clauses
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-slate-400">Interval: 6 days</span>
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold text-[9px] rounded">Review</span>
          </div>
        </div>
      ),
    },
    {
      id: "rapid_recall",
      title: "21. Rapid Recall",
      category: "Active-Recall / Retention",
      desc: "Sequence of short, timed questions to build instant recognition speed.",
      badgeBg: "bg-amber-100/80 text-amber-700",
      icon: (
        <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-amber-600">⚡ SPEED ROUND</span>
            <span className="text-[9px] font-mono font-bold text-amber-700">0:14s</span>
          </div>
          <p className="text-[10px] text-slate-800 font-semibold">
            What is the default value of a boolean in Java?
          </p>
          <div className="grid grid-cols-2 gap-1">
            <div className="p-1 bg-amber-50 text-amber-800 text-[9px] font-bold rounded text-center">false</div>
            <div className="p-1 bg-slate-50 text-slate-500 text-[9px] font-bold rounded text-center">true</div>
          </div>
        </div>
      ),
    },
    {
      id: "retrieval_grid",
      title: "22. Retrieval Grid",
      category: "Active-Recall / Retention",
      desc: "Multi-concept matrix prompting recall across connected course topics.",
      badgeBg: "bg-fuchsia-100/80 text-fuchsia-700",
      icon: (
        <svg className="w-5 h-5 text-fuchsia-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-2 shadow-2xs space-y-1">
          <span className="text-[9px] font-bold text-fuchsia-600 block">Matrix Memory Check</span>
          <div className="grid grid-cols-2 gap-1 text-[8px]">
            <div className="p-1.5 bg-fuchsia-50 border border-fuchsia-200 rounded font-medium text-fuchsia-900">Encapsulation</div>
            <div className="p-1.5 bg-fuchsia-50 border border-fuchsia-200 rounded font-medium text-fuchsia-900">Inheritance</div>
            <div className="p-1.5 bg-fuchsia-50 border border-fuchsia-200 rounded font-medium text-fuchsia-900">Polymorphism</div>
            <div className="p-1.5 bg-fuchsia-50 border border-fuchsia-200 rounded font-medium text-fuchsia-900">Abstraction</div>
          </div>
        </div>
      ),
    },
    {
      id: "memory_check",
      title: "23. Memory Check",
      category: "Active-Recall / Retention",
      desc: "'What do you remember from yesterday?' Daily recap to solidify long-term retention.",
      badgeBg: "bg-blue-100/80 text-blue-700",
      icon: (
        <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase">
            <span>📅 YESTERDAY'S RECAP</span>
          </div>
          <p className="text-[10px] text-slate-800 font-semibold leading-tight">
            Summarize 2 takeaways from yesterday's lesson on Object-Oriented Design.
          </p>
          <div className="w-full py-1 bg-blue-50 border border-blue-200 rounded text-center text-[9px] font-bold text-blue-700">
            Start Recap
          </div>
        </div>
      ),
    },
    // --- UTILITY & DASHBOARD ---
    {
      id: "flashcard_card",
      title: "Flashcard Stack",
      category: "Interactive Cards",
      desc: "Quick, focused cards to help you recall and remember key concepts with spaced repetition.",
      badgeBg: "bg-purple-100/70 text-purple-600",
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path strokeLinecap="round" d="M9 9h6M9 13h4" />
        </svg>
      ),
      preview: (
        <div className="relative w-full h-[140px] flex items-center justify-center p-2">
          <div className="absolute w-[82%] h-[90px] bg-gradient-to-r from-purple-200/50 to-indigo-200/50 rounded-2xl border border-purple-200/40 translate-y-3 blur-[0.5px]" />
          <div className="absolute w-[87%] h-[95px] bg-purple-100/60 rounded-2xl border border-purple-200/60 translate-y-1.5" />
          <div className="relative z-10 w-[92%] h-[100px] bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs font-semibold text-slate-800 tracking-tight">What is photosynthesis?</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition cursor-pointer">
              <span>Flip</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "progress_card",
      title: "Stats & Mastery Card",
      category: "Analytics & Progress",
      desc: "Track your progress, see your strengths and weaknesses, and stay motivated.",
      badgeBg: "bg-emerald-100/80 text-emerald-600",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-around">
          <div className="relative size-16 flex items-center justify-center">
            <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100 stroke-current" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500 stroke-current" strokeDasharray="72, 100" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center leading-none">
              <span className="text-xs font-bold text-slate-800">72%</span>
            </div>
          </div>
          <div className="space-y-1 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">Strong (4)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500" />
              <span className="font-semibold text-slate-700">Developing (3)</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  const categories = [
    "All",
    "Core Learning",
    "Teaching Components",
    "Active-Recall / Retention",
    "Interactive Cards",
    "Analytics & Progress",
  ];

  const filteredComponents = components.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Title Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold tracking-wider uppercase">
              Summa AI Visual System
            </span>
            <span className="text-xs text-slate-400">• {components.length} Instruments</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Learning Component Library
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Cohesive, soft-premium pedagogical instruments deployed dynamically by Summa's Learning Orchestrator.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search learning components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition-all"
          />
          <svg className="absolute left-3 top-3 size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive Grid of Cards (Max 4 per row on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredComponents.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedComponent(item)}
            className="group relative bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer overflow-hidden"
          >
            <div className="space-y-3.5 relative z-10">
              {/* Header: Badge Icon & Category */}
              <div className="flex items-center justify-between">
                <div className={`size-11 rounded-2xl ${item.badgeBg} flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  {item.category}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span>{item.title}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              {/* Interactive Component Preview */}
              <div className="pt-1">
                {item.preview}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">
              <span>View Playground</span>
              <div className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Component Detail Playground Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 space-y-6 p-6 md:p-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <div className={`size-14 rounded-2xl ${selectedComponent.badgeBg} flex items-center justify-center shadow-xs`}>
                  {selectedComponent.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                      {selectedComponent.category}
                    </span>
                    <span className="text-xs text-slate-300">• Instrument Spec</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedComponent.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description & Overview */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Overview</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedComponent.desc}
              </p>
            </div>

            {/* Interactive Component Live Preview */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Interactive Preview & Playground
              </div>
              <div className="p-4 bg-slate-100/70 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                {selectedComponent.preview}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close Spec
              </button>
              <button
                onClick={() => {
                  toast.success(`Instrument ${selectedComponent.title} deployed to session preview`);
                  setSelectedComponent(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition shadow-xs cursor-pointer"
              >
                Simulate Deployment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 14. AUDIT LOGS PAGE ---

export function AuditLogsView() {
  const logs = [
    { time: "2026-09-04 16:25", actor: "alex@summa.ai", action: "ROLE_ELEVATED", target: "usr-prof-1", details: "Assigned Instructor role for CSC 201", status: "Successful" },
    { time: "2026-09-04 14:30", actor: "alex@summa.ai", action: "SYSTEM_POLICY_UPDATED", target: "SYSTEM", details: "Enabled Hybrid Memory Vector Indexing & Gemini API Rate Limits", status: "Successful" },
    { time: "2026-09-03 11:15", actor: "system@summa.ai", action: "DATABASE_BACKUP", target: "Postgres DB", details: "Completed nightly automated snapshot", status: "Successful" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Events (30d)" value="14,820" change="+8.2%" strokeColor="#8B5CF6" />
        <MetricCard title="Admin Actions" value="1,240" change="+12" strokeColor="#10B981" />
        <MetricCard title="Security Events" value="85" change="-3" strokeColor="#10B981" />
        <MetricCard title="Failed Actions" value="4" change="0" strokeColor="#3B82F6" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900">System Activity & Audit Log Trail</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-400 border-b border-[#E2E8F0] uppercase text-[10px] font-semibold">
            <tr>
              <th className="p-4">TIMESTAMP</th>
              <th className="p-4">ACTOR</th>
              <th className="p-4">ACTION</th>
              <th className="p-4">TARGET / RESOURCE</th>
              <th className="p-4">DETAILS</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] font-mono">
            {logs.map((l, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-4 text-slate-500 text-[11px]">{l.time}</td>
                <td className="p-4 font-bold text-slate-900">{l.actor}</td>
                <td className="p-4 font-bold text-[#6366F1]">{l.action}</td>
                <td className="p-4 text-slate-700">{l.target}</td>
                <td className="p-4 font-sans text-slate-600">{l.details}</td>
                <td className="p-4 font-sans"><StatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 15. GLOBAL NOTIFICATIONS DRAWER ---

export function NotificationsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const notifications = [
    { title: "Payment Received", desc: "LASUSTECH renewed Enterprise Plan (₦250,000)", time: "15m ago", type: "payment" },
    { title: "New Institution Onboarded", desc: "Babcock University requested 500 student seats", time: "1h ago", type: "institution" },
    { title: "AI Model Latency Spike", desc: "Gemini 2.5 API latency returned to nominal <350ms", time: "3h ago", type: "system" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Bell size={16} className="text-[#6366F1]" />
              <span>Admin Notifications</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {notifications.map((n, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <button onClick={() => { toast.success("Marked all as read"); onClose(); }} className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition">
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
}
