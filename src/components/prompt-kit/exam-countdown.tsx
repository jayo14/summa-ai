"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy } from "lucide-react"
import type { Exam } from "@/lib/api"
import { fetchExamsList } from "@/lib/api"

const SAMPLE_EXAMS: Exam[] = [
  { id: "1", name: "NLP Final", exam_date: "2026-08-01", readiness: 62, created_at: "" },
  { id: "2", name: "Deep Learning Final", exam_date: "2026-08-04", readiness: 78, created_at: "" },
  { id: "3", name: "Calculus II", exam_date: "2026-08-08", readiness: 88, created_at: "" },
]

function daysUntil(dateStr: string) {
  const now = new Date()
  const target = new Date(dateStr + "T00:00:00")
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function ExamCountdown() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const [exams, setExams] = React.useState<Exam[]>(SAMPLE_EXAMS)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetchExamsList(token).then((fetched) => {
      if (fetched && fetched.length > 0) {
        setExams(fetched)
      }
      setLoading(false)
    })
  }, [token])

  if (loading) {
    return (
      <div className="thin-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <p className="text-sm text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Exams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Countdown and readiness for upcoming exams.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const days = daysUntil(exam.exam_date)
            return (
              <Card key={exam.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{exam.name}</CardTitle>
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tabular-nums">{days}</span>
                    <span className="text-sm text-muted-foreground">
                      {days === 1 ? "day" : "days"} left
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={exam.readiness >= 80 ? "default" : "secondary"} className="gap-1.5">
                      <Trophy className="size-3.5" />
                      {exam.readiness}% ready
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
