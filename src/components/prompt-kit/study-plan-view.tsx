"use client"

import * as React from "react"
import { useAuth } from "@/lib/use-supabase-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, CheckCircle2, Circle, Flame, Plus } from "lucide-react"
import type { StudyPlan } from "@/lib/api"
import { fetchStudyPlans, updateSessionStatus, createStudyPlan } from "@/lib/api"

const SAMPLE_PLAN: StudyPlan = {
  id: "sample",
  title: "NLP Final — 2 Week Sprint",
  progress: 0.35,
  days_left: 12,
  streak: 5,
  sessions: [
    { id: "1", day: "Mon", topic: "Attention Mechanisms", status: "done", duration: "45 min", sort_order: 0 },
    { id: "2", day: "Tue", topic: "Transformers & BERT", status: "done", duration: "60 min", sort_order: 1 },
    { id: "3", day: "Wed", topic: "Positional Encoding", status: "in-progress", duration: "30 min", sort_order: 2 },
    { id: "4", day: "Thu", topic: "Fine-tuning Strategies", status: "upcoming", duration: "45 min", sort_order: 3 },
    { id: "5", day: "Fri", topic: "Evaluation Metrics", status: "upcoming", duration: "30 min", sort_order: 4 },
  ],
  created_at: "",
  updated_at: "",
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function generateDefaultSessions(days: number, title: string) {
  return Array.from({ length: Math.min(days, 7) }, (_, i) => ({
    day: DAY_NAMES[i % 7],
    topic: `${title} — Session ${i + 1}`,
    status: "upcoming" as const,
    duration: "30 min",
    sort_order: i,
  }))
}

export function StudyPlanView() {
  const { session } = useAuth()
  const token = session?.accessToken as string | undefined
  const [plan, setPlan] = React.useState<StudyPlan>(SAMPLE_PLAN)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetchStudyPlans(token).then((plans) => {
      if (plans && plans.length > 0) {
        setPlan(plans[0])
      }
      setLoading(false)
    })
  }, [token])

  const [createOpen, setCreateOpen] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState("")
  const [newDays, setNewDays] = React.useState("14")

  const handleCreate = async () => {
    if (!newTitle.trim() || !token) return
    const plan = await createStudyPlan(token, {
      title: newTitle.trim(),
      days_left: parseInt(newDays) || 14,
      sessions: generateDefaultSessions(parseInt(newDays) || 14, newTitle.trim()),
    })
    if (plan) {
      setPlan(plan)
    }
    setCreateOpen(false)
    setNewTitle("")
    setNewDays("14")
  }

  const handleToggleSession = async (sessionId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "upcoming" : "done"
    setPlan((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: newStatus as "done" | "in-progress" | "upcoming" } : s
      ),
    }))
    if (token) {
      const updated = await updateSessionStatus(token, sessionId, newStatus)
      if (updated) {
        const newProgress = plan.sessions.length > 0
          ? plan.sessions.filter((s) => (s.id === sessionId ? newStatus === "done" : s.status === "done")).length / plan.sessions.length
          : 0
        setPlan((prev) => ({ ...prev, progress: newProgress }))
      }
    }
  }

  if (loading) {
    return (
      <div className="thin-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <p className="text-sm text-muted-foreground">Loading study plan...</p>
        </div>
      </div>
    )
  }

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
            <Badge variant="outline">{plan.days_left} days left</Badge>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="size-3.5" /> New Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Plan</DialogTitle>
                  <DialogDescription>
                    Give your study plan a name and set the duration.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plan-title">Plan title</Label>
                    <Input
                      id="plan-title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. NLP Final Sprint"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plan-days">Duration (days)</Label>
                    <Input
                      id="plan-days"
                      type="number"
                      min={1}
                      max={90}
                      value={newDays}
                      onChange={(e) => setNewDays(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create Plan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            <Card
              key={session.id}
              className={session.status === "in-progress" ? "border-primary/40 cursor-pointer" : "cursor-pointer"}
              onClick={() => handleToggleSession(session.id, session.status)}
            >
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
                {session.status === "in-progress" && (
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
