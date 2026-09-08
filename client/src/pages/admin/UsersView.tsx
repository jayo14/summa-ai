import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, User, Users, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const [showDeleteTestModal, setShowDeleteTestModal] = useState(false);
  const [deletePattern, setDeletePattern] = useState("test-%@example.com");
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteTestUsers = async () => {
    if (!deletePattern.trim()) {
      toast.error("Email pattern is required");
      return;
    }
    setDeleting(true);
    try {
      const result = await fetchApi<{ deleted: any[]; errors: any[] }>(
        "/admin/users/delete-by-pattern",
        {
          method: "POST",
          body: JSON.stringify({ email_pattern: deletePattern.trim() }),
        }
      );
      const count = result?.deleted?.length || 0;
      const errCount = result?.errors?.length || 0;
      if (count > 0) {
        toast.success(`Deleted ${count} test user${count > 1 ? "s" : ""}`);
      }
      if (errCount > 0) {
        toast.error(`Failed to delete ${errCount} user${errCount > 1 ? "s" : ""}`);
      }
      if (count === 0 && errCount === 0) {
        toast.info("No users matched the pattern");
      }
      setShowDeleteTestModal(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete users");
    } finally {
      setDeleting(false);
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
      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-2.5 size-4 text-grey-green dark:text-[#8FA29B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or institution..."
              className="w-full pl-10 pr-4 py-2 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-xs text-ink dark:text-cream-soft focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] text-ink dark:text-cream-soft text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="user">Students / Users</option>
              <option value="instructor">Lecturers / Instructors</option>
              <option value="admin">Admins</option>
            </select>

            <button
              onClick={() => setShowDeleteTestModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-destructive/30 dark:border-[#be747e]/30 text-destructive dark:text-[#be747e] hover:bg-destructive/10 dark:bg-[#be747e]/10 transition flex items-center gap-2 cursor-pointer"
            >
              <Trash2 size={14} /> Delete Test Users
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-dark dark:bg-accent-lime text-white hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Plus size={14} /> Add User
            </button>
          </div>
        </div>

        {/* Fixed Header & Scrollable Body Container */}
        <div className="w-full rounded-xl border border-mist-green dark:border-[#2A3838] bg-white overflow-hidden">
          {/* Fixed Header Table */}
          <div className="w-full bg-cream-light dark:bg-[#121616] border-b border-mist-green dark:border-[#2A3838]">
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
                  <th className="p-4 text-grey-green dark:text-[#8FA29B] font-bold uppercase text-[10px] tracking-wider">USER</th>
                  <th className="p-4 text-grey-green dark:text-[#8FA29B] font-bold uppercase text-[10px] tracking-wider">ROLE</th>
                  <th className="p-4 text-grey-green dark:text-[#8FA29B] font-bold uppercase text-[10px] tracking-wider">INSTITUTION</th>
                  <th className="p-4 text-grey-green dark:text-[#8FA29B] font-bold uppercase text-[10px] tracking-wider">STATUS</th>
                  <th className="p-4 text-grey-green dark:text-[#8FA29B] font-bold uppercase text-[10px] tracking-wider">SUBSCRIPTION</th>
                  <th className="p-4 text-grey-green dark:text-[#8FA29B] font-bold uppercase text-[10px] tracking-wider">JOINED</th>
                  <th className="p-4 text-right text-grey-green dark:text-[#8FA29B] font-bold uppercase text-[10px] tracking-wider">ACTION</th>
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
                      <tr key={u.id} className="hover:bg-cream-light dark:bg-[#232D2D] transition cursor-pointer" onClick={() => onUserClick(u)}>
                        <td className="p-4 truncate">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-teal-dark dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-bold text-xs flex items-center justify-center shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-ink dark:text-cream-soft truncate">{displayName}</div>
                              <div className="text-[11px] text-grey-green dark:text-[#8FA29B] font-mono truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-ink dark:text-cream-soft capitalize">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft border border-mist-green dark:border-[#2A3838]">
                            {u.role === "admin" ? "ADMIN" : u.role === "instructor" ? "LECTURER" : "STUDENT"}
                          </span>
                        </td>
                        <td className="p-4 text-grey-green dark:text-[#8FA29B] font-medium truncate">{institutionDisplay}</td>
                        <td className="p-4"><StatusBadge status={u.status || "Active"} /></td>
                        <td className="p-4 font-medium text-ink dark:text-cream-soft uppercase text-[11px]">{subscriptionDisplay}</td>
                        <td className="p-4 text-grey-green dark:text-[#8FA29B] font-mono text-[11px]">{formattedJoined}</td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {onRoleChange && (
                              <button
                                onClick={() => onRoleChange(u.id, u.role === "admin" ? "user" : "admin")}
                                title="Toggle Role"
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-teal-dark dark:text-accent-lime hover:bg-teal-dark dark:bg-accent-lime/10 transition shrink-0"
                              >
                                {u.role === "admin" ? "Make User" : "Make Admin"}
                              </button>
                            )}
                            {onStatusChange && (
                              <button
                                onClick={() => onStatusChange(u.id, u.status)}
                                title="Toggle Account Status"
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                                  u.status === "suspended" ? "text-teal-dark dark:text-accent-lime hover:bg-teal-dark/10 dark:bg-accent-lime/10" : "text-destructive dark:text-[#be747e] hover:bg-destructive/10 dark:bg-[#be747e]/10"
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
                    <td colSpan={7} className="p-8 text-center text-grey-green dark:text-[#8FA29B] font-medium text-xs">
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

      {/* Delete Test Users Modal */}
      {showDeleteTestModal && (
        <div className="fixed inset-0 z-50 bg-ink dark:bg-[#121616]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-mist-green dark:border-[#2A3838] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-mist-green dark:border-[#2A3838] pb-3">
              <h3 className="font-bold text-sm text-ink dark:text-cream-soft flex items-center gap-2">
                <Trash2 size={16} className="text-destructive dark:text-[#be747e]" />
                Delete Test Users
              </h3>
              <button onClick={() => setShowDeleteTestModal(false)} className="text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-grey-green dark:text-[#8FA29B]">
                Delete all users whose email matches the SQL LIKE pattern below. This removes both the auth record and profile.
              </p>
              <div>
                <label className="block font-semibold text-ink dark:text-cream-soft mb-1">Email Pattern</label>
                <input
                  type="text"
                  value={deletePattern}
                  onChange={(e) => setDeletePattern(e.target.value)}
                  placeholder="e.g. test-%@example.com"
                  className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft font-mono focus:outline-none"
                />
                <p className="text-[10px] text-grey-green dark:text-[#8FA29B] mt-1">
                  Use % as wildcard. Example: <code className="bg-cream-light dark:bg-[#232D2D] px-1 rounded">test-%@example.com</code> matches all test users.
                </p>
              </div>

              {/* Preview matching users */}
              {deletePattern && (
                <div className="p-3 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838]">
                  <div className="text-[10px] font-semibold text-grey-green dark:text-[#8FA29B] mb-1">Will delete:</div>
                  <div className="space-y-1">
                    {users
                      .filter((u) => {
                        const pattern = deletePattern.replace(/%/g, ".*").replace(/\?/g, ".");
                        return new RegExp(`^${pattern}$`, "i").test(u.email);
                      })
                      .slice(0, 5)
                      .map((u) => (
                        <div key={u.id} className="text-[11px] font-mono text-ink dark:text-cream-soft flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-destructive/60 dark:bg-[#be747e]/60" />
                          {u.email}
                        </div>
                      ))}
                    {users.filter((u) => {
                      const pattern = deletePattern.replace(/%/g, ".*").replace(/\?/g, ".");
                      return new RegExp(`^${pattern}$`, "i").test(u.email);
                    }).length > 5 && (
                      <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">
                        ...and {users.filter((u) => {
                          const pattern = deletePattern.replace(/%/g, ".*").replace(/\?/g, ".");
                          return new RegExp(`^${pattern}$`, "i").test(u.email);
                        }).length - 5} more
                      </div>
                    )}
                    {users.filter((u) => {
                      const pattern = deletePattern.replace(/%/g, ".*").replace(/\?/g, ".");
                      return new RegExp(`^${pattern}$`, "i").test(u.email);
                    }).length === 0 && (
                      <div className="text-[11px] text-grey-green dark:text-[#8FA29B]">No matching users</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteTestModal(false)} className="px-4 py-2 rounded-xl border border-mist-green dark:border-[#2A3838] text-ink dark:text-cream-soft font-semibold text-xs">
                Cancel
              </button>
              <button
                onClick={handleDeleteTestUsers}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-destructive dark:bg-[#be747e] text-white font-semibold text-xs hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={12} />
                    Delete All Matched
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-ink dark:bg-[#121616]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-mist-green dark:border-[#2A3838] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-mist-green dark:border-[#2A3838] pb-3">
              <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-grey-green dark:text-[#8FA29B] hover:text-grey-green dark:text-[#8FA29B]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink dark:text-cream-soft mb-1">Full Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Samuel Okon"
                  className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink dark:text-cream-soft mb-1">Email Address</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="e.g. samuel@unilag.edu.ng"
                  className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink dark:text-cream-soft mb-1">Role</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft focus:outline-none"
                  >
                    <option value="user">Student (User)</option>
                    <option value="instructor">Lecturer (Instructor)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink dark:text-cream-soft mb-1">Institution</label>
                  <input
                    type="text"
                    value={addInstitution}
                    onChange={(e) => setAddInstitution(e.target.value)}
                    placeholder="e.g. University of Lagos or nil"
                    className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-mist-green dark:border-[#2A3838] text-ink dark:text-cream-soft font-semibold text-xs">
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white font-semibold text-xs hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition"
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
    <div className="fixed inset-0 z-50 bg-ink dark:bg-[#121616]/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Drawer Header */}
          <div className="p-6 border-b border-mist-green dark:border-[#2A3838] flex items-center justify-between bg-cream-light dark:bg-[#121616]">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-teal-dark dark:bg-accent-lime text-white font-bold text-sm flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink dark:text-cream-soft">{user.name}</h3>
                <p className="text-xs text-grey-green dark:text-[#8FA29B] font-mono">{user.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft hover:bg-mist-green/50 dark:hover:bg-[#2A3838]/50">
              <X size={18} />
            </button>
          </div>

          {/* Drawer Tabs */}
          <div className="flex border-b border-mist-green dark:border-[#2A3838] px-6 text-xs font-semibold text-grey-green dark:text-[#8FA29B]">
            {(["overview", "activity", "learning", "billing"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 px-3 capitalize border-b-2 transition ${
                  tab === t ? "border-[#6366F1] text-teal-dark dark:text-accent-lime" : "border-transparent hover:text-ink dark:text-cream-soft"
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
                  <div className="p-3 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838]">
                    <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">Role</div>
                    <div className="font-bold text-ink dark:text-cream-soft mt-0.5">{user.role}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838]">
                    <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">Status</div>
                    <div className="mt-1"><StatusBadge status={user.status} /></div>
                  </div>
                  <div className="p-3 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838]">
                    <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">Institution</div>
                    <div className="font-bold text-ink dark:text-cream-soft mt-0.5 truncate">{user.institution || user.onboarding_data?.institution || user.onboarding_data?.field_of_study || "nil"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838]">
                    <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">Subscription</div>
                    <div className="font-bold text-ink dark:text-cream-soft mt-0.5">{user.sub || user.onboarding_data?.subscription || "nil"}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="font-bold text-ink dark:text-cream-soft">Learning Summary</div>
                  <div className="p-4 rounded-xl border border-mist-green dark:border-[#2A3838] space-y-2">
                    <div className="flex justify-between text-grey-green dark:text-[#8FA29B]">
                      <span>Total Sessions</span>
                      <span className="font-mono font-bold text-ink dark:text-cream-soft">{user.sessions}</span>
                    </div>
                    <div className="flex justify-between text-grey-green dark:text-[#8FA29B]">
                      <span>Quizzes Attempted</span>
                      <span className="font-mono font-bold text-ink dark:text-cream-soft">28</span>
                    </div>
                    <div className="flex justify-between text-grey-green dark:text-[#8FA29B]">
                      <span>Average Score</span>
                      <span className="font-mono font-bold text-teal-dark dark:text-accent-lime">88.4%</span>
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
                  <div key={idx} className="p-3 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] space-y-0.5">
                    <div className="font-semibold text-ink dark:text-cream-soft">{act.title}</div>
                    <div className="text-[10px] text-grey-green dark:text-[#8FA29B] font-mono">{act.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-mist-green dark:border-[#2A3838] bg-cream-light dark:bg-[#121616] flex gap-3">
          <button onClick={() => toast.warning("User suspended.")} className="flex-1 py-2.5 rounded-xl border border-destructive/30 dark:border-[#be747e]/30 text-destructive dark:text-[#be747e] font-semibold text-xs hover:bg-destructive/10 dark:bg-[#be747e]/10 transition cursor-pointer">
            Suspend Account
          </button>
          <button onClick={() => toast.success("User details saved.")} className="flex-1 py-2.5 rounded-xl bg-teal-dark dark:bg-accent-lime text-white font-semibold text-xs hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition cursor-pointer">
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. INSTITUTIONS PAGE ---
