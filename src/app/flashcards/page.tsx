import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { FlashcardReview } from "@/components/prompt-kit/flashcard-review"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Flashcards — Summa AI",
  description: "Review flashcards to strengthen your memory.",
}

export default function FlashcardsPage() {
  return (
    <DashboardPageShell
      title="Flashcards"
      description="Review cards to strengthen memory."
      activePath="/flashcards"
    >
      <FlashcardReview />
    </DashboardPageShell>
  )
}
