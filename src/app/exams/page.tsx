import { DashboardPageShell } from "@/components/dashboard-page-shell"
import { ExamCountdown } from "@/components/prompt-kit/exam-countdown"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Exams — Summa AI",
  description: "Countdown and readiness for upcoming exams.",
}

export default function ExamsPage() {
  return (
    <DashboardPageShell
      title="Exams"
      description="Countdown and readiness for upcoming exams."
      activePath="/exams"
    >
      <ExamCountdown />
    </DashboardPageShell>
  )
}
