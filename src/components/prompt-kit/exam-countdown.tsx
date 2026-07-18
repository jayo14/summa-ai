"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy } from "lucide-react"

const EXAMS = [
  { id: "1", name: "NLP Final", date: "2026-08-01", readiness: 62 },
  { id: "2", name: "Deep Learning Final", date: "2026-08-04", readiness: 78 },
  { id: "3", name: "Calculus II", date: "2026-08-08", readiness: 88 },
]

function daysUntil(dateStr: string) {
  const now = new Date()
  const target = new Date(dateStr + "T00:00:00")
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function ExamCountdown() {
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
          {EXAMS.map((exam) => {
            const days = daysUntil(exam.date)
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
