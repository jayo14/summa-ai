import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

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
      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-8 max-w-3xl space-y-4 shadow-2xs text-xs text-grey-green dark:text-[#8FA29B]">
        Loading platform settings & feature flags...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-8 max-w-3xl space-y-6 shadow-2xs text-xs">
      <div className="border-b border-mist-green dark:border-[#2A3838] pb-4 space-y-1">
        <h3 className="font-bold text-base text-ink dark:text-cream-soft">Platform Settings & Feature Flags</h3>
        <p className="text-grey-green dark:text-[#8FA29B]">Configure global Summa AI admin behavior, operational switches, and feature toggles.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="font-semibold text-ink dark:text-cream-soft">Platform Name</label>
          <input
            type="text"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-ink dark:text-cream-soft">Default Currency</label>
          <select
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="w-full p-2.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl text-ink dark:text-cream-soft focus:outline-none focus:border-[#6366F1]"
          >
            <option value="NGN">Nigerian Naira (₦ - NGN)</option>
            <option value="USD">US Dollar ($ - USD)</option>
          </select>
        </div>

        {/* Feature Flags Section */}
        <div className="pt-4 border-t border-mist-green dark:border-[#2A3838] space-y-3">
          <h4 className="font-bold text-xs text-grey-green dark:text-[#8FA29B] uppercase tracking-wider">
            Global Feature Flags
          </h4>

          {/* WebSocket Feature Flag */}
          <div className="flex items-center justify-between p-3.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
            <div>
              <div className="font-semibold text-ink dark:text-cream-soft">WebSocket Realtime Engine (WEBSOCKET_ENABLED)</div>
              <div className="text-grey-green dark:text-[#8FA29B] text-[11px]">Enables low-latency bidirectional socket connections for live study streams.</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("websocket_enabled", websocketEnabled, setWebsocketEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                websocketEnabled ? "bg-teal-dark dark:bg-accent-lime" : "bg-slate-300"
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
          <div className="flex items-center justify-between p-3.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
            <div>
              <div className="font-semibold text-ink dark:text-cream-soft">Hybrid Memory Layer (HYBRID_MEMORY_ENABLED)</div>
              <div className="text-grey-green dark:text-[#8FA29B] text-[11px]">Activates Cognee graph memory and Qdrant vector retrieval during chat sessions.</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("hybrid_memory_enabled", hybridMemoryEnabled, setHybridMemoryEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                hybridMemoryEnabled ? "bg-teal-dark dark:bg-accent-lime" : "bg-slate-300"
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
          <div className="flex items-center justify-between p-3.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
            <div>
              <div className="font-semibold text-ink dark:text-cream-soft">SummaStudy API Integration (SUMMASTUDY_ENABLED)</div>
              <div className="text-grey-green dark:text-[#8FA29B] text-[11px]">Gates microservice requests for study planner, spaced repetition, & recommendations.</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("summastudy_enabled", summastudyEnabled, setSummastudyEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                summastudyEnabled ? "bg-teal-dark dark:bg-accent-lime" : "bg-slate-300"
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
          <div className="flex items-center justify-between p-3.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
            <div>
              <div className="font-semibold text-ink dark:text-cream-soft">Maintenance Mode</div>
              <div className="text-grey-green dark:text-[#8FA29B] text-[11px]">Temporarily restrict student portal access for core backend updates.</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("maintenance_mode", maintenanceMode, setMaintenanceMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                maintenanceMode ? "bg-destructive/10 dark:bg-[#be747e]/100" : "bg-slate-300"
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

      <div className="pt-4 border-t border-mist-green dark:border-[#2A3838] flex justify-end gap-3">
        <button
          onClick={loadSettings}
          className="px-5 py-2.5 rounded-xl border border-mist-green dark:border-[#2A3838] font-semibold text-ink dark:text-cream-soft hover:bg-cream-light dark:bg-[#232D2D] transition cursor-pointer"
        >
          Reset
        </button>
        <button
          onClick={() => handleSaveSettings()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-teal-dark dark:bg-accent-lime text-white font-semibold hover:bg-emerald-deep dark:hover:bg-[#c7ff62] transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// --- 13B. COMPONENTS LIBRARY PAGE (Mirror-Perfect Implementation) ---

interface ComponentMeta {
  id: string;
  title: string;
  category: string;
  desc: string;
  badgeBg: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
  whatIsIt?: string;
  whySummaUsesIt?: string;
  techniques?: string[];
  whenSummaUsesIt?: string[];
  example?: string;
  interactiveExample?: React.ReactNode;
  whatHappensAfter?: { step: string; detail: string }[];
  usedWith?: string[];
  decisionSignals?: string[];
}
