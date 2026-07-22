'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Search,
  Layers,
  Brain,
  Target,
  FileText,
  FileClock,
  Download,
  Share2,
  Trash2,
  Edit3,
  Eye,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Circle,
  Upload,
} from 'lucide-react'
import { useAuth } from '@/lib/use-supabase-auth'
import { fetchArtifacts, deleteArtifact, type Artifact } from '@/lib/api'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ResourceType = 'flashcards' | 'quiz' | 'study-plan' | 'practice-paper' | 'notes'
export type ResourceStatus = 'completed' | 'in-progress' | 'pending'

export interface Resource {
  id: string
  type: ResourceType
  title: string
  topic: string
  status: ResourceStatus
  createdAt: string
  score?: number
  attempts?: number
  itemCount?: number
}

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

const SAMPLE_RESOURCES: Resource[] = [
  { id: 'r1', type: 'flashcards', title: 'Transformers Flashcards', topic: 'NLP', status: 'in-progress', createdAt: '2 days ago', itemCount: 5 },
  { id: 'r2', type: 'quiz', title: 'NLP Fundamentals Quiz', topic: 'NLP', status: 'completed', createdAt: '5 days ago', score: 85, attempts: 2 },
  { id: 'r3', type: 'study-plan', title: '6-Week NLP Final Prep', topic: 'NLP', status: 'in-progress', createdAt: '1 week ago', itemCount: 8 },
  { id: 'r4', type: 'flashcards', title: 'Calculus II Integration', topic: 'Calculus', status: 'completed', createdAt: '2 weeks ago', itemCount: 12 },
  { id: 'r5', type: 'quiz', title: 'Linear Algebra Quiz', topic: 'Linear Algebra', status: 'completed', createdAt: '2 weeks ago', score: 92, attempts: 1 },
  { id: 'r6', type: 'practice-paper', title: 'NLP Final Practice Paper', topic: 'NLP', status: 'pending', createdAt: '3 weeks ago', itemCount: 10 },
  { id: 'r7', type: 'notes', title: 'Attention Mechanism Summary', topic: 'NLP', status: 'completed', createdAt: '3 weeks ago' },
  { id: 'r8', type: 'study-plan', title: 'Guitar Theory — Modes', topic: 'Music', status: 'pending', createdAt: '1 month ago', itemCount: 5 },
  { id: 'r9', type: 'flashcards', title: 'Music Modes Flashcards', topic: 'Music', status: 'in-progress', createdAt: '1 month ago', itemCount: 7 },
  { id: 'r10', type: 'quiz', title: 'Calculus II Quiz', topic: 'Calculus', status: 'in-progress', createdAt: '1 month ago', score: 60, attempts: 1 },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<ResourceType, { label: string; icon: React.ReactNode; color: string }> = {
  flashcards: { label: 'Flashcards', icon: <Layers className="size-4" />, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  quiz: { label: 'Quiz', icon: <Brain className="size-4" />, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
  'study-plan': { label: 'Study Plan', icon: <Target className="size-4" />, color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  'practice-paper': { label: 'Practice Paper', icon: <FileText className="size-4" />, color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  notes: { label: 'Notes', icon: <FileClock className="size-4" />, color: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400' },
}

const STATUS_META: Record<ResourceStatus, { label: string; icon: React.ReactNode; color: string }> = {
  completed: { label: 'Completed', icon: <CheckCircle2 className="size-3" />, color: 'text-green-600 dark:text-green-400' },
  'in-progress': { label: 'In progress', icon: <Clock className="size-3" />, color: 'text-yellow-600 dark:text-yellow-400' },
  pending: { label: 'Pending', icon: <Circle className="size-3" />, color: 'text-muted-foreground' },
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export function ResourcesView() {
  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<ResourceType | 'all'>('all')
  const [statusFilter, setStatusFilter] = React.useState<ResourceStatus | 'all'>('all')
  const [sort, setSort] = React.useState<'recent' | 'title' | 'score'>('recent')

  const { session } = useAuth()
  const token = session?.accessToken
  const [loading, setLoading] = React.useState(true)
  const [artifacts, setArtifacts] = React.useState<Artifact[]>([])

  React.useEffect(() => {
    if (!token) { setLoading(false); return }
    fetchArtifacts(token).then(data => {
      if (data) setArtifacts(data)
    }).finally(() => setLoading(false))
  }, [token])

  const mappedResources: Resource[] = React.useMemo(() => {
    if (artifacts.length === 0) return SAMPLE_RESOURCES
    return artifacts.map(a => ({
      id: a.id,
      type: (a.type as ResourceType) || 'notes',
      title: a.title,
      topic: a.source_label || 'General',
      status: a.archived ? 'completed' as ResourceStatus : 'in-progress' as ResourceStatus,
      createdAt: new Date(a.created_at).toLocaleDateString(),
    }))
  }, [artifacts])

  const filtered = React.useMemo(() => {
    let list = mappedResources.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.topic.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'score') list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    return list
  }, [search, typeFilter, statusFilter, sort, mappedResources])

  const stats = React.useMemo(() => {
    const byType = (t: ResourceType) => mappedResources.filter((r) => r.type === t).length
    const completed = mappedResources.filter((r) => r.status === 'completed').length
    return {
      total: mappedResources.length,
      flashcards: byType('flashcards'),
      quizzes: byType('quiz'),
      plans: byType('study-plan'),
      completed,
    }
  }, [mappedResources])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading resources…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              All your generated flashcards, quizzes, study plans, and notes — synced from chat.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="size-4" /> New resource
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Total" value={stats.total} icon={<FileText className="size-4" />} />
          <StatCard label="Flashcards" value={stats.flashcards} icon={<Layers className="size-4" />} />
          <StatCard label="Quizzes" value={stats.quizzes} icon={<Brain className="size-4" />} />
          <StatCard label="Study plans" value={stats.plans} icon={<Target className="size-4" />} />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="size-4" />} />
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or topic…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ResourceType | 'all')}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-1.5 size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="flashcards">Flashcards</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
              <SelectItem value="study-plan">Study plans</SelectItem>
              <SelectItem value="practice-paper">Practice papers</SelectItem>
              <SelectItem value="notes">Notes</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ResourceStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="score">Highest score</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No resources found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters or create a new resource.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <ResourceCard resource={r} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  const type = TYPE_META[resource.type]
  const status = STATUS_META[resource.status]
  return (
    <Card className="group flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <span className={cn('inline-flex size-9 items-center justify-center rounded-lg', type.color)}>
            {type.icon}
          </span>
          <span className={cn('flex items-center gap-1 text-xs font-medium', status.color)}>
            {status.icon}
            {status.label}
          </span>
        </div>
        <CardTitle className="mt-2 text-sm leading-snug">{resource.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-secondary px-2 py-0.5">{resource.topic}</span>
          <span>· {resource.createdAt}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="rounded-md bg-muted px-2 py-0.5">{type.label}</span>
          {resource.itemCount !== undefined && (
            <span>{resource.itemCount} items</span>
          )}
          {resource.score !== undefined && (
            <span className="font-medium text-foreground">{resource.score}% score</span>
          )}
          {resource.attempts !== undefined && (
            <span>{resource.attempts} attempt{resource.attempts !== 1 ? 's' : ''}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-1 pt-0">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Eye className="size-3.5" /> View
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Edit3 className="size-3.5" /> Edit
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Share2 className="size-3.5" /> Share
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-xs text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ResourcesView
