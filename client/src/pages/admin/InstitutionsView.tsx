import React, { useState, useEffect } from "react";
import { MoreHorizontal, Plus, Users, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

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

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Registered Institutions</h3>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-dark dark:bg-accent-lime text-white hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition flex items-center gap-2 shadow-2xs cursor-pointer">
            <Plus size={14} /> Add Institution
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-light dark:bg-[#121616] text-grey-green dark:text-[#8FA29B] border-b border-mist-green dark:border-[#2A3838] uppercase text-[10px] font-semibold tracking-wider">
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
                <tr key={idx} className="hover:bg-cream-light dark:bg-[#232D2D] transition cursor-pointer" onClick={() => setSelectedInst(i)}>
                  <td className="p-4 font-bold text-ink dark:text-cream-soft">{i.name}</td>
                  <td className="p-4 text-grey-green dark:text-[#8FA29B]">{i.type}</td>
                  <td className="p-4 font-mono text-ink dark:text-cream-soft">{i.users}</td>
                  <td className="p-4 font-mono text-ink dark:text-cream-soft">{i.active}</td>
                  <td className="p-4 font-semibold text-ink dark:text-cream-soft">{i.plan}</td>
                  <td className="p-4 font-mono font-bold text-ink dark:text-cream-soft">₦{(i.mrr || 0).toLocaleString()}</td>
                  <td className="p-4"><StatusBadge status={i.status} /></td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded-lg text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft hover:bg-mist-green/50 dark:hover:bg-[#2A3838]">
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
        <div className="fixed inset-0 z-50 bg-ink dark:bg-[#121616]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-mist-green dark:border-[#2A3838]">
            <div className="flex items-center justify-between border-b border-mist-green dark:border-[#2A3838] pb-3">
              <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Add Partner Institution</h3>
              <button onClick={() => setShowAddModal(false)} className="text-grey-green dark:text-[#8FA29B] hover:text-grey-green dark:text-[#8FA29B]"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink dark:text-cream-soft mb-1">Institution Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Obafemi Awolowo University" className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink dark:text-cream-soft mb-1">Category / Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft">
                    <option value="Federal">Federal</option>
                    <option value="State">State</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink dark:text-cream-soft mb-1">Plan</label>
                  <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft">
                    <option value="Enterprise">Enterprise</option>
                    <option value="Pro">Pro</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-mist-green dark:border-[#2A3838] text-ink dark:text-cream-soft font-semibold text-xs">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white font-semibold text-xs hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition">Register Institution</button>
            </div>
          </div>
        </div>
      )}

      {selectedInst && (
        <div className="fixed inset-0 z-50 bg-ink dark:bg-[#121616]/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-mist-green dark:border-[#2A3838] pb-4">
              <div>
                <h3 className="font-bold text-base text-ink dark:text-cream-soft">{selectedInst.name}</h3>
                <p className="text-xs text-grey-green dark:text-[#8FA29B] font-mono">ID: INST-{selectedInst.name.substring(0, 4).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedInst(null)} className="p-2 rounded-xl text-grey-green dark:text-[#8FA29B] hover:text-ink dark:text-cream-soft">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
                <div className="text-grey-green dark:text-[#8FA29B] text-[10px]">Type</div>
                <div className="font-bold text-ink dark:text-cream-soft mt-0.5">{selectedInst.type}</div>
              </div>
              <div className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
                <div className="text-grey-green dark:text-[#8FA29B] text-[10px]">Plan</div>
                <div className="font-bold text-ink dark:text-cream-soft mt-0.5">{selectedInst.plan}</div>
              </div>
              <div className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
                <div className="text-grey-green dark:text-[#8FA29B] text-[10px]">Monthly Recurring Revenue</div>
                <div className="font-bold text-teal-dark dark:text-accent-lime font-mono mt-0.5">{selectedInst.mrr}</div>
              </div>
              <div className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
                <div className="text-grey-green dark:text-[#8FA29B] text-[10px]">Status</div>
                <div className="mt-1"><StatusBadge status={selectedInst.status} /></div>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <h4 className="font-bold text-ink dark:text-cream-soft">Institutional Usage Telemetry</h4>
              <div className="p-4 bg-cream-light dark:bg-[#121616] border border-mist-green dark:border-[#2A3838] rounded-xl space-y-2">
                <div className="flex justify-between"><span>Registered Students:</span><span className="font-mono font-bold">{selectedInst.users}</span></div>
                <div className="flex justify-between"><span>Active Students (30d):</span><span className="font-mono font-bold">{selectedInst.active}</span></div>
                <div className="flex justify-between"><span>AI Tokens Consumed:</span><span className="font-mono font-bold">14.2M</span></div>
                <div className="flex justify-between"><span>Quizzes Completed:</span><span className="font-mono font-bold">4,120</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-mist-green dark:border-[#2A3838] flex gap-3">
              <button onClick={() => toast.success("Institution details updated.")} className="flex-1 py-2.5 rounded-xl bg-teal-dark dark:bg-accent-lime text-white font-semibold text-xs hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition">
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
