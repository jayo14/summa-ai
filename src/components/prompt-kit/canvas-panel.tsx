'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useCanvasStore,
  useCanvasMode,
  type CanvasEntry,
} from '@/hooks/use-canvas'
import {
  ChatComponentRenderer,
  COMPONENT_TRIGGERS,
  SAMPLE_COMPONENTS,
  type ChatComponentType,
} from '@/components/prompt-kit/chat-components'
import {
  X,
  LayoutGrid,
  Square,
  Trash2,
  Sparkles,
  Plus,
  Hexagon as HexagonIcon,
  Brain,
  Layers,
  Target,
  Network,
  Calendar as CalendarIcon,
  AlertTriangle,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Canvas panel                                                        */
/* ------------------------------------------------------------------ */

export function CanvasPanel() {
  const { entries, removeComponent, clear } = useCanvasStore()
  const mode = useCanvasMode()

  // NOTE: visibility (isOpen) is controlled by the parent, not here.
  // This component always renders its content; the parent decides whether
  // to display it (split panel on desktop, dialog on mobile).

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Canvas header */}
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4 text-primary" />
          <p className="text-sm font-semibold">Canvas</p>
          {entries.length > 0 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {entries.length} {entries.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Canvas body */}
      <div className="thin-scroll flex-1 overflow-y-auto p-4">
        {mode === 'empty' ? (
          <CanvasEmptyState />
        ) : mode === 'single' ? (
          <div className="mx-auto max-w-2xl">
            <CanvasEntryCard entry={entries[0]} onClose={() => removeComponent(entries[0].id)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AnimatePresence initial={false}>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <CanvasEntryCard entry={entry} onClose={() => removeComponent(entry.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Entry card wrapper                                                  */
/* ------------------------------------------------------------------ */

function CanvasEntryCard({
  entry,
  onClose,
}: {
  entry: CanvasEntry
  onClose: () => void
}) {
  const typeIcon = COMPONENT_TRIGGERS.find((t) => t.type === entry.component.type)?.icon
  const typeLabel =
    COMPONENT_TRIGGERS.find((t) => t.type === entry.component.type)?.label ?? entry.component.type

  return (
    <div className="group relative">
      {/* Floating close button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 size-7 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        aria-label={`Remove ${typeLabel}`}
      >
        <X className="size-3.5" />
      </Button>
      <ChatComponentRenderer data={entry.component} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

function CanvasEmptyState() {
  const { addComponent } = useCanvasStore()

  const quickAdd: { type: ChatComponentType; icon: React.ReactNode; label: string; desc: string }[] = [
    { type: 'hexagon', icon: <HexagonIcon className="size-4" />, label: 'Hexagon', desc: 'View your progress' },
    { type: 'quiz', icon: <Brain className="size-4" />, label: 'Quiz', desc: 'Test yourself' },
    { type: 'flashcards', icon: <Layers className="size-4" />, label: 'Flashcards', desc: 'Study cards' },
    { type: 'study-plan', icon: <Target className="size-4" />, label: 'Study Plan', desc: 'Day-by-day plan' },
    { type: 'graph', icon: <Network className="size-4" />, label: 'Graph', desc: 'Knowledge map' },
    { type: 'timeline', icon: <CalendarIcon className="size-4" />, label: 'Timeline', desc: 'Your schedule' },
    { type: 'gap-analysis', icon: <AlertTriangle className="size-4" />, label: 'Gaps', desc: 'Missing prereqs' },
  ]

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <LayoutGrid className="size-7" />
      </div>
      <h2 className="text-lg font-semibold">Canvas is empty</h2>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Components generated in chat — quizzes, flashcards, graphs, and more — will appear here.
        Ask Summa AI or pick one below to get started.
      </p>

      <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-3">
        {quickAdd.map((q) => (
          <button
            key={q.type}
            onClick={() => addComponent(SAMPLE_COMPONENTS[q.type])}
            className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center transition-all hover:scale-[1.03] hover:border-primary/40 hover:shadow-sm"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {q.icon}
            </span>
            <span className="text-xs font-medium">{q.label}</span>
            <span className="text-[10px] text-muted-foreground">{q.desc}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        Tip: type &quot;quiz me&quot; or &quot;show my progress&quot; in chat
      </div>
    </div>
  )
}

export default CanvasPanel
