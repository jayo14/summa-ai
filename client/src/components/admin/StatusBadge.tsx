import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let bg = "bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft border border-mist-green dark:border-[#2A3838]";
  let dot = "bg-cream-light dark:bg-[#232D2D]0";

  if (["active", "published", "completed", "operational", "successful", "paid", "delivered", "resolved"].includes(s)) {
    bg = "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime border border-teal-dark/30 dark:border-accent-lime/30";
    dot = "bg-teal-dark/10 dark:bg-accent-lime";
  } else if (["pending", "processing", "scheduled", "trial", "draft", "in review", "open"].includes(s)) {
    bg = "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime border border-teal-dark/30 dark:border-accent-lime/30/60";
    dot = "bg-teal-dark/10 dark:bg-accent-lime/100";
  } else if (["suspended", "inactive", "failed", "degraded", "cancelled", "unread", "offline", "high"].includes(s)) {
    bg = "bg-destructive/10 dark:bg-[#be747e]/10 text-destructive dark:text-[#be747e] border border-destructive/30 dark:border-[#be747e]/30/60";
    dot = "bg-destructive/10 dark:bg-[#be747e]/100";
  } else if (["live", "pro", "enterprise"].includes(s)) {
    bg = "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime border border-teal-dark/30 dark:border-accent-lime/30";
    dot = "bg-teal-dark/10 dark:bg-accent-lime animate-pulse";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${bg}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
