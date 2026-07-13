import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { AnalyticsView } from "@/components/prompt-kit/analytics-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Progress — Summa AI",
  description: "Track your learning progress with Summa AI. View your proficiency hexagon, quiz scores, and study time analytics.",
}


export const dynamic = "force-dynamic"

export default function ProgressPage() {
  return (
    <DashboardPageShell
      title="Progress"
      description="Track your study momentum, quiz scores, and readiness."
      activePath="/progress"
    >
      <AnalyticsView />
    </DashboardPageShell>
  )
}
