import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  Filter,
  Info,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  Sparkles,
  Trash2,
  Terminal,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface LogEntry {
  id?: string;
  timestamp: string;
  level: "INFO" | "WARN" | "WARNING" | "ERROR" | "DEBUG" | "CRITICAL";
  logger?: string;
  message: string | object;
  filename?: string;
  lineno?: number;
  exc_info?: string;
  path?: string;
  status_code?: number;
  duration_ms?: number;
  type?: string;
  url?: string;
  method?: string;
  status?: number;
  duration?: number;
}

interface SystemMetrics {
  service: string;
  version: string;
  uptime_seconds: number;
  memory_mb: number;
  python_version: string;
  pid: number;
  environment: string;
  gemini_model: string;
  gemini_configured: boolean;
  database_url_configured: boolean;
  hybrid_memory_enabled: boolean;
  websocket_enabled: boolean;
}

interface LogSummary {
  total_backend_logs: number;
  total_frontend_logs: number;
  total_network_requests: number;
  error_count: number;
  warn_count: number;
  info_count: number;
}

interface TelemetryResponse {
  success: boolean;
  backendLogs: LogEntry[];
  frontendLogs: LogEntry[];
  networkRequests: LogEntry[];
  sessionEvents: LogEntry[];
  systemMetrics: SystemMetrics;
  summary: LogSummary;
}

