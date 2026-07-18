import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { StudyPlanView } from "@/components/prompt-kit/study-plan-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Study Plan — Summa AI",
  description: "View and manage your personalized study plan.",
}

export default function StudyPlanPage() {
  return (
    <DashboardPageShell
      title="Study Plan"
      description="Your personalized roadmap to exam readiness."
      activePath="/study-plan"
    >
      <StudyPlanView />
    </DashboardPageShell>
  )
}
