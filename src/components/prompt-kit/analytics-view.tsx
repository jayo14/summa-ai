'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { FocusRing } from '@/components/focus-ring'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  Target,
  Trophy,
  Calendar,
  Sparkles,
  Hexagon as HexagonIcon,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

// Hexagon evolution: 4 snapshots over time
const hexagonEvolution = [
  { month: 'Jan', Depth: 45, 'Problem-Solving': 38, Speed: 30, Consistency: 50, Confidence: 35, Creativity: 40 },
  { month: 'Feb', Depth: 55, 'Problem-Solving': 45, Speed: 35, Consistency: 58, Confidence: 42, Creativity: 48 },
  { month: 'Mar', Depth: 65, 'Problem-Solving': 55, Speed: 38, Consistency: 65, Confidence: 50, Creativity: 55 },
  { month: 'Apr', Depth: 78, 'Problem-Solving': 65, Speed: 42, Consistency: 80, Confidence: 55, Creativity: 70 },
]

const currentHexagon = [
  { dimension: 'Depth', score: 78 },
  { dimension: 'Problem-Solving', score: 65 },
  { dimension: 'Speed', score: 42 },
  { dimension: 'Consistency', score: 80 },
  { dimension: 'Confidence', score: 55 },
  { dimension: 'Creativity', score: 70 },
]

// Quiz scores trend
const quizTrend = [
  { date: 'Apr 1', score: 65, topic: 'Linear Algebra' },
  { date: 'Apr 8', score: 72, topic: 'Calculus' },
  { date: 'Apr 15', score: 85, topic: 'NLP Fundamentals' },
  { date: 'Apr 22', score: 60, topic: 'Probability' },
  { date: 'Apr 29', score: 88, topic: 'Word Embeddings' },
  { date: 'May 6', score: 92, topic: 'Linear Algebra' },
  { date: 'May 13', score: 78, topic: 'Attention' },
]

// Study time distribution by topic (hours per week)
const studyTime = [
  { topic: 'NLP', hours: 12 },
  { topic: 'Calculus', hours: 6 },
  { topic: 'Linear Algebra', hours: 4 },
  { topic: 'Probability', hours: 3 },
  { topic: 'Music', hours: 2 },
]

// Topic mastery progression
const topicMastery = [
  { topic: 'Linear Algebra', mastery: 92, trend: 'up' },
  { topic: 'Probability', mastery: 85, trend: 'up' },
  { topic: 'Word Embeddings', mastery: 75, trend: 'up' },
  { topic: 'RNN/LSTM', mastery: 60, trend: 'up' },
  { topic: 'Attention', mastery: 45, trend: 'up' },
  { topic: 'Transformers', mastery: 20, trend: 'down' },
]

// Exam readiness
const examReadiness = [
  { exam: 'NLP Final', readiness: 62, daysLeft: 14 },
  { exam: 'DL Final', readiness: 78, daysLeft: 17 },
  { exam: 'Calculus II', readiness: 88, daysLeft: 21 },
]

/* ------------------------------------------------------------------ */
/* Chart configs                                                       */
/* ------------------------------------------------------------------ */

const hexagonChartConfig = {
  score: { label: 'Score', color: 'var(--chart-1)' },
} satisfies ChartConfig

const quizChartConfig = {
  score: { label: 'Score', color: 'var(--chart-2)' },
} satisfies ChartConfig

const studyChartConfig = {
  hours: { label: 'Hours', color: 'var(--chart-3)' },
} satisfies ChartConfig