export default function LogsPage() {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "backend" | "frontend" | "network" | "errors">("all");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState<number>(2000);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/v1/system/logs");
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json: TelemetryResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalMs]);

  const handleClearLogs = async () => {
    try {
      await fetch("/api/v1/system/logs/clear", { method: "POST" });
      toast.success("System log buffers cleared.");
      fetchLogs();
    } catch (err) {
      toast.error("Failed to clear logs.");
    }
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summa-system-telemetry-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Telemetry logs exported as JSON");
  };

  // Combine and format logs based on tab
  const getDisplayLogs = (): (LogEntry & { sourceTag: string })[] => {
    if (!data) return [];
    let combined: (LogEntry & { sourceTag: string })[] = [];

    if (activeTab === "all" || activeTab === "backend" || activeTab === "errors") {
      combined.push(...data.backendLogs.map((l) => ({ ...l, sourceTag: "BACKEND" })));
    }
    if (activeTab === "all" || activeTab === "frontend" || activeTab === "errors") {
      combined.push(
        ...data.frontendLogs.map((l, i) => ({
          ...l,
          id: l.id || `fe-${i}`,
          level: l.level || (l.type === "error" ? "ERROR" : "INFO"),
          message: typeof l.message === "object" ? JSON.stringify(l.message) : String(l.message || l),
          sourceTag: "FRONTEND",
        }))
      );
    }
    if (activeTab === "all" || activeTab === "network" || activeTab === "errors") {
      combined.push(
        ...data.networkRequests.map((n, i) => ({
          timestamp: n.timestamp || new Date().toISOString(),
          level: (n.status && n.status >= 400 ? "ERROR" : "INFO") as any,
          logger: "network.fetch",
          message: `${n.method || "GET"} ${n.url || ""} -> Status ${n.status || 200} (${n.duration ? n.duration.toFixed(1) : 0}ms)`,
          id: `net-${i}`,
          sourceTag: "NETWORK",
        }))
      );
    }

    if (activeTab === "errors") {
      combined = combined.filter((l) => ["ERROR", "CRITICAL", "FAILED"].includes(l.level.toUpperCase()));
    }

    if (levelFilter !== "ALL") {
      combined = combined.filter((l) => l.level.toUpperCase() === levelFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter((l) => {
        const msgStr = typeof l.message === "object" ? JSON.stringify(l.message) : String(l.message);
        return (
          msgStr.toLowerCase().includes(q) ||
          (l.logger && l.logger.toLowerCase().includes(q)) ||
          (l.exc_info && l.exc_info.toLowerCase().includes(q))
        );
      });
    }

    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const displayLogs = getDisplayLogs();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-slate-300">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="size-5 text-purple-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">System & Runtime Diagnostics</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated runtime logs, FastAPI HTTP metrics, Cognee memory streams, and browser console errors.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
              autoRefresh
                ? "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {autoRefresh ? <Pause size={13} /> : <Play size={13} />}
            {autoRefresh ? "Auto-refreshing (2s)" : "Paused"}
          </button>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleExportJson}
            disabled={!data}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition flex items-center gap-1.5"
          >
            <Download size={13} />
            Export JSON
          </button>

          <button
            onClick={handleClearLogs}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            Clear Buffer
          </button>
        </div>
      </header>

      {/* System Metrics Bar */}
      {data?.systemMetrics && (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Server size={12} className="text-purple-400" /> API Service
            </span>
            <div className="text-sm font-semibold text-white">{data.systemMetrics.service}</div>
            <div className="text-[10px] text-slate-500">v{data.systemMetrics.version} · PID {data.systemMetrics.pid}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Clock size={12} className="text-indigo-400" /> Uptime
            </span>
            <div className="text-sm font-semibold text-white">
              {Math.floor(data.systemMetrics.uptime_seconds / 60)}m {Math.floor(data.systemMetrics.uptime_seconds % 60)}s
            </div>
            <div className="text-[10px] text-slate-500">Python {data.systemMetrics.python_version}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Cpu size={12} className="text-cyan-400" /> Process Memory
            </span>
            <div className="text-sm font-semibold text-white">{data.systemMetrics.memory_mb} MB</div>
            <div className="text-[10px] text-slate-500">RSS allocation</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> Gemini 2.5 Flash
            </span>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              {data.systemMetrics.gemini_configured ? (
                <span className="text-emerald-400 text-xs flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </span>
              ) : (
                <span className="text-amber-400 text-xs flex items-center gap-1">
                  <AlertTriangle size={12} /> Fallback
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 truncate">{data.systemMetrics.gemini_model}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Database size={12} className="text-emerald-400" /> DB Connection
            </span>
            <div className="text-sm font-semibold text-white">
              {data.systemMetrics.database_url_configured ? "PostgreSQL" : "In-Memory Store"}
            </div>
            <div className="text-[10px] text-slate-500">Hybrid Memory Active</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Activity size={12} className="text-rose-400" /> Buffer Health
            </span>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-rose-400 font-bold">{data.summary.error_count} Errors</span>
              <span className="text-amber-400">{data.summary.warn_count} Warns</span>
            </div>
            <div className="text-[10px] text-slate-500">{data.summary.total_backend_logs} Total records</div>
          </div>
        </section>
      )}

      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Tabs */}
        <div className="flex items-center overflow-x-auto gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
          {(["all", "backend", "frontend", "network", "errors"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition whitespace-nowrap ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {tab === "all"
                ? "All Telemetry"
                : tab === "backend"
                ? "Backend API"
                : tab === "frontend"
                ? "Browser Console"
                : tab === "network"
                ? "Network Requests"
                : "Errors & Exceptions"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs by keyword, logger..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter size={13} />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Showing <strong className="text-slate-200">{displayLogs.length}</strong> log entries
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Buffer Limit: 1000 items
          </div>
        </div>

        {displayLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Info className="size-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">No log entries match the selected filters.</p>
            <p className="text-xs text-slate-600">Try adjusting your search or clearing level filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[650px] overflow-y-auto font-mono text-xs">
            {displayLogs.map((log, index) => {
              const logId = log.id || `idx-${index}`;
              const isExpanded = expandedLogId === logId;
              const isError = ["ERROR", "CRITICAL", "FAILED"].includes(log.level.toUpperCase());
              const isWarn = ["WARN", "WARNING"].includes(log.level.toUpperCase());

              return (
                <div
                  key={logId}
                  className={`p-3 transition hover:bg-slate-850 cursor-pointer ${
                    isError ? "bg-rose-950/20" : isWarn ? "bg-amber-950/15" : ""
                  }`}
                  onClick={() => setExpandedLogId(isExpanded ? null : logId)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Source Tag */}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        {log.sourceTag}
                      </span>

                      {/* Level Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isError
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : isWarn
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        }`}
                      >
                        {log.level}
                      </span>

                      {/* Timestamp */}
                      <span className="text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString("en-US", {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          fractionalSecondDigits: 3,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-slate-500 text-[11px]">
                      {log.logger && <span>{log.logger}</span>}
                      {log.duration_ms && <span className="text-purple-400 font-semibold">{log.duration_ms}ms</span>}
                    </div>
                  </div>

                  {/* Log Message */}
                  <div className="mt-1.5 text-slate-200 break-words leading-relaxed">
                    {typeof log.message === "object" ? JSON.stringify(log.message) : log.message}
                  </div>

                  {/* Exception Traceback Expansion */}
                  {log.exc_info && (
                    <div className="mt-2 text-rose-300 bg-rose-950/40 p-3 rounded-lg border border-rose-900/60 overflow-x-auto whitespace-pre font-mono text-[11px]">
                      {log.exc_info}
                    </div>
                  )}

                  {/* Expanded Payload View */}
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-2">
                      <div className="font-semibold text-slate-400">Detailed Telemetry Payload:</div>
                      <pre className="text-purple-300 overflow-x-auto">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
