import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { ResourcesView } from "@/components/prompt-kit/resources-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Saved Materials — Summa AI",
  description: "Browse your saved study materials, artifacts, and resources from your Summa AI learning sessions.",
}


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
