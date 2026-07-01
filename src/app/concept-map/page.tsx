import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { KnowledgeBaseView } from "@/components/prompt-kit/knowledge-base-view"

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
