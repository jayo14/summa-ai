"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle2, Circle, Flame } from "lucide-react"

const SAMPLE_PLAN = {
  title: "NLP Final — 2 Week Sprint",
  progress: 0.35,
  daysLeft: 12,
  streak: 5,
  sessions: [
    { id: "1", day: "Mon", topic: "Attention Mechanisms", status: "done", duration: "45 min" },
    { id: "2", day: "Tue", topic: "Transformers & BERT", status: "done", duration: "60 min" },
    { id: "3", day: "Wed", topic: "Positional Encoding", status: "in-progress", duration: "30 min" },
    { id: "4", day: "Thu", topic: "Fine-tuning Strategies", status: "upcoming", duration: "45 min" },
    { id: "5", day: "Fri", topic: "Evaluation Metrics", status: "upcoming", duration: "30 min" },
  ],
}

export function StudyPlanView() {
  const plan = SAMPLE_PLAN

  return (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Study Plan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your personalized roadmap to exam readiness.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5">
              <Flame className="size-3.5" />
              {plan.streak} day streak
            </Badge>
            <Badge variant="outline">{plan.daysLeft} days left</Badge>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{plan.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="tabular-nums font-medium">{Math.round(plan.progress * 100)}%</span>
            </div>
            <Progress value={plan.progress * 100} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {plan.sessions.map((session) => (
            <Card key={session.id} className={session.status === "in-progress" ? "border-primary/40" : ""}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="mt-0.5">
                  {session.status === "done" ? (
                    <CheckCircle2 className="size-5 text-green-600" />
                  ) : session.status === "in-progress" ? (
                    <Circle className="size-5 text-primary fill-primary/20" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{session.topic}</div>
                  <div className="text-xs text-muted-foreground">
                    {session.day} · {session.duration}
                  </div>
                </div>
                {session.status === "in-progress"" && (
                  <Badge variant="default" className="text-xs">In progress</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
