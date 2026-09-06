import React, { useState, useEffect } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

export function ServerWarmupBanner({ apiBaseUrl }: { apiBaseUrl?: string }) {
  const [status, setStatus] = useState<"idle" | "warming" | "ready" | "hidden">("idle");

  useEffect(() => {
    const rawUrl = apiBaseUrl || getApiBaseUrl() || "/api/v1";
    const healthUrl = `${rawUrl.replace(/\/api\/v1\/?$/, "")}/health`;
    let isMounted = true;

    const timerId = setTimeout(() => {
      if (isMounted && status === "idle") {
        setStatus("warming");
      }
    }, 1800);

    fetch(healthUrl)
      .then((res) => {
        if (res.ok && isMounted) {
          clearTimeout(timerId);
          setStatus("ready");
          setTimeout(() => {
            if (isMounted) setStatus("hidden");
          }, 3000);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [apiBaseUrl]);

  if (status === "idle" || status === "hidden") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold border backdrop-blur-md transition-all ${
          status === "warming"
            ? "bg-slate-900/90 text-amber-300 border-amber-500/30"
            : "bg-emerald-950/90 text-emerald-300 border-emerald-500/30"
        }`}
      >
        {status === "warming" ? (
          <>
            <Zap className="size-4 text-amber-400 animate-pulse shrink-0" />
            <span>⚡ Waking up cloud backend server (Render cold-start ~30s)...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            <span>✅ Cloud backend active and ready!</span>
          </>
        )}
      </div>
    </div>
  );
}
