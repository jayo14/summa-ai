import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { ResourcesView } from "@/components/prompt-kit/resources-view"

export const dynamic = "force-dynamic"

export default function SavedMaterialsPage() {
  return (
    <DashboardPageShell
      title="Saved Materials"
      description="Browse the flashcards, quizzes, notes, and study plans you’ve saved."
      activePath="/saved-materials"
    >
      <ResourcesView />
    </DashboardPageShell>
  )
}
