import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { TimelineView } from "@/components/prompt-kit/timeline-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Study Timeline — Summa AI",
  description: "View your study timeline and schedule with Summa AI. Plan your learning sessions and track upcoming exams.",
}


export const dynamic = "force-dynamic"

export default function StudyTimelinePage() {
  return (
    <DashboardPageShell
      title="Study Timeline"
      description="Review your learning history and recent milestones."
      activePath="/study-timeline"
    >
      <TimelineView />
    </DashboardPageShell>
  )
}
