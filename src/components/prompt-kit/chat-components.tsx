'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FocusRing } from '@/components/focus-ring'
import {
  Hexagon as HexagonIcon,
  Brain,
  Layers,
  CheckCircle2,
  Circle,
  Network,
  Calendar as CalendarIcon,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  Target,
  Zap,
  BookOpen,
  Clock,
  ArrowRight,
  RefreshCw,
  X,
  Check,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ChatComponentType =
  | 'hexagon'
  | 'quiz'
  | 'flashcards'
  | 'study-plan'
  | 'graph'
  | 'timeline'
  | 'gap-analysis'

export interface BaseChatComponent {
  type: ChatComponentType
  title?: string
}

export interface HexagonComponent extends BaseChatComponent {
  type: 'hexagon'
  dimensions: { label: string; score: number }[]
}

export interface QuizComponent extends BaseChatComponent {
  type: 'quiz'
  questions: {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation?: string
  }[]
}

export interface FlashcardsComponent extends BaseChatComponent {
  type: 'flashcards'
  cards: { id: string; front: string; back: string }[]
}

export interface StudyPlanComponent extends BaseChatComponent {
  type: 'study-plan'
  days: {
    id: string
    label: string
    tasks: { id: string; text: string; done?: boolean }[]
  }[]
}

export interface GraphComponent extends BaseChatComponent {
  type: 'graph'
  nodes: {
    id: string
    label: string
    x: number
    y: number
    mastery: 'mastered' | 'learning' | 'struggling' | 'gap'
  }[]
  edges: { from: string; to: string }[]
}

export interface TimelineComponent extends BaseChatComponent {
  type: 'timeline'
  events: {
    id: string
    title: string
    date: string
    description?: string
    status: 'upcoming' | 'past' | 'urgent'
  }[]
}

export interface GapAnalysisComponent extends BaseChatComponent {
  type: 'gap-analysis'
  gaps: {
    id: string
    topic: string
    reason: string
    priority: 'high' | 'medium' | 'low'
    estTime: string
  }[]
}

export type ChatComponentData =
  | HexagonComponent
  | QuizComponent
  | FlashcardsComponent
  | StudyPlanComponent
  | GraphComponent
  | TimelineComponent
  | GapAnalysisComponent

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const MASTERY_DOT: Record<string, string> = {
  mastered: 'bg-green-500',
  learning: 'bg-yellow-500',
  struggling: 'bg-orange-500',
  gap: 'bg-red-500',
}

const PRIORITY_STYLES: Record<'high' | 'medium' | 'low', { badge: string; label: string }> = {
  high: { badge: 'bg-red-500/15 text-red-700 dark:text-red-400', label: 'High' },
  medium: { badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-400', label: 'Medium' },
  low: { badge: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400', label: 'Low' },
}

/* ------------------------------------------------------------------ */
/* Hexagon                                                             */
/* ------------------------------------------------------------------ */

function Hexagon({ data }: { data: HexagonComponent }) {
  const size = 220
  const center = size / 2
  const maxR = 80
  const N = data.dimensions.length

  // Compute polygon points for a given score list (0..1)
  const pointsFor = (scores: number[]) =>
    scores
      .map((s, i) => {
        const angle = (Math.PI * 2 * i) / N - Math.PI / 2
        const r = (s / 100) * maxR
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')

  const maxPoints = pointsFor(data.dimensions.map(() => 100))
  const scorePoints = pointsFor(data.dimensions.map((d) => d.score))
  const avg = Math.round(data.dimensions.reduce((a, b) => a + b.score, 0) / N)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <HexagonIcon className="size-4 text-primary" />
          Proficiency Hexagon
        </CardTitle>
        <CardDescription className="text-xs">
          Your multi-dimensional learning profile · avg {avg}%
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <svg width={size} height={size} className="shrink-0">
          {/* Concentric rings (25/50/75/100) */}
          {[25, 50, 75, 100].map((r) => (
            <polygon
              key={r}
              points={pointsFor(Array(N).fill(r))}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={1}
              strokeDasharray={r === 100 ? undefined : '2 3'}
            />
          ))}
          {/* Axes */}
          {data.dimensions.map((_, i) => {
            const angle = (Math.PI * 2 * i) / N - Math.PI / 2
            const x = center + maxR * Math.cos(angle)
            const y = center + maxR * Math.sin(angle)
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
            )
          })}
          {/* Score polygon */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
            points={scorePoints}
            fill="hsl(var(--primary) / 0.20)"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          {/* Score points */}
          {data.dimensions.map((d, i) => {
            const angle = (Math.PI * 2 * i) / N - Math.PI / 2
            const r = (d.score / 100) * maxR
            const x = center + r * Math.cos(angle)
            const y = center + r * Math.sin(angle)
            return <circle key={i} cx={x} cy={y} r={3} fill="hsl(var(--primary))" />
          })}
          {/* Labels */}
          {data.dimensions.map((d, i) => {
            const angle = (Math.PI * 2 * i) / N - Math.PI / 2
            const labelR = maxR + 18
            const x = center + labelR * Math.cos(angle)
            const y = center + labelR * Math.sin(angle)
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[9px] font-medium"
              >
                {d.label}
              </text>
            )
          })}
        </svg>
        <div className="w-full flex-1 space-y-3">
          {data.dimensions.map((d) => (
            <div key={d.label} className="flex items-center gap-3 text-xs">
              <span className="w-24 truncate text-muted-foreground">{d.label}</span>
              <FocusRing value={d.score} size="sm" state={d.score >= 80 ? 'complete' : 'active'} aria-label={`${d.label}: ${d.score}%`} />
              <span className="w-8 text-right tabular-nums">{d.score}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Quiz                                                                */
/* ------------------------------------------------------------------ */

function Quiz({ data }: { data: QuizComponent }) {
  const [current, setCurrent] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({})
  const [finished, setFinished] = React.useState(false)

  const q = data.questions[current]
  const answeredCount = Object.keys(revealed).length
  const correctCount = Object.entries(answers).filter(([qid, idx]) => {
    const question = data.questions.find((x) => x.id === qid)
    return question && question.correctIndex === idx
  }).length

  const selectAnswer = (idx: number) => {
    if (revealed[q.id]) return
    setAnswers((prev) => ({ ...prev, [q.id]: idx }))
    setRevealed((prev) => ({ ...prev, [q.id]: true }))
  }

  const next = () => {
    if (current < data.questions.length - 1) setCurrent((c) => c + 1)
    else setFinished(true)
  }
  const prev = () => current > 0 && setCurrent((c) => c - 1)
  const restart = () => {
    setCurrent(0)
    setAnswers({})
    setRevealed({})
    setFinished(false)
  }

  if (finished) {
    const pct = Math.round((correctCount / data.questions.length) * 100)
    return (
      <Card className="w-full">
        <CardHeader className="pb-2 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-2 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Trophy className="size-6" />
          </motion.div>
          <CardTitle className="text-base">Quiz complete!</CardTitle>
          <CardDescription>
            You scored {correctCount} / {data.questions.length} ({pct}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {pct >= 80 ? (
            <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              🎉 Great job! You&apos;ve mastered this. Should we move to advanced topics?
            </p>
          ) : pct >= 50 ? (
            <p className="rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
              👍 Decent start. Let&apos;s review the concepts you missed.
            </p>
          ) : (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
              💪 Don&apos;t worry! Let&apos;s review the concepts you missed. Here&apos;s a study plan…
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={restart} className="gap-1.5">
            <RotateCcw className="size-3.5" /> Try again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="size-4 text-primary" />
            {data.title ?? 'Quiz'}
          </CardTitle>
          <FocusRing value={(answeredCount / data.questions.length) * 100} size="md" state="active" aria-label={`Question ${current + 1} of ${data.questions.length}`} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const isAnswered = revealed[q.id]
            const isSelected = answers[q.id] === idx
            const isCorrect = q.correctIndex === idx
            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => selectAnswer(idx)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all',
                  !isAnswered && 'hover:border-primary/40 hover:scale-[1.01]',
                  isAnswered && isCorrect && 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400',
                  isAnswered && isSelected && !isCorrect && 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
                  isAnswered && !isSelected && !isCorrect && 'opacity-60',
                )}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <Check className="size-4 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <X className="size-4 shrink-0" />}
              </button>
            )
          })}
        </div>
        <AnimatePresence>
          {revealed[q.id] && q.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-muted p-3 text-xs text-muted-foreground"
            >
              <strong className="text-foreground">Explanation: </strong>
              {q.explanation}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost" size="sm" onClick={prev} disabled={current === 0} className="gap-1">
          <ChevronLeft className="size-3.5" /> Prev
        </Button>
        <Button variant="default" size="sm" onClick={next} disabled={!revealed[q.id]} className="gap-1">
          {current === data.questions.length - 1 ? 'Finish' : 'Next'}
          <ChevronRight className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Flashcards                                                          */
/* ------------------------------------------------------------------ */

function Flashcards({ data }: { data: FlashcardsComponent }) {
  const [idx, setIdx] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const [status, setStatus] = React.useState<Record<string, 'known' | 'struggling' | undefined>>({})

  const card = data.cards[idx]
  const knownCount = Object.values(status).filter((s) => s === 'known').length
  const strugglingCount = Object.values(status).filter((s) => s === 'struggling').length

  const mark = (s: 'known' | 'struggling') => {
    setStatus((prev) => ({ ...prev, [card.id]: s }))
    setTimeout(() => {
      if (idx < data.cards.length - 1) {
        setIdx((i) => i + 1)
        setFlipped(false)
      }
    }, 250)
  }

  const restart = () => {
    setIdx(0)
    setFlipped(false)
    setStatus({})
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Layers className="size-4 text-primary" />
            {data.title ?? 'Flashcards'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <FocusRing value={((knownCount + strugglingCount) / data.cards.length) * 100} size="md" state="active" aria-label={`Flashcard ${idx + 1} of ${data.cards.length}`} />
          </div>
          </div>
        </CardHeader>
        <CardContent>
        <div
          className="relative h-44 cursor-pointer [perspective:1000px]"
          onClick={() => setFlipped((f) => !f)}
        >
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                Term
              </span>
              <p className="text-base font-semibold">{card.front}</p>
              <span className="mt-3 text-[10px] text-muted-foreground">Click to flip</span>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-primary/5 p-4 text-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="mb-2 text-[10px] uppercase tracking-wide text-primary">
                Definition
              </span>
              <p className="text-sm text-muted-foreground">{card.back}</p>
            </div>
          </motion.div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => mark('struggling')}
            className="flex-1 gap-1.5 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700 dark:text-orange-400"
          >
            <AlertTriangle className="size-3.5" /> Struggling
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mark('known')}
            className="flex-1 gap-1.5 border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700 dark:text-green-400"
          >
            <Check className="size-3.5" /> Known
          </Button>
        </div>
        <div className="flex w-full justify-between">
          <Button variant="ghost" size="sm" onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false) }} disabled={idx === 0} className="gap-1">
            <ChevronLeft className="size-3.5" /> Prev
          </Button>
          <Button variant="ghost" size="sm" onClick={restart} className="gap-1">
            <RotateCcw className="size-3.5" /> Restart
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setIdx((i) => Math.min(data.cards.length - 1, i + 1)); setFlipped(false) }} disabled={idx === data.cards.length - 1} className="gap-1">
            Next <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Study Plan                                                          */
/* ------------------------------------------------------------------ */

function StudyPlan({ data }: { data: StudyPlanComponent }) {
  const [days, setDays] = React.useState(data.days)

  const toggleTask = (dayId: string, taskId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : d,
      ),
    )
  }

  const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0)
  const doneTasks = days.reduce((acc, d) => acc + d.tasks.filter((t) => t.done).length, 0)
  const pct = Math.round((doneTasks / totalTasks) * 100)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Target className="size-4 text-primary" />
          {data.title ?? 'Study Plan'}
        </CardTitle>
        <CardDescription className="flex items-center justify-between text-xs">
          <span>{doneTasks} of {totalTasks} tasks complete</span>
          <span className="tabular-nums">{pct}%</span>
        </CardDescription>
        <div className="flex justify-center py-1">
          <FocusRing value={pct} size="sm" state={pct >= 100 ? 'complete' : 'active'} aria-label={`${pct}% complete`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {days.map((day) => {
          const dayDone = day.tasks.filter((t) => t.done).length
          const dayTotal = day.tasks.length
          const allDone = dayDone === dayTotal
          return (
            <div key={day.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex size-5 items-center justify-center rounded-full text-[10px] font-semibold',
                    allDone ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {allDone ? <Check className="size-3" /> : dayDone}
                </span>
                <p className="text-sm font-medium">{day.label}</p>
                <span className="text-xs text-muted-foreground">
                  · {dayDone}/{dayTotal}
                </span>
              </div>
              <ul className="ml-7 space-y-1.5">
                {day.tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => toggleTask(day.id, task.id)}
                      className="flex w-full items-start gap-2 text-left text-sm transition-colors hover:text-foreground"
                    >
                      {task.done ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={cn(task.done && 'text-muted-foreground line-through')}>
                        {task.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Knowledge Graph (inline, mini)                                      */
/* ------------------------------------------------------------------ */

const MASTERY_FILL: Record<string, string> = {
  mastered: 'bg-green-500/15 text-green-700 border-green-500/40 dark:text-green-400',
  learning: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/40 dark:text-yellow-400',
  struggling: 'bg-orange-500/15 text-orange-700 border-orange-500/40 dark:text-orange-400',
  gap: 'bg-red-500/15 text-red-700 border-red-500/40 dark:text-red-400',
}

function Graph({ data }: { data: GraphComponent }) {
  const [selected, setSelected] = React.useState<string | null>(null)
  const W = 480
  const H = 280
  const sel = data.nodes.find((n) => n.id === selected)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Network className="size-4 text-primary" />
          {data.title ?? 'Knowledge Graph'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative overflow-hidden rounded-lg border bg-muted/20" style={{ height: H }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            {data.edges.map((e, i) => {
              const a = data.nodes.find((n) => n.id === e.from)!
              const b = data.nodes.find((n) => n.id === e.to)!
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="stroke-border"
                  strokeWidth={1.5}
                  strokeDasharray={a.mastery === 'gap' || b.mastery === 'gap' ? '4 3' : undefined}
                />
              )
            })}
          </svg>
          {data.nodes.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelected(n.id)}
              style={{
                left: `${(n.x / W) * 100}%`,
                top: `${(n.y / H) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={cn(
                'absolute rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all hover:scale-105 hover:shadow-md',
                MASTERY_FILL[n.mastery],
                selected === n.id && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
              )}
            >
              {n.label}
            </button>
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px]">
          {(['mastered', 'learning', 'struggling', 'gap'] as const).map((m) => (
            <span key={m} className="flex items-center gap-1.5 capitalize">
              <span className={cn('inline-block size-2 rounded-full', MASTERY_DOT[m])} />
              <span className="text-muted-foreground">{m}</span>
            </span>
          ))}
        </div>
        {/* Selected node details */}
        <AnimatePresence>
          {sel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-muted/40 p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-semibold">{sel.label}</p>
                <Badge variant="outline" className="capitalize text-[10px]">{sel.mastery}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Click another node to inspect it, or ask Summa AI to dive deeper.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

function Timeline({ data }: { data: TimelineComponent }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CalendarIcon className="size-4 text-primary" />
          {data.title ?? 'Academic Timeline'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-px before:bg-border">
          {data.events.map((e) => {
            const dotColor =
              e.status === 'urgent'
                ? 'bg-red-500'
                : e.status === 'upcoming'
                  ? 'bg-primary'
                  : 'bg-muted-foreground'
            return (
              <li key={e.id} className="relative flex gap-4 pl-8">
                <span
                  className={cn(
                    'absolute left-1.5 top-1.5 inline-flex size-3 items-center justify-center rounded-full ring-4 ring-background',
                    dotColor,
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{e.title}</p>
                    {e.status === 'urgent' && (
                      <Badge variant="outline" className="border-red-500/40 bg-red-500/10 text-red-700 text-[10px] dark:text-red-400">
                        <Clock className="mr-1 size-2.5" /> Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                  {e.description && <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>}
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Gap Analysis                                                        */
/* ------------------------------------------------------------------ */

function GapAnalysis({ data }: { data: GapAnalysisComponent }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="size-4 text-orange-500" />
          {data.title ?? 'Gap Analysis'}
        </CardTitle>
        <CardDescription className="text-xs">
          {data.gaps.length} missing prerequisite{data.gaps.length !== 1 ? 's' : ''} found. Study these before advancing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.gaps.map((g) => {
          const p = PRIORITY_STYLES[g.priority]
          return (
            <div
              key={g.id}
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{g.topic}</p>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', p.badge)}>
                    {p.label} priority
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="size-2.5" /> ~{g.estTime}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{g.reason}</p>
              </div>
              <Button size="sm" variant="default" className="shrink-0 gap-1">
                Study <ArrowRight className="size-3" />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

export function ChatComponentRenderer({ data }: { data: ChatComponentData }) {
  switch (data.type) {
    case 'hexagon':
      return <Hexagon data={data} />
    case 'quiz':
      return <Quiz data={data} />
    case 'flashcards':
      return <Flashcards data={data} />
    case 'study-plan':
      return <StudyPlan data={data} />
    case 'graph':
      return <Graph data={data} />
    case 'timeline':
      return <Timeline data={data} />
    case 'gap-analysis':
      return <GapAnalysis data={data} />
    default:
      return null
  }
}

/* ------------------------------------------------------------------ */
/* Sample data + intent detection                                      */
/* ------------------------------------------------------------------ */

export const SAMPLE_COMPONENTS: Record<ChatComponentType, ChatComponentData> = {
  hexagon: {
    type: 'hexagon',
    title: 'Your current proficiency',
    dimensions: [
      { label: 'Depth', score: 78 },
      { label: 'Problem-Solving', score: 65 },
      { label: 'Speed', score: 42 },
      { label: 'Consistency', score: 80 },
      { label: 'Confidence', score: 55 },
      { label: 'Creativity', score: 70 },
    ],
  },
  quiz: {
    type: 'quiz',
    title: 'NLP Fundamentals Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What does the attention mechanism in Transformers primarily compute?',
        options: [
          'A weighted sum of value vectors based on query-key similarity',
          'A simple average of all input tokens',
          'A fixed-weight dot product between adjacent tokens',
          'A random projection into a lower dimension',
        ],
        correctIndex: 0,
        explanation:
          'Attention computes softmax(QK^T/√d) · V — a weighted sum of values, where weights come from query-key similarity.',
      },
      {
        id: 'q2',
        question: 'Which of these is NOT a type of word embedding?',
        options: ['Word2Vec', 'GloVe', 'BERT', 'ReLU'],
        correctIndex: 3,
        explanation: 'ReLU is an activation function, not an embedding. Word2Vec, GloVe, and BERT all produce vector representations of words.',
      },
      {
        id: 'q3',
        question: 'In an LSTM, what is the purpose of the forget gate?',
        options: [
          'To add new information to the cell state',
          'To decide what information to remove from the cell state',
          'To compute the final output',
          'To initialize the hidden state',
        ],
        correctIndex: 1,
        explanation: 'The forget gate outputs values between 0 and 1 that multiply the cell state, deciding what to keep vs. forget.',
      },
    ],
  },
  flashcards: {
    type: 'flashcards',
    title: 'Transformers Flashcards',
    cards: [
      { id: 'f1', front: 'Self-Attention', back: 'A mechanism where each token in a sequence attends to all other tokens to compute its representation, weighted by relevance.' },
      { id: 'f2', front: 'Multi-Head Attention', back: 'Running multiple attention operations in parallel with different learned projections, then concatenating the results.' },
      { id: 'f3', front: 'Positional Encoding', back: 'A vector added to input embeddings to inject positional information, since attention is permutation-invariant.' },
      { id: 'f4', front: 'Layer Normalization', back: 'Normalizes activations across features within a single sample, stabilizing training in deep networks.' },
      { id: 'f5', front: 'Residual Connection', back: 'Adding a layer\'s input to its output (x + f(x)) to help gradients flow and allow deeper networks.' },
    ],
  },
  'study-plan': {
    type: 'study-plan',
    title: '6-Week NLP Final Prep Plan',
    days: [
      {
        id: 'd1',
        label: 'Week 1 — Foundations review',
        tasks: [
          { id: 't1', text: 'Re-watch lectures on word embeddings (Word2Vec, GloVe)' },
          { id: 't2', text: 'Complete practice problems on cosine similarity' },
          { id: 't3', text: 'Read Jurafsky ch. 6 (Vector Semantics)' },
        ],
      },
      {
        id: 'd2',
        label: 'Week 2 — RNNs and LSTMs',
        tasks: [
          { id: 't4', text: 'Implement a character-level LSTM in PyTorch' },
          { id: 't5', text: 'Solve past exam questions on BPTT' },
        ],
      },
      {
        id: 'd3',
        label: 'Week 3 — Attention & Transformers',
        tasks: [
          { id: 't6', text: 'Implement scaled dot-product attention from scratch' },
          { id: 't7', text: 'Read "Attention is All You Need" paper' },
          { id: 't8', text: 'Complete the Transformer visualization tutorial' },
        ],
      },
    ],
  },
  graph: {
    type: 'graph',
    title: 'Your NLP knowledge graph',
    nodes: [
      { id: 'la', label: 'Linear Algebra', x: 80, y: 60, mastery: 'mastered' },
      { id: 'prob', label: 'Probability', x: 80, y: 180, mastery: 'mastered' },
      { id: 'embed', label: 'Embeddings', x: 220, y: 100, mastery: 'learning' },
      { id: 'rnn', label: 'RNN/LSTM', x: 220, y: 200, mastery: 'learning' },
      { id: 'attn', label: 'Attention', x: 360, y: 60, mastery: 'struggling' },
      { id: 'tf', label: 'Transformers', x: 400, y: 180, mastery: 'gap' },
    ],
    edges: [
      { from: 'la', to: 'embed' },
      { from: 'prob', to: 'embed' },
      { from: 'embed', to: 'attn' },
      { from: 'rnn', to: 'attn' },
      { from: 'attn', to: 'tf' },
    ],
  },
  timeline: {
    type: 'timeline',
    title: 'Your semester at a glance',
    events: [
      { id: 'e1', title: 'NLP Midterm', date: 'Oct 15, 2026', description: 'Covers up to RNNs and LSTMs.', status: 'past' },
      { id: 'e2', title: 'Project proposal due', date: 'Nov 5, 2026', description: 'Submit 1-page NLP project proposal.', status: 'upcoming' },
      { id: 'e3', title: 'NLP Final Exam', date: 'Dec 15, 2026', description: 'Cumulative — emphasis on Transformers.', status: 'urgent' },
      { id: 'e4', title: 'DL Final Exam', date: 'Dec 18, 2026', description: 'Backprop, optimizers, CNNs, RNNs.', status: 'upcoming' },
    ],
  },
  'gap-analysis': {
    type: 'gap-analysis',
    title: 'Concepts you need before Transformers',
    gaps: [
      {
        id: 'g1',
        topic: 'Attention Mechanism',
        reason: 'Transformers are built on self-attention. You marked this as "struggling" in your last quiz.',
        priority: 'high',
        estTime: '2 hours',
      },
      {
        id: 'g2',
        topic: 'Matrix Multiplication (batched)',
        reason: 'Needed to understand how Q, K, V are computed and parallelized.',
        priority: 'medium',
        estTime: '45 min',
      },
      {
        id: 'g3',
        topic: 'Softmax & Scaling',
        reason: 'The attention weights use scaled softmax — you should be comfortable with the math.',
        priority: 'medium',
        estTime: '30 min',
      },
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Intent detection                                                    */
/* ------------------------------------------------------------------ */

const INTENT_KEYWORDS: { type: ChatComponentType; patterns: RegExp[] }[] = [
  {
    type: 'hexagon',
    patterns: [/\b(show|view|see)\b.*\b(progress|mastery|hexagon|proficien)/i, /\bmy (progress|proficien|mastery)\b/i],
  },
  {
    type: 'quiz',
    patterns: [/\bquiz me\b/i, /\btest me\b/i, /\bpractice (questions|quiz)\b/i, /\bgive me a quiz\b/i],
  },
  {
    type: 'flashcards',
    patterns: [/\b(make|create|generate)\b.*\bflash ?cards?\b/i, /\bstudy cards\b/i, /\bflash ?cards?\b/i],
  },
  {
    type: 'study-plan',
    patterns: [/\b(plan|create|build|make)\b.*\b(study|exam)\b/i, /\bstudy plan\b/i, /\bexam prep\b/i],
  },
  {
    type: 'graph',
    patterns: [/\b(show|view)\b.*\b(knowledge )?graph\b/i, /\bmy graph\b/i, /\bconnect concepts\b/i, /\bwhat do i know\b/i],
  },
  {
    type: 'timeline',
    patterns: [/\b(schedule|timeline|calendar)\b/i, /\bexam dates\b/i, /\bwhat.?s on my\b/i, /\bupcoming (exams|events)\b/i],
  },
  {
    type: 'gap-analysis',
    patterns: [/\b(find|show|identify) my gaps\b/i, /\bwhat (do i need|am i missing|to learn)\b/i, /\bgap analysis\b/i, /\bprerequisite/i],
  },
]

export function detectIntent(message: string): ChatComponentType | null {
  for (const { type, patterns } of INTENT_KEYWORDS) {
    if (patterns.some((p) => p.test(message))) return type
  }
  return null
}

/* ------------------------------------------------------------------ */
/* Trigger menu                                                        */
/* ------------------------------------------------------------------ */

export const COMPONENT_TRIGGERS: { type: ChatComponentType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'hexagon', label: 'Proficiency Hexagon', icon: <HexagonIcon className="size-4" />, description: 'Visualize your multi-dimensional progress' },
  { type: 'quiz', label: 'Quiz', icon: <Brain className="size-4" />, description: 'Test yourself with multiple-choice questions' },
  { type: 'flashcards', label: 'Flashcards', icon: <Layers className="size-4" />, description: 'Flip through term/definition cards' },
  { type: 'study-plan', label: 'Study Plan', icon: <Target className="size-4" />, description: 'Get a day-by-day study roadmap' },
  { type: 'graph', label: 'Knowledge Graph', icon: <Network className="size-4" />, description: 'See your concepts and how they connect' },
  { type: 'timeline', label: 'Timeline', icon: <CalendarIcon className="size-4" />, description: 'View your exams and deadlines' },
  { type: 'gap-analysis', label: 'Gap Analysis', icon: <AlertTriangle className="size-4" />, description: 'Find missing prerequisites' },
]

export default ChatComponentRenderer
