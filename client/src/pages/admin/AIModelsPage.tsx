import React, { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Settings,
  Activity,
  Clock,
  ArrowRight,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { GeminiIcon } from "@/components/icons/GeminiIcon";
import { OpenAIIcon } from "@/components/icons/OpenAIIcon";
import { AnthropicIcon } from "@/components/icons/AnthropicIcon";
import { ZaiIcon } from "@/components/icons/ZaiIcon";

interface ProviderHealth {
  healthy: boolean;
  available: boolean;
  failures: number;
  quota_until: string | null;
  last_error: string | null;
}

interface ProviderUsage {
  total_requests: number;
  successful: number;
  failed: number;
  avg_latency_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
}

interface Provider {
  id: string;
  provider: string;
  model_name: string;
  is_enabled: boolean;
  priority: number;
  has_key: boolean;
  rate_limit_rpm: number | null;
  rate_limit_tpd: number | null;
  health: ProviderHealth;
  usage: ProviderUsage;
  last_health_check: string | null;
  last_error: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface FailoverEvent {
  timestamp: string;
  to_provider: string;
  from_provider: string;
  error_type: string;
  request_type: string;
  latency_ms: number;
}

const PROVIDER_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  gemini: GeminiIcon,
  openai: OpenAIIcon,
  anthropic: AnthropicIcon,
  zai: ZaiIcon,
};

const PROVIDER_COLORS: Record<string, string> = {
  gemini: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
  openai: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
  anthropic: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
  zai: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20",
};

const PROVIDER_LABELS: Record<string, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic Claude",
  zai: "Z.ai GLM",
};

