'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/use-supabase-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Clock,
  Sparkles,
  Trophy,
  Target,
  FileText,
  Brain,
  Upload,
  CheckCircle2,
  Flame,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { FocusRing } from '@/components/focus-ring'
import { fetchTimelineEvents, type TimelineEvent } from '@/lib/api'

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 't1',
    type: 'streak',
    title: '7-day study streak!',
    description: 'You\'ve studied every day for a week. Keep it up!',
    timestamp: 'Today, 2:30 PM',
    meta: [{ label: 'Streak', value: '7 days' }],
  },
  {
    id: 't2',
    type: 'quiz-completed',
    title: 'Completed: NLP Fundamentals Quiz',
    description: 'You scored 85% on the Transformers quiz. Strong work on attention mechanics.',
    timestamp: 'Today, 1:15 PM',
    meta: [
      { label: 'Score', value: '85%' },
      { label: 'Correct', value: '7/8' },
    ],
  },
  {
    id: 't3',
    type: 'recommendation',
    title: 'AI Recommendation',
    description: 'Based on your quiz results, review Positional Encoding before tomorrow. I\'ve generated flashcards for you.',
    timestamp: 'Today, 1:16 PM',
  },
  {
    id: 't4',
    type: 'artifact-generated',
    title: 'Generated: Transformers Flashcards',
    description: '12 flashcards created from your lecture notes on attention mechanisms.',
    timestamp: 'Today, 11:00 AM',
    meta: [{ label: 'Cards', value: '12' }],
  },
  {
    id: 't5',
    type: 'study-session',
    title: 'Study session: NLP',
    description: '45 minutes studying Word Embeddings and Attention.',
    timestamp: 'Yesterday, 3:00 PM',
    meta: [{ label: 'Duration', value: '45m' }],
  },
  {
    id: 't6',
    type: 'resource-uploaded',
    title: 'Uploaded: Attention is All You Need',
    description: 'PDF processed. 8 concepts extracted and added to your knowledge graph.',
    timestamp: 'Yesterday, 10:30 AM',
    meta: [{ label: 'Concepts', value: '8' }],
  },
  {
    id: 't7',
    type: 'milestone',
    title: 'Milestone: 100 concepts mastered',
    description: 'You\'ve reached 100 mastered concepts across all your subjects. Incredible progress!',
    timestamp: '2 days ago',
  },
  {
    id: 't8',
    type: 'quiz-completed',
    title: 'Completed: Linear Algebra Quiz',
    description: 'Perfect score! You\'ve mastered eigenvalues and SVD.',
    timestamp: '3 days ago',
    meta: [
      { label: 'Score', value: '100%' },
      { label: 'Correct', value: '10/10' },
    ],
  },
  {
    id: 't9',
    type: 'reminder',
    title: 'Exam reminder',
    description: 'Your NLP Final is in 14 days. Current readiness: 62%. Time to intensify prep.',
    timestamp: '3 days ago',
  },
  {
    id: 't10',
    type: 'artifact-generated',
    title: 'Generated: 6-Week Study Plan',
    description: 'Personalized study plan created for your NLP Final exam prep.',
    timestamp: '4 days ago',
    meta: [{ label: 'Tasks', value: '24' }],
  },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const EVENT_META: Record<TimelineEvent['type'], { icon: React.ReactNode; color: string; label: string }> = {
  'artifact-generated': { icon: <Sparkles className="size-4" />, color: 'bg-primary/10 text-primary', label: 'Artifact' },
  'quiz-completed': { icon: <Brain className="size-4" />, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400', label: 'Quiz' },
  'study-session': { icon: <Clock className="size-4" />, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', label: 'Study' },
  'resource-uploaded': { icon: <Upload className="size-4" />, color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400', label: 'Upload' },
  'milestone': { icon: <Trophy className="size-4" />, color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400', label: 'Milestone' },
  'recommendation': { icon: <Sparkles className="size-4" />, color: 'bg-green-500/10 text-green-700 dark:text-green-400', label: 'AI' },
  'reminder': { icon: <Target className="size-4" />, color: 'bg-red-500/10 text-red-700 dark:text-red-400', label: 'Reminder' },
  'streak': { icon: <Flame className="size-4" />, color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400', label: 'Streak' },
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export function TimelineView() {
  const { session } = useAuth()
  const token = session?.accessToken
  const [loading, setLoading] = React.useState(true)
  const [events, setEvents] = React.useState<TimelineEvent[]>([])

  React.useEffect(() => {
    if (!token) { setLoading(false); return }
    fetchTimelineEvents(token).then(data => {
      if (data) setEvents(data)
    }).finally(() => setLoading(false))
  }, [token])

  const displayEvents = events.length > 0 ? events : TIMELINE_EVENTS

  const artifactsCount = displayEvents.filter(e => e.type === 'artifact-generated').length
  const quizzesCount = displayEvents.filter(e => e.type === 'quiz-completed').length

  const totalMinutes = displayEvents
    .filter(e => e.type === 'study-session' && e.meta)
    .flatMap(e => e.meta!)
    .filter(m => m.label === 'Duration')
    .reduce((acc, m) => {
      const num = parseInt(m.value)
      return acc + (isNaN(num) ? 0 : num)
    }, 0)
  const studyHours = totalMinutes >= 60 ? `${Math.round(totalMinutes / 60)}h` : `${totalMinutes}m`

  if (loading) {
    return (
      <div className="thin-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Study Timeline</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your learning journey — like Git history, but for your brain.</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Study Timeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your learning journey — like Git history, but for your brain.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center justify-center">
            <FocusRing value={70} size="sm" state="active" aria-label="7-day streak, 70%" />
          </div>
          <StatCard label="Artifacts" value={String(artifactsCount)} icon={<Sparkles className="size-4" />} color="text-primary" />
          <StatCard label="Quizzes taken" value={String(quizzesCount)} icon={<Brain className="size-4" />} color="text-purple-500" />
          <StatCard label="Study hours" value={studyHours} icon={<Clock className="size-4" />} color="text-blue-500" />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute bottom-2 left-[19px] top-2 w-px bg-border" />

          <ol className="space-y-4">
            {displayEvents.map((event, i) => {
              const meta = EVENT_META[event.type]
              return (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className="relative flex gap-4 pl-1"
                >
                  {/* Dot */}
                  <div className={cn('relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-background', meta.color)}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <Card className="flex-1">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-sm leading-snug">{event.title}</CardTitle>
                          <p className="mt-0.5 text-xs text-muted-foreground">{event.timestamp}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {meta.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      {event.meta && event.meta.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {event.meta.map((m) => (
                            <span
                              key={m.label}
                              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                            >
                              <span className="text-muted-foreground">{m.label}:</span>
                              <span className="font-medium">{m.value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {event.type === 'recommendation' && (
                        <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs">
                          <ChevronRight className="size-3" /> Review flashcards
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.li>
              )
            })}
          </ol>
        </div>

        {/* Footer insight */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 py-4">
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <TrendingUp className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Weekly summary</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                You completed 3 quizzes (avg 84%), generated 5 artifacts, and studied 12 hours this week.
                Your strongest area is Linear Algebra (92%), and your biggest opportunity is Transformers (20%).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={color}>{icon}</span>
          {label}
        </div>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}

export default TimelineView
