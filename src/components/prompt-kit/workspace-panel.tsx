'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  useWorkspaceStore,
  useActiveArtifact,
  useRecentArtifacts,
  SOURCE_LABELS,
  SOURCE_ICONS,
  type Artifact,
} from '@/hooks/use-workspace'
import {
  ChatComponentRenderer,
  COMPONENT_TRIGGERS,
  SAMPLE_COMPONENTS,
  type ChatComponentType,
} from '@/components/prompt-kit/chat-components'
import {
  X,
  MoreVertical,
  History,
  Pin,
  PinOff,
  Copy,
  Archive,
  Trash2,
  Edit3,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Clock,
  ArrowUpRight,
  GitBranch,
  Layers,
  PanelRight,
  Plus,
  Check,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Workspace panel                                                     */
/* ------------------------------------------------------------------ */

export function WorkspacePanel() {
  const activeArtifact = useActiveArtifact()
  const { suggestions } = useWorkspaceStore()
  const [showHistory, setShowHistory] = React.useState(false)

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Workspace header */}
      <WorkspaceHeader onToggleHistory={() => setShowHistory((v) => !v)} showHistory={showHistory} />

      {/* Body: artifact view + optional history sidebar */}
      <div className="flex min-h-0 flex-1">
        {/* Main artifact area */}
        <div className="thin-scroll flex-1 overflow-y-auto p-4">
          {activeArtifact ? (
            <ActiveArtifactView artifact={activeArtifact} />
          ) : suggestions.length > 0 ? (
            <SuggestionStack />
          ) : (
            <WorkspaceEmptyState />
          )}
        </div>

        {/* Version history sidebar */}
        <AnimatePresence>
          {showHistory && activeArtifact && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-l"
            >
              <VersionHistory artifact={activeArtifact} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function WorkspaceHeader({
  onToggleHistory,
  showHistory,
}: {
  onToggleHistory: () => void
  showHistory: boolean
}) {
  const activeArtifact = useActiveArtifact()
  const { togglePin } = useWorkspaceStore()

  if (!activeArtifact) {
    return (
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <PanelRight className="size-4 text-primary" />
          <p className="text-sm font-semibold">Workspace</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">
          {activeArtifact.type.replace('-', ' ')}
        </Badge>
        <p className="truncate text-sm font-medium">{activeArtifact.title}</p>
        <span className="shrink-0 text-[10px] text-muted-foreground">v{activeArtifact.currentVersion}</span>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => togglePin(activeArtifact.id)}
          aria-label={activeArtifact.pinned ? 'Unpin' : 'Pin'}
        >
          {activeArtifact.pinned ? (
            <PinOff className="size-3.5 text-primary" />
          ) : (
            <Pin className="size-3.5" />
          )}
        </Button>
        <Button
          variant={showHistory ? 'secondary' : 'ghost'}
          size="icon"
          className="size-7"
          onClick={onToggleHistory}
          aria-label="Version history"
        >
          <History className="size-3.5" />
        </Button>
        <ArtifactMenu artifact={activeArtifact} />
      </div>
    </div>
  )
}

function ArtifactMenu({ artifact }: { artifact: Artifact }) {
  const { renameArtifact, duplicateArtifact, archiveArtifact, deleteArtifact } = useWorkspaceStore()
  const [renaming, setRenaming] = React.useState(false)
  const [name, setName] = React.useState(artifact.title)

  const handleRename = () => {
    renameArtifact(artifact.id, name.trim() || artifact.title)
    setRenaming(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Artifact actions">
            <MoreVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => { setName(artifact.title); setRenaming(true) }}>
            <Edit3 className="size-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateArtifact(artifact.id)}>
            <Copy className="size-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem>
            <RefreshCw className="size-4" /> Regenerate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => archiveArtifact(artifact.id)}>
            <Archive className="size-4" /> Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => deleteArtifact(artifact.id)}
          >
            <Trash2 className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename dialog */}
      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Rename artifact</DialogTitle>
          <DialogDescription>Give this artifact a new name.</DialogDescription>
          <div className="flex gap-2 pt-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <Button onClick={handleRename}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Active artifact view                                                */
/* ------------------------------------------------------------------ */

function ActiveArtifactView({ artifact }: { artifact: Artifact }) {
  const currentVersion = artifact.versions.find((v) => v.version === artifact.currentVersion)
  if (!currentVersion) return null

  return (
    <div className="space-y-4">
      {/* Source metadata */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span>{SOURCE_ICONS[artifact.source]}</span>
          Generated from <strong className="text-foreground">{artifact.sourceLabel ?? SOURCE_LABELS[artifact.source]}</strong>
        </span>
        {artifact.parentArtifactId && (
          <>
            <ChevronRight className="size-3" />
            <span className="flex items-center gap-1">
              <GitBranch className="size-3" /> Derived from previous artifact
            </span>
          </>
        )}
        <span className="ml-auto flex items-center gap-1">
          <Clock className="size-3" />
          {formatRelativeTime(artifact.updatedAt)}
        </span>
      </div>

      {/* Change note (if any) */}
      {currentVersion.changeNote && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          {currentVersion.changeNote}
        </div>
      )}

      {/* The component itself */}
      <ChatComponentRenderer data={currentVersion.component} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Version history                                                     */
/* ------------------------------------------------------------------ */

function VersionHistory({ artifact }: { artifact: Artifact }) {
  const { restoreVersion, switchToArtifact } = useWorkspaceStore()
  const sorted = [...artifact.versions].sort((a, b) => b.version - a.version)

  return (
    <div className="h-full overflow-y-auto bg-muted/20 p-3 thin-scroll">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <History className="size-3.5" /> Version History
      </p>
      <ol className="space-y-2">
        {sorted.map((v, i) => {
          const isActive = v.version === artifact.currentVersion
          const isLatest = i === 0
          return (
            <li key={v.version}>
              <button
                onClick={() => !isActive && restoreVersion(v.version)}
                disabled={isActive}
                className={cn(
                  'w-full rounded-lg border p-2.5 text-left transition-colors',
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-accent/30',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">v{v.version}</span>
                  {isActive && (
                    <Badge variant="outline" className="text-[9px] text-primary">Current</Badge>
                  )}
                  {isLatest && !isActive && (
                    <Badge variant="outline" className="text-[9px]">Latest</Badge>
                  )}
                </div>
                {v.changeNote && (
                  <p className="mt-1 text-[11px] text-muted-foreground">{v.changeNote}</p>
                )}
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatRelativeTime(v.createdAt)}
                </p>
                {!isActive && (
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-primary">
                    <RefreshCw className="size-2.5" /> Click to restore
                  </p>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Suggestion stack                                                    */
/* ------------------------------------------------------------------ */

function SuggestionStack() {
  const { suggestions, acceptSuggestion, saveSuggestionForLater, discardSuggestion } = useWorkspaceStore()

  return (
    <div className="mx-auto max-w-md space-y-3">
      <p className="text-center text-sm text-muted-foreground">
        Summa AI generated new artifacts. Review them below.
      </p>
      {suggestions.map((sug) => {
        const trigger = COMPONENT_TRIGGERS.find((t) => t.type === sug.artifact.type)
        return (
          <motion.div
            key={sug.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {trigger?.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{sug.artifact.title}</p>
                <p className="text-[11px] text-muted-foreground">{trigger?.label}</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{sug.message}</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-1.5" onClick={() => acceptSuggestion(sug.id)}>
                <ArrowUpRight className="size-3.5" /> Open
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => saveSuggestionForLater(sug.id)}
              >
                Save for Later
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground"
                onClick={() => discardSuggestion(sug.id)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

function WorkspaceEmptyState() {
  const { createArtifact } = useWorkspaceStore()
  const recent = useRecentArtifacts(3)
  const { switchToArtifact } = useWorkspaceStore()

  const quickAdd: { type: ChatComponentType; icon: React.ReactNode; label: string; desc: string }[] = [
    { type: 'hexagon', icon: <Sparkles className="size-4" />, label: 'Hexagon', desc: 'Progress' },
    { type: 'quiz', icon: <FileText className="size-4" />, label: 'Quiz', desc: 'Test yourself' },
    { type: 'flashcards', icon: <Layers className="size-4" />, label: 'Flashcards', desc: 'Study cards' },
    { type: 'study-plan', icon: <Clock className="size-4" />, label: 'Plan', desc: 'Study roadmap' },
    { type: 'graph', icon: <GitBranch className="size-4" />, label: 'Graph', desc: 'Knowledge map' },
    { type: 'timeline', icon: <History className="size-4" />, label: 'Timeline', desc: 'Schedule' },
    { type: 'gap-analysis', icon: <ArrowUpRight className="size-4" />, label: 'Gaps', desc: 'Missing prereqs' },
  ]

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <PanelRight className="size-7" />
      </div>
      <h2 className="text-lg font-semibold">Workspace</h2>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Your active artifact appears here. Ask Summa AI to generate a quiz, flashcards, study plan, and more —
        each one is saved automatically to your Resources.
      </p>

      {/* Recent artifacts */}
      {recent.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <p className="mb-2 text-left text-xs font-medium text-muted-foreground">Recent artifacts</p>
          <div className="space-y-1.5">
            {recent.map((a) => {
              const trigger = COMPONENT_TRIGGERS.find((t) => t.type === a.type)
              return (
                <button
                  key={a.id}
                  onClick={() => switchToArtifact(a.id)}
                  className="flex w-full items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:bg-accent/30"
                >
                  <span className="text-primary">{trigger?.icon}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.title}</span>
                  <span className="text-[10px] text-muted-foreground">v{a.currentVersion}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick add */}
      <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2 sm:grid-cols-4">
        {quickAdd.map((q) => (
          <button
            key={q.type}
            onClick={() =>
              createArtifact({
                title: q.label,
                component: SAMPLE_COMPONENTS[q.type],
                source: 'manual-input',
              })
            }
            className="flex flex-col items-center gap-1 rounded-xl border bg-card p-2.5 text-center transition-all hover:scale-[1.03] hover:border-primary/40"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              {q.icon}
            </span>
            <span className="text-[11px] font-medium">{q.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        Tip: type "quiz me" or "make flashcards" in chat
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default WorkspacePanel
