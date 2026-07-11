import * as React from "react"
import { cn } from "@/lib/utils"

export type FocusRingSize = "sm" | "md" | "lg"
export type FocusRingState = "active" | "complete" | "idle"

export interface FocusRingProps {
  value?: number
  size?: FocusRingSize
  state?: FocusRingState
  className?: string
  children?: React.ReactNode
  "aria-label"?: string
}

const SIZE_MAP: Record<FocusRingSize, { viewBox: string; center: number; radius: number; stroke: number; textClass: string; valueClass: string; labelClass: string }> = {
  sm: { viewBox: "0 0 48 48", center: 24, radius: 20, stroke: 4, textClass: "text-[0.625rem]", valueClass: "text-sm font-bold", labelClass: "text-[0.5rem]" },
  md: { viewBox: "0 0 72 72", center: 36, radius: 30, stroke: 6, textClass: "text-xs", valueClass: "text-lg font-bold", labelClass: "text-[0.625rem]" },
  lg: { viewBox: "0 0 120 120", center: 60, radius: 52, stroke: 8, textClass: "text-sm", valueClass: "text-2xl font-bold", labelClass: "text-xs" },
}

export function FocusRing({ value = 0, size = "md", state = "idle", className, children, "aria-label": ariaLabel }: FocusRingProps) {
  const config = SIZE_MAP[size]
  const circumference = 2 * Math.PI * config.radius
  const displayValue = Math.max(0, Math.min(100, Math.round(value)))
  const showProgress = state !== "idle"
  const dashOffset = showProgress ? circumference * (1 - displayValue / 100) : circumference

  const label = ariaLabel ?? `Progress ${displayValue}%`

  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={showProgress ? displayValue : undefined}
      aria-label={label}
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: `var(--ring-size-${size})`, height: `var(--ring-size-${size})` }}
    >
      <svg
        viewBox={config.viewBox}
        className="size-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={config.center}
          cy={config.center}
          r={config.radius}
          fill="none"
          stroke="var(--summa-track)"
          strokeWidth={config.stroke}
        />
        {showProgress && (
          <circle
            cx={config.center}
            cy={config.center}
            r={config.radius}
            fill="none"
            stroke="var(--summa-accent)"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            className={state === "active" ? "animate-[ring-pulse_2s_ease-in-out_infinite]" : ""}
          />
        )}
        {state === "complete" && (
          <circle
            cx={config.center}
            cy={config.center}
            r={config.radius}
            fill="none"
            stroke="var(--summa-accent)"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: "none" }}>
        {children ? (
          children
        ) : (
          <>
            <span className={cn(config.valueClass, "text-foreground tabular-nums")}>{displayValue}%</span>
            <span className={cn(config.labelClass, "text-muted-foreground uppercase tracking-wider")}>{state}</span>
          </>
        )}
      </span>
    </span>
  )
}