const evolutionChartConfig: ChartConfig = {
  Depth: { label: 'Depth', color: 'var(--chart-1)' },
  'Problem-Solving': { label: 'Problem-Solving', color: 'var(--chart-2)' },
  Speed: { label: 'Speed', color: 'var(--chart-3)' },
  Consistency: { label: 'Consistency', color: 'var(--chart-4)' },
  Confidence: { label: 'Confidence', color: 'var(--chart-5)' },
  Creativity: { label: 'Creativity', color: 'var(--chart-1)' },
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export function AnalyticsView() {
  const [range, setRange] = React.useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [topic, setTopic] = React.useState<'all' | string>('all')

  const avgScore = Math.round(quizTrend.reduce((a, b) => a + b.score, 0) / quizTrend.length)
  const totalHours = studyTime.reduce((a, b) => a + b.hours, 0)
  const avgReadiness = Math.round(examReadiness.reduce((a, b) => a + b.readiness, 0) / examReadiness.length)
  const quizzesTaken = quizTrend.length

  return (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualize your learning progress over time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                <SelectItem value="nlp">NLP</SelectItem>
                <SelectItem value="calc">Calculus</SelectItem>
                <SelectItem value="la">Linear Algebra</SelectItem>
                <SelectItem value="music">Music</SelectItem>
              </SelectContent>
            </Select>
            <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="mr-1.5 size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard
            label="Avg quiz score"
            value={`${avgScore}%`}
            icon={<Brain className="size-4" />}
            trend="up"
            delta="+8% vs last month"
          />
          <KpiCard
            label="Study time"
            value={`${totalHours}h`}
            icon={<Clock className="size-4" />}
            trend="up"
            delta="+3h vs last week"
          />
          <KpiCard
            label="Exam readiness"
            value={`${avgReadiness}%`}
            icon={<Target className="size-4" />}
            trend="up"
            delta="On track"
          />
          <KpiCard
            label="Quizzes taken"
            value={String(quizzesTaken)}
            icon={<Trophy className="size-4" />}
            trend="up"
            delta="+2 this week"
          />
        </div>

        {/* Hexagon evolution + current */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <HexagonIcon className="size-4 text-primary" />
                Current Proficiency
              </CardTitle>
              <CardDescription className="text-xs">
                Your 6-dimension snapshot today
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={hexagonChartConfig} className="mx-auto aspect-square max-h-[260px]">
                <RadarChart data={currentHexagon}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="dimension" className="text-[10px]" />
                  <PolarGrid />
                  <Radar dataKey="score" fill="var(--color-score)" fillOpacity={0.5} stroke="var(--color-score)" strokeWidth={2} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="size-4 text-primary" />
                Hexagon Evolution
              </CardTitle>
              <CardDescription className="text-xs">
                How each dimension changed over the last 4 months
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={evolutionChartConfig} className="aspect-[4/3] max-h-[260px] w-full">
                <LineChart data={hexagonEvolution} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-[10px]" />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} className="text-[10px]" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {Object.keys(evolutionChartConfig).map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={`var(--color-${key})`}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quiz scores trend + Study time */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="size-4 text-primary" />
                Quiz Scores Trend
              </CardTitle>
              <CardDescription className="text-xs">
                Your last {quizTrend.length} quiz attempts
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={quizChartConfig} className="aspect-[4/3] max-h-[260px] w-full">
                <AreaChart data={quizTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-[10px]" />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} className="text-[10px]" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    strokeWidth={2}
                    fill="url(#scoreFill)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-primary" />
                Study Time Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Hours per topic, last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={studyChartConfig} className="aspect-[4/3] max-h-[260px] w-full">
                <BarChart data={studyTime} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="topic" tickLine={false} axisLine={false} className="text-[10px]" />
                  <YAxis tickLine={false} axisLine={false} className="text-[10px]" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Topic mastery + Exam readiness */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="size-4 text-primary" />
                Topic Mastery Progression
              </CardTitle>
              <CardDescription className="text-xs">
                Current mastery across all topics you&apos;ve studied
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {topicMastery.map((t) => (
                <div key={t.topic} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t.topic}</span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      {t.trend === 'up' ? (
                        <TrendingUp className="size-3 text-green-500" />
                      ) : (
                        <TrendingDown className="size-3 text-red-500" />
                      )}
                      {t.mastery}%
                    </span>
                  </div>
                  <div className="flex justify-center py-0.5">
                    <FocusRing value={t.mastery} size="sm" state={t.mastery >= 80 ? 'complete' : t.mastery >= 60 ? 'active' : 'active'} aria-label={`${t.topic} mastery: ${t.mastery}%`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="size-4 text-primary" />
                Exam Readiness
              </CardTitle>
              <CardDescription className="text-xs">
                How prepared you are for each upcoming exam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {examReadiness.map((e) => (
                <div key={e.exam} className="rounded-xl border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{e.exam}</p>
                      <p className="text-xs text-muted-foreground">{e.daysLeft} days left</p>
                    </div>
                    <FocusRing value={e.readiness} size="sm" state={e.readiness >= 80 ? 'complete' : 'active'} aria-label={`${e.exam}: ${e.readiness}% ready`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI insight footer */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 py-4">
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Summa AI insight</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Your Speed dimension is lagging behind the others (42 vs avg 65). Consider adding
                5-minute timed quizzes to your daily routine. Your NLP Final is in 14 days — at your
                current pace, you&apos;ll reach 78% readiness.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon,
  trend,
  delta,
}: {
  label: string
  value: string
  icon: React.ReactNode
  trend: 'up' | 'down'
  delta: string
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
        </div>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className={cn('mt-1 flex items-center gap-1 text-xs', trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
          {trend === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {delta}
        </p>
      </CardContent>
    </Card>
  )
}

export default AnalyticsView
