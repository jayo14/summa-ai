import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { TimelineView } from "@/components/prompt-kit/timeline-view"

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
