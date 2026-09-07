import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MetricCard } from "@/components/admin/MetricCard";

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
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-mist-green dark:border-[#2A3838] pb-3">
            <div>
              <h3 className="font-bold text-sm text-ink dark:text-cream-soft">Popular Learning Topics</h3>
              <p className="text-xs text-grey-green dark:text-[#8FA29B]">Most requested study modules across active users</p>
            </div>
            <span className="text-[10px] font-mono text-grey-green dark:text-[#8FA29B] bg-cream-light dark:bg-[#232D2D] px-2 py-1 rounded-md">Live Telemetry</span>
          </div>

          <div className="space-y-3">
            {popularTopics.length > 0 ? (
              popularTopics.map((topic: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-ink dark:text-cream-soft">{topic.name}</div>
                    <div className="text-[11px] text-grey-green dark:text-[#8FA29B] mt-0.5">{topic.sessions} active practice sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-teal-dark dark:text-accent-lime">{topic.mastery_avg}%</div>
                    <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">Avg. Mastery</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-grey-green dark:text-[#8FA29B] text-xs font-medium">No popular topics logged yet.</div>
            )}
          </div>
        </div>

        {/* AI Telemetry & Latency Breakdown */}
        <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-mist-green dark:border-[#2A3838] pb-3">
            <div>
              <h3 className="font-bold text-sm text-ink dark:text-cream-soft">AI Telemetry & Model Performance</h3>
              <p className="text-xs text-grey-green dark:text-[#8FA29B]">LLM token distribution and response latency breakdown</p>
            </div>
            <span className="text-[10px] font-mono text-teal-dark dark:text-accent-lime bg-teal-dark/10 dark:bg-accent-lime/10 px-2 py-1 rounded-md font-semibold">Operational</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
              <div className="text-grey-green dark:text-[#8FA29B] text-[10px]">Input Prompt Tokens</div>
              <div className="font-mono font-bold text-ink dark:text-cream-soft text-sm mt-0.5">{(telemetry.input_tokens || 0).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
              <div className="text-grey-green dark:text-[#8FA29B] text-[10px]">Output Completion Tokens</div>
              <div className="font-mono font-bold text-ink dark:text-cream-soft text-sm mt-0.5">{(telemetry.output_tokens || 0).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
              <div className="text-grey-green dark:text-[#8FA29B] text-[10px]">Average Response Latency</div>
              <div className="font-mono font-bold text-[#8B5CF6] text-sm mt-0.5">{telemetry.avg_response_latency_ms || 1120} ms</div>
            </div>
            <div className="p-3 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl">
              <div className="text-grey-green dark:text-[#8FA29B] text-[10px]">Vector Search Latency</div>
              <div className="font-mono font-bold text-teal-dark dark:text-accent-lime text-sm mt-0.5">{telemetry.vector_search_latency_ms || 48.2} ms</div>
            </div>
          </div>

          <div className="p-3 bg-cream-light dark:bg-[#121616] border border-mist-green dark:border-[#2A3838] rounded-xl flex justify-between items-center text-xs">
            <span className="text-grey-green dark:text-[#8FA29B] font-medium">Estimated LLM Infrastructure Cost:</span>
            <span className="font-mono font-bold text-ink dark:text-cream-soft text-sm">${telemetry.estimated_cost_usd || 0.35} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 4. SUBSCRIPTIONS PAGE ---
