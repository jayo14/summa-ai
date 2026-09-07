import React from "react";
import { Info } from "lucide-react";

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
    <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl p-4 space-y-2 shadow-2xs">
      <div className="flex items-center justify-between text-xs text-grey-green dark:text-[#8FA29B] font-medium">
        <span>{title}</span>
        <Info size={13} className="text-grey-green dark:text-[#8FA29B] cursor-pointer" />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold text-ink dark:text-cream-soft">{value}</span>
        {change && (
          <span className={`text-[11px] font-semibold ${isPositive ? "text-teal-dark dark:text-accent-lime" : "text-rose-500"}`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">{comparison}</div>
      <svg className="w-full h-7 fill-none" viewBox="0 0 100 25" style={{ stroke: strokeColor }}>
        <path d="M0,20 Q20,10 40,22 T80,12 T100,6" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}
