import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
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

export function UsersView({ onUserClick }: { onUserClick: (user: any) => void }) {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const sampleUsers = [
    { id: "u-1", name: "John Doe", email: "john.doe@unilag.edu.ng", role: "Student", institution: "University of Lagos", status: "Active", joined: "May 12, 2024", sessions: 42, sub: "Pro" },
    { id: "u-2", name: "Dr. Sarah Alabi", email: "s.alabi@lasustech.edu.ng", role: "Lecturer", institution: "LASUSTECH", status: "Active", joined: "Apr 04, 2024", sessions: 128, sub: "Enterprise" },
    { id: "u-3", name: "Prof. Kenneth Okoro", email: "k.okoro@ui.edu.ng", role: "Lecturer", institution: "University of Ibadan", status: "Active", joined: "Mar 18, 2024", sessions: 96, sub: "Pro" },
    { id: "u-4", name: "Amina Bello", email: "a.bello@student.babcock.edu.ng", role: "Student", institution: "Babcock University", status: "Pending", joined: "May 28, 2024", sessions: 3, sub: "Basic" },
    { id: "u-5", name: "David Adeleke", email: "david@covenant.edu.ng", role: "Admin", institution: "Covenant University", status: "Active", joined: "Jan 15, 2024", sessions: 310, sub: "Enterprise" },
    { id: "u-6", name: "Chidi Nnamdi", email: "chidi.n@student.unilag.edu.ng", role: "Student", institution: "University of Lagos", status: "Suspended", joined: "Feb 20, 2024", sessions: 19, sub: "Basic" },
  ];

  const filteredUsers = sampleUsers.filter((u) => {
    const matchesSearch = !search || `${u.name} ${u.email} ${u.institution}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
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
              {filteredUsers.map((u) => (
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
                <input type="text" placeholder="e.g. Samuel Okon" className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input type="email" placeholder="e.g. samuel@unilag.edu.ng" className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none">
                    <option>Student</option>
                    <option>Lecturer</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none">
                    <option>University of Lagos</option>
                    <option>LASUSTECH</option>
                    <option>University of Ibadan</option>
                    <option>Covenant University</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-slate-700 font-semibold text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success("User invitation sent successfully!");
                  setShowAddModal(false);
                }}
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

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="DAU / WAU Ratio" value="42.1%" change="+3.2%" strokeColor="#10B981" />
        <MetricCard title="AI Requests (30d)" value="142,800" change="+28.4%" strokeColor="#8B5CF6" />
        <MetricCard title="AI Tokens Consumed" value="48.2M" change="+31.0%" strokeColor="#3B82F6" />
        <MetricCard title="Quiz Attempts" value="34,190" change="+19.5%" strokeColor="#10B981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">User Growth & Retention Cohorts</h3>
            <span className="text-[10px] font-mono text-slate-400">Monthly</span>
          </div>
          <div className="h-48 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-center text-xs text-slate-400 font-mono">
            [User Growth Area Chart: New vs Returning]
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">AI Tokens & Model Latency</h3>
            <span className="text-[10px] font-mono text-slate-400">Realtime</span>
          </div>
          <div className="h-48 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-center text-xs text-slate-400 font-mono">
            [AI Telemetry Bar Chart: Token Breakdown]
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
        <button onClick={() => toast.info("Settings discarded.")} className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
          Cancel
        </button>
        <button onClick={() => toast.success("Platform settings saved successfully.")} className="px-5 py-2.5 rounded-xl bg-[#6366F1] text-white font-semibold hover:bg-[#4F46E5] transition shadow-2xs cursor-pointer">
          Save Settings
        </button>
      </div>
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