export function AIModelsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [routingMode, setRoutingMode] = useState<string>("auto");
  const [failovers, setFailovers] = useState<FailoverEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      const data = await fetchApi<{ providers: Provider[]; routing_mode: string }>(
        "/admin/models/providers"
      );
      if (data?.providers) {
        setProviders(data.providers);
        setRoutingMode(data.routing_mode || "auto");
      }
    } catch (err) {
      toast.error("Failed to load provider data");
    }
  }, []);

  const fetchFailovers = useCallback(async () => {
    try {
      const data = await fetchApi<{ failovers: FailoverEvent[] }>("/admin/models/failover-log?limit=20");
      if (data?.failovers) {
        setFailovers(data.failovers);
      }
    } catch (err) {
      // Silent — failover log is non-critical
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProviders(), fetchFailovers()]);
      setLoading(false);
    };
    load();
  }, [fetchProviders, fetchFailovers]);

  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    try {
      const result = await fetchApi<{ success: boolean; error?: string }>(
        `/admin/models/providers/${providerId}/test`,
        { method: "POST" }
      );
      if (result?.success) {
        toast.success("Connection successful");
      } else {
        toast.error(result?.error || "Connection failed");
      }
    } catch (err) {
      toast.error("Test failed");
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveKey = async (providerId: string) => {
    const key = editingKeys[providerId];
    if (!key) return;
    setSavingId(providerId);
    try {
      await fetchApi(`/admin/models/providers/${providerId}`, {
        method: "PUT",
        body: JSON.stringify({ api_key: key }),
      });
      toast.success("API key saved (encrypted)");
      setEditingKeys((prev) => {
        const next = { ...prev };
        delete next[providerId];
        return next;
      });
      setVisibleKeys((prev) => ({ ...prev, [providerId]: false }));
      fetchProviders();
    } catch (err) {
      toast.error("Failed to save key");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleEnabled = async (providerId: string, current: boolean) => {
    try {
      await fetchApi(`/admin/models/providers/${providerId}`, {
        method: "PUT",
        body: JSON.stringify({ is_enabled: !current }),
      });
      fetchProviders();
    } catch (err) {
      toast.error("Failed to toggle provider");
    }
  };

  const handleSetRoutingMode = async (mode: string, provider?: string) => {
    try {
      await fetchApi("/admin/models/routing-mode", {
        method: "PUT",
        body: JSON.stringify({ mode, provider }),
      });
      setRoutingMode(mode);
      toast.success(`Routing mode: ${mode}`);
    } catch (err) {
      toast.error("Failed to update routing mode");
    }
  };

  const getHealthStatus = (health: ProviderHealth): { label: string; color: string } => {
    if (health.quota_until) return { label: "Quota Exhausted", color: "text-amber-500" };
    if (!health.healthy) return { label: "Offline", color: "text-red-500" };
    if (health.failures > 0) return { label: "Degraded", color: "text-amber-500" };
    return { label: "Healthy", color: "text-emerald-500" };
  };

  const formatLatency = (ms: number) => {
    if (ms === 0) return "—";
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="size-5 animate-spin text-teal-dark dark:text-accent-lime" />
        <span className="ml-2 text-sm text-grey-green dark:text-[#8FA29B]">Loading providers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink dark:text-cream-soft flex items-center gap-2">
            <Brain className="size-5 text-teal-dark dark:text-accent-lime" />
            AI Provider Management
          </h2>
          <p className="text-xs text-grey-green dark:text-[#8FA29B] mt-1">
            Configure providers, manage API keys, and monitor failover health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-grey-green dark:text-[#8FA29B]">Routing:</span>
          <div className="flex rounded-lg border border-mist-green dark:border-[#2A3838] overflow-hidden">
            <button
              onClick={() => handleSetRoutingMode("auto")}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                routingMode === "auto"
                  ? "bg-teal-dark dark:bg-accent-lime text-white dark:text-[#0D1B1B]"
                  : "bg-cream-light dark:bg-[#1C2323] text-ink dark:text-cream-soft hover:bg-mist-green dark:hover:bg-[#2A3838]"
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => handleSetRoutingMode("manual", providers[0]?.provider)}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                routingMode === "manual"
                  ? "bg-teal-dark dark:bg-accent-lime text-white dark:text-[#0D1B1B]"
                  : "bg-cream-light dark:bg-[#1C2323] text-ink dark:text-cream-soft hover:bg-mist-green dark:hover:bg-[#2A3838]"
              }`}
            >
              Manual
            </button>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {providers.map((p) => {
          const Icon = PROVIDER_ICONS[p.provider] || Brain;
          const healthStatus = getHealthStatus(p.health);
          const showKeyInput = editingKeys[p.provider] !== undefined;

          return (
            <div
              key={p.id}
              className={`relative bg-gradient-to-br ${PROVIDER_COLORS[p.provider] || ""} rounded-2xl border p-5 space-y-4`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white dark:bg-[#1C2323] flex items-center justify-center shadow-sm">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink dark:text-cream-soft">
                      {PROVIDER_LABELS[p.provider] || p.provider}
                    </h3>
                    <p className="text-[11px] font-mono text-grey-green dark:text-[#8FA29B]">
                      {p.model_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-[11px] font-semibold ${healthStatus.color}`}>
                    {p.health.healthy && !p.health.quota_until ? (
                      <CheckCircle className="size-3" />
                    ) : (
                      <XCircle className="size-3" />
                    )}
                    {healthStatus.label}
                  </span>
                  <button
                    onClick={() => handleToggleEnabled(p.id, p.is_enabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                      p.is_enabled
                        ? "bg-teal-dark dark:bg-accent-lime"
                        : "bg-grey-green/30 dark:bg-[#2A3838]"
                    }`}
                    aria-label={`Toggle ${p.provider}`}
                  >
                    <span
                      className={`inline-block size-3.5 transform rounded-full bg-white transition ${
                        p.is_enabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Priority & Rate Limits */}
              <div className="flex items-center gap-4 text-[11px] font-mono text-grey-green dark:text-[#8FA29B]">
                <span>Priority: #{p.priority}</span>
                {p.rate_limit_rpm && <span>{p.rate_limit_rpm} RPM</span>}
                {p.rate_limit_tpd && <span>{(p.rate_limit_tpd / 1000).toFixed(0)}k TPD</span>}
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-ink dark:text-cream-soft uppercase tracking-wider">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={visibleKeys[p.provider] ? "text" : "password"}
                      value={editingKeys[p.provider] ?? (p.has_key ? "••••••••••••••••" : "")}
                      onChange={(e) => setEditingKeys((prev) => ({ ...prev, [p.provider]: e.target.value }))}
                      placeholder={p.has_key ? "Key configured" : "Enter API key..."}
                      className="w-full px-3 py-1.5 pr-9 rounded-lg bg-white dark:bg-[#0D1B1B] border border-mist-green dark:border-[#2A3838] text-xs font-mono text-ink dark:text-cream-soft placeholder:text-grey-green/50 dark:placeholder:text-[#8FA29B]/50 focus:outline-none focus:ring-1 focus:ring-teal-dark dark:focus:ring-accent-lime"
                    />
                    <button
                      onClick={() => setVisibleKeys((prev) => ({ ...prev, [p.provider]: !prev[p.provider] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-grey-green dark:text-[#8FA29B] hover:text-ink dark:hover:text-cream-soft"
                    >
                      {visibleKeys[p.provider] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  {showKeyInput && (
                    <button
                      onClick={() => handleSaveKey(p.provider)}
                      disabled={savingId === p.provider}
                      className="px-3 py-1.5 rounded-lg bg-teal-dark dark:bg-accent-lime text-white dark:text-[#0D1B1B] text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {savingId === p.provider ? "Saving..." : "Save"}
                    </button>
                  )}
                  <button
                    onClick={() => handleTestConnection(p.id)}
                    disabled={testingId === p.id || !p.has_key}
                    className="px-3 py-1.5 rounded-lg border border-mist-green dark:border-[#2A3838] text-xs font-semibold text-ink dark:text-cream-soft hover:bg-cream-light dark:hover:bg-[#232D2D] disabled:opacity-50"
                  >
                    {testingId === p.id ? (
                      <RefreshCw className="size-3 animate-spin inline" />
                    ) : (
                      "Test"
                    )}
                  </button>
                </div>
                {!p.has_key && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    Not configured — requests will failover to next provider
                  </p>
                )}
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                <div className="text-center">
                  <div className="text-lg font-bold text-ink dark:text-cream-soft">
                    {p.usage.total_requests.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-grey-green dark:text-[#8FA29B]">Requests (24h)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-ink dark:text-cream-soft">
                    {formatLatency(p.usage.p50_latency_ms)}
                  </div>
                  <div className="text-[10px] font-mono text-grey-green dark:text-[#8FA29B]">P50 Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-ink dark:text-cream-soft">
                    {p.usage.failed}
                  </div>
                  <div className="text-[10px] font-mono text-grey-green dark:text-[#8FA29B]">Errors (24h)</div>
                </div>
              </div>

              {/* Last check */}
              <div className="text-[10px] font-mono text-grey-green dark:text-[#8FA29B] flex items-center gap-1">
                <Clock className="size-3" />
                Last check: {formatTime(p.last_health_check)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Failover Log */}
      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-mist-green dark:border-[#2A3838] flex items-center gap-2">
          <Activity className="size-4 text-teal-dark dark:text-accent-lime" />
          <h3 className="text-sm font-bold text-ink dark:text-cream-soft">Failover Log</h3>
          <span className="text-[10px] font-mono text-grey-green dark:text-[#8FA29B] ml-auto">
            Last 20 events
          </span>
        </div>
        {failovers.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-grey-green dark:text-[#8FA29B]">
            No failover events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-mist-green dark:border-[#2A3838]">
                  <th className="px-4 py-2 text-left font-semibold text-grey-green dark:text-[#8FA29B]">Time</th>
                  <th className="px-4 py-2 text-left font-semibold text-grey-green dark:text-[#8FA29B]">From</th>
                  <th className="px-4 py-2 text-left font-semibold text-grey-green dark:text-[#8FA29B]">To</th>
                  <th className="px-4 py-2 text-left font-semibold text-grey-green dark:text-[#8FA29B]">Reason</th>
                  <th className="px-4 py-2 text-left font-semibold text-grey-green dark:text-[#8FA29B]">Type</th>
                </tr>
              </thead>
              <tbody>
                {failovers.map((f, i) => (
                  <tr key={i} className="border-b border-mist-green/50 dark:border-[#2A3838]/50 last:border-0">
                    <td className="px-4 py-2 font-mono text-ink dark:text-cream-soft">
                      {formatTime(f.timestamp)}
                    </td>
                    <td className="px-4 py-2 text-ink dark:text-cream-soft">{PROVIDER_LABELS[f.from_provider] || f.from_provider}</td>
                    <td className="px-4 py-2 text-ink dark:text-cream-soft flex items-center gap-1">
                      <ArrowRight className="size-3 text-teal-dark dark:text-accent-lime" />
                      {PROVIDER_LABELS[f.to_provider] || f.to_provider}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        f.error_type === "quota"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {f.error_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-grey-green dark:text-[#8FA29B]">{f.request_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
