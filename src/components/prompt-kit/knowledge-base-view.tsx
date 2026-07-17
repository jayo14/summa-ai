'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FocusRing } from '@/components/focus-ring'
import { cn } from '@/lib/utils'
import {
  FileText,
  Video,
  Link as LinkIcon,
  FileClock,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  Eye,
  Edit3,
  Plus,
  Network,
  Sparkles,
  FileType2,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { fetchMaterials, fetchConcepts } from '@/lib/api'
import type { Material as ApiMaterial, Concept as ApiConcept } from '@/lib/api'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MaterialType = 'pdf' | 'video' | 'webpage' | 'notes'

export interface Material {
  id: string
  type: MaterialType
  title: string
  source: string
  uploadedAt: string
  size?: string
  duration?: string
  conceptsExtracted: number
  status: 'processed' | 'processing' | 'failed'
}

export interface Concept {
  id: string
  name: string
  category: string
  mastery: 'mastered' | 'learning' | 'struggling' | 'gap'
  relatedConcepts: number
  source: string
}

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

const SAMPLE_MATERIALS: Material[] = [
  { id: 'm1', type: 'pdf', title: 'Speech and Language Processing', source: 'Jurafsky & Martin', uploadedAt: '2 days ago', size: '12.4 MB', conceptsExtracted: 47, status: 'processed' },
  { id: 'm2', type: 'video', title: 'Stanford CS224N — Lecture 8', source: 'YouTube', uploadedAt: '5 days ago', duration: '1h 18m', conceptsExtracted: 12, status: 'processed' },
  { id: 'm3', type: 'pdf', title: 'Attention is All You Need', source: 'arxiv.org', uploadedAt: '1 week ago', size: '1.2 MB', conceptsExtracted: 8, status: 'processed' },
  { id: 'm4', type: 'webpage', title: 'The Illustrated Transformer', source: 'jalammar.github.io', uploadedAt: '1 week ago', conceptsExtracted: 15, status: 'processed' },
  { id: 'm5', type: 'notes', title: 'Calculus II — Integration notes', source: 'Manual entry', uploadedAt: '2 weeks ago', conceptsExtracted: 23, status: 'processed' },
  { id: 'm6', type: 'video', title: '3Blue1Brown — Linear Algebra', source: 'YouTube', uploadedAt: '3 weeks ago', duration: '2h 45m', conceptsExtracted: 31, status: 'processed' },
  { id: 'm7', type: 'pdf', title: 'Calculus II Past Paper 2024', source: 'University', uploadedAt: '1 month ago', size: '890 KB', conceptsExtracted: 0, status: 'processing' },
]

const SAMPLE_CONCEPTS: Concept[] = [
  { id: 'c1', name: 'Self-Attention', category: 'NLP', mastery: 'learning', relatedConcepts: 6, source: 'Attention is All You Need' },
  { id: 'c2', name: 'Word2Vec', category: 'NLP', mastery: 'mastered', relatedConcepts: 4, source: 'CS224N Lecture 8' },
  { id: 'c3', name: 'GloVe', category: 'NLP', mastery: 'struggling', relatedConcepts: 3, source: 'Jurafsky & Martin' },
  { id: 'c4', name: 'Backpropagation', category: 'Deep Learning', mastery: 'mastered', relatedConcepts: 8, source: '3Blue1Brown' },
  { id: 'c5', name: 'Transformers', category: 'NLP', mastery: 'gap', relatedConcepts: 12, source: 'The Illustrated Transformer' },
  { id: 'c6', name: 'Integration by Parts', category: 'Calculus', mastery: 'mastered', relatedConcepts: 2, source: 'Calculus II notes' },
  { id: 'c7', name: 'Eigenvalues', category: 'Linear Algebra', mastery: 'mastered', relatedConcepts: 5, source: '3Blue1Brown' },
  { id: 'c8', name: 'Multi-Head Attention', category: 'NLP', mastery: 'gap', relatedConcepts: 7, source: 'Attention is All You Need' },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<MaterialType, { icon: React.ReactNode; color: string }> = {
  pdf: { icon: <FileText className="size-4" />, color: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  video: { icon: <Video className="size-4" />, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
  webpage: { icon: <LinkIcon className="size-4" />, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  notes: { icon: <FileText className="size-4" />, color: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400' },
}

const MASTERY_DOT: Record<Concept['mastery'], string> = {
  mastered: 'bg-green-500',
  learning: 'bg-yellow-500',
  struggling: 'bg-orange-500',
  gap: 'bg-red-500',
}

const MASTERY_BADGE: Record<Concept['mastery'], string> = {
  mastered: 'bg-green-500/10 text-green-700 dark:text-green-400',
  learning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  struggling: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  gap: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export function KnowledgeBaseView() {
  const { data: session } = useSession()
  const token = session?.accessToken
  const [loading, setLoading] = React.useState(true)
  const [materials, setMaterials] = React.useState<ApiMaterial[]>([])
  const [concepts, setConcepts] = React.useState<ApiConcept[]>([])

  React.useEffect(() => {
    if (!token) { setLoading(false); return }
    Promise.all([
      fetchMaterials(token),
      fetchConcepts(token),
    ]).then(([m, c]) => {
      if (m) setMaterials(m)
      if (c) setConcepts(c)
    }).finally(() => setLoading(false))
  }, [token])

  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<MaterialType | 'all'>('all')
  const fileRef = React.useRef<HTMLInputElement>(null)

  const displayMaterials = React.useMemo(() => {
    if (materials.length === 0) return SAMPLE_MATERIALS
    return materials.map(m => ({
      id: m.id,
      type: m.type,
      title: m.title,
      source: m.source,
      uploadedAt: m.uploadedAt ?? 'recently',
      size: m.size ?? undefined,
      duration: m.duration ?? undefined,
      conceptsExtracted: m.conceptsExtracted ?? 0,
      status: m.status ?? 'processed' as const,
    }))
  }, [materials])

  const displayConcepts = React.useMemo(() => {
    if (concepts.length === 0) return SAMPLE_CONCEPTS
    return concepts.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      mastery: c.mastery,
      relatedConcepts: c.relatedConcepts ?? 0,
      source: c.source ?? '',
    }))
  }, [concepts])

  const filteredMaterials = React.useMemo(() => {
    return displayMaterials.filter((m) => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, typeFilter])

  const filteredConcepts = React.useMemo(() => {
    return displayConcepts.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search])

  const totalConcepts = displayConcepts.length
  const masteredConcepts = displayConcepts.filter((c) => c.mastery === 'mastered').length

  const AvgMasteryStat = () => {
    const pct = totalConcepts > 0 ? Math.round((masteredConcepts / totalConcepts) * 100) : 0
    return <StatCard label="Avg mastery" value={`${pct}%`} icon={<FileType2 className="size-4" />} />
  }

  return (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {loading && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
            <RefreshCw className="size-4 animate-spin" />
            Loading your knowledge base…
          </div>
        )}
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Uploaded materials and the concepts Summa AI has extracted from them.
            </p>
          </div>
          <Button onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="size-4" /> Upload material
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,image/*,video/*"
            multiple
            className="hidden"
          />
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Materials" value={displayMaterials.length} icon={<FileClock className="size-4" />} />
          <StatCard label="Concepts extracted" value={totalConcepts} icon={<Network className="size-4" />} />
          <StatCard label="Mastered" value={masteredConcepts} icon={<Sparkles className="size-4" />} />
          <AvgMasteryStat />
        </div>

        {/* Search + filter */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search materials and concepts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center gap-1 rounded-md border p-0.5">
            {(['all', 'pdf', 'video', 'webpage', 'notes'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t as MaterialType | 'all')}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                  typeFilter === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Materials column */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Uploaded Materials ({filteredMaterials.length})
              </h2>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {filteredMaterials.map((m) => {
                  const meta = TYPE_META[m.type]
                  return (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group flex items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/30"
                    >
                      <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-lg', meta.color)}>
                        {meta.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {m.source} · {m.uploadedAt}
                          {m.size && ` · ${m.size}`}
                          {m.duration && ` · ${m.duration}`}
                        </p>
                        {m.status === 'processing' ? (
                          <div className="mt-1.5 flex items-center gap-2">
                            <FocusRing value={45} size="sm" state="active" aria-label="Processing material" />
                            <span className="text-[10px] text-muted-foreground">Processing…</span>
                          </div>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {m.conceptsExtracted} concepts extracted
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="size-7" aria-label="View">
                          <Eye className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" aria-label="Reprocess">
                          <RefreshCw className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label="Delete">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {filteredMaterials.length === 0 && (
                <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
                  <FileClock className="mx-auto mb-2 size-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No materials match your filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Concepts column */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Extracted Concepts ({filteredConcepts.length})
              </h2>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Plus className="size-3" /> Add concept
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredConcepts.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-accent/30"
                >
                  <span className={cn('inline-block size-2 rounded-full', MASTERY_DOT[c.mastery])} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.category} · {c.relatedConcepts} related
                    </p>
                  </div>
                  <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase', MASTERY_BADGE[c.mastery])}>
                    {c.mastery}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Edit concept"
                  >
                    <Edit3 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Concept relationships preview */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Network className="size-4 text-primary" />
                  Concept Relationships
                </CardTitle>
                <CardDescription className="text-xs">
                  How your extracted concepts connect (preview)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline" className="bg-green-500/10">Word2Vec</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className="bg-yellow-500/10">Self-Attention</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className="bg-red-500/10">Transformers</Badge>
                  <span className="ml-2 text-muted-foreground">+ 5 more</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Open the <strong>Graph</strong> view to see the full interactive knowledge graph.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
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

export default KnowledgeBaseView
