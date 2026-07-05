import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { AnalyticsView } from "@/components/prompt-kit/analytics-view"

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
