import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { KnowledgeBaseView } from "@/components/prompt-kit/knowledge-base-view"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Concept Map — Summa AI",
  description: "Explore your knowledge graph and concept map. Visualize connections between topics you're learning.",
}


export const dynamic = "force-dynamic"

export default function ConceptMapPage() {
  return (
    <DashboardPageShell
      title="Concept Map"
      description="See how the ideas you learn connect to one another."
      activePath="/concept-map"
    >
      <KnowledgeBaseView />
    </DashboardPageShell>
  )
}
