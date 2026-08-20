'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { ChatComponentData, ChatComponentType } from '@/components/prompt-kit/chat-components'
import { createArtifact as persistArtifactRemote } from '@/lib/api'

/* ------------------------------------------------------------------ */
/* Artifact model                                                      */
/* ------------------------------------------------------------------ */

export type ArtifactSource =
  | 'conversation'
  | 'uploaded-pdf'
  | 'lecture-notes'
  | 'youtube-video'
  | 'previous-artifact'
  | 'knowledge-base'
  | 'library'
  | 'manual-input'

export interface ArtifactVersion {
  version: number
  createdAt: number
  component: ChatComponentData
  /** Human-readable note about what changed (e.g. "Made questions harder") */
  changeNote?: string
}

export interface Artifact {
  id: string
  title: string
  type: ChatComponentType
  versions: ArtifactVersion[]
  currentVersion: number
  source: ArtifactSource
  sourceLabel?: string
  /** ID of the parent artifact this was derived from, if any */
  parentArtifactId?: string
  createdAt: number
  updatedAt: number
  archived: boolean
  pinned: boolean
}

/* ------------------------------------------------------------------ */
/* Workspace state                                                     */
/* ------------------------------------------------------------------ */

export interface Suggestion {
  id: string
  artifact: Artifact
  message: string
  createdAt: number
}

interface WorkspaceState {
  /** Whether the workspace panel is visible */
  isOpen: boolean
  /** The currently active artifact (only one at a time) */
  activeArtifactId: string | null
  /** All artifacts in the workspace (history) */
  artifacts: Artifact[]
  /** Pending suggestions (not yet opened) */
  suggestions: Suggestion[]
  /** Pinned artifact IDs */
  pinned: string[]

  /* Actions — workspace visibility */
  open: () => void
  close: () => void
  toggle: () => void

  /* Actions — artifact lifecycle */
  /** Create a new artifact and set it as active. Previous active artifact
      is automatically kept in history (not deleted). */
  createArtifact: (params: {
    title: string
    component: ChatComponentData
    source?: ArtifactSource
    sourceLabel?: string
    parentArtifactId?: string
    changeNote?: string
    /** When provided, the artifact is also persisted via POST /artifacts
        (fire-and-forget — local state is already authoritative for this
        session; failure is logged, never blocks the UI). */
    accessToken?: string
    conversationId?: string
  }) => string

  /** Update the active artifact with a new component, creating a new version. */
  updateActiveArtifact: (component: ChatComponentData, changeNote?: string) => void

  /** Switch to a different artifact from history. */
  switchToArtifact: (id: string) => void

  /** Restore a previous version of the active artifact (creates a new version). */
  restoreVersion: (version: number) => void

  /** Rename the active artifact. */
  renameArtifact: (id: string, title: string) => void

  /** Duplicate an artifact (creates a copy with a new ID). */
  duplicateArtifact: (id: string) => void

  /** Archive an artifact (removes from active view but keeps in history). */
  archiveArtifact: (id: string) => void

  /** Delete an artifact permanently. */
  deleteArtifact: (id: string) => void

  /** Toggle pin status. */
  togglePin: (id: string) => void

  /* Actions — suggestions */
  /** Add a suggestion (artifact generated but not yet opened). When
      accessToken is provided, also persists via POST /artifacts. */
  addSuggestion: (artifact: Artifact, message: string, accessToken?: string, conversationId?: string) => void
  /** Open a suggestion (set as active, remove from suggestions). */
  acceptSuggestion: (id: string) => void
  /** Save for later (move to history without opening). */
  saveSuggestionForLater: (id: string) => void
  /** Discard a suggestion (delete the artifact). */
  discardSuggestion: (id: string) => void
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

function generateId() {
  return `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** Fire-and-forget POST /artifacts for a locally-created artifact. Local
    state is already the source of truth for this session (optimistic), so
    a failure here is logged and otherwise swallowed — never blocks or
    rolls back the UI. This is what makes chat-/quick-add-generated
    artifacts queryable via GET /artifacts and visible on /saved-materials. */
function persistArtifactInBackground(
  artifact: Artifact,
  accessToken?: string,
  conversationId?: string,
) {
  if (!accessToken) return
  const initialVersion = artifact.versions[0]
  persistArtifactRemote(
    {
      title: artifact.title,
      type: artifact.type,
      component: initialVersion.component,
      source: artifact.source,
      source_label: artifact.sourceLabel ?? null,
      parent_artifact_id: artifact.parentArtifactId ?? null,
      conversation_id: conversationId ?? null,
      change_note: initialVersion.changeNote ?? null,
    },
    accessToken,
  ).then((saved) => {
    if (!saved) {
      console.warn(`[workspace] failed to persist artifact "${artifact.title}" (${artifact.id}) to backend`)
    }
  })
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
  isOpen: false,
  activeArtifactId: null,
  artifacts: [],
  suggestions: [],
  pinned: [],

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  createArtifact: ({ title, component, source = 'conversation', sourceLabel, parentArtifactId, changeNote, accessToken, conversationId }) => {
    const id = generateId()
    const now = Date.now()
    const artifact: Artifact = {
      id,
      title,
      type: component.type,
      versions: [{ version: 1, createdAt: now, component, changeNote }],
      currentVersion: 1,
      source,
      sourceLabel,
      parentArtifactId,
      createdAt: now,
      updatedAt: now,
      archived: false,
      pinned: false,
    }
    set((s) => ({
      isOpen: true,
      activeArtifactId: id,
      artifacts: [artifact, ...s.artifacts],
    }))
    persistArtifactInBackground(artifact, accessToken, conversationId)
    return id
  },

  updateActiveArtifact: (component, changeNote) => {
    const { activeArtifactId, artifacts } = get()
    if (!activeArtifactId) {
      // No active artifact — create a new one instead
      get().createArtifact({ title: 'Untitled', component, changeNote })
      return
    }
    set((s) => ({
      artifacts: s.artifacts.map((a) => {
        if (a.id !== activeArtifactId) return a
        const newVersion = a.currentVersion + 1
        return {
          ...a,
          versions: [...a.versions, { version: newVersion, createdAt: Date.now(), component, changeNote }],
          currentVersion: newVersion,
          type: component.type,
          updatedAt: Date.now(),
        }
      }),
    }))
  },

  switchToArtifact: (id) => {
    set({ activeArtifactId: id, isOpen: true })
  },

  restoreVersion: (version) => {
    const { activeArtifactId, artifacts } = get()
    if (!activeArtifactId) return
    const artifact = artifacts.find((a) => a.id === activeArtifactId)
    if (!artifact) return
    const versionData = artifact.versions.find((v) => v.version === version)
    if (!versionData) return
    // Restoring creates a NEW version with the old content (never overwrite)
    get().updateActiveArtifact(versionData.component, `Restored from v${version}`)
  },

  renameArtifact: (id, title) => {
    set((s) => ({
      artifacts: s.artifacts.map((a) => (a.id === id ? { ...a, title, updatedAt: Date.now() } : a)),
    }))
  },

  duplicateArtifact: (id) => {
    const { artifacts } = get()
    const original = artifacts.find((a) => a.id === id)
    if (!original) return
    const newId = generateId()
    const now = Date.now()
    const copy: Artifact = {
      ...original,
      id: newId,
      title: `${original.title} (copy)`,
      versions: original.versions.map((v) => ({ ...v, createdAt: now })),
      createdAt: now,
      updatedAt: now,
      parentArtifactId: original.id,
      pinned: false,
    }
    set((s) => ({
      artifacts: [copy, ...s.artifacts],
      activeArtifactId: newId,
      isOpen: true,
    }))
  },

  archiveArtifact: (id) => {
    set((s) => ({
      artifacts: s.artifacts.map((a) => (a.id === id ? { ...a, archived: true } : a)),
      activeArtifactId: s.activeArtifactId === id ? null : s.activeArtifactId,
    }))
  },

  deleteArtifact: (id) => {
    set((s) => ({
      artifacts: s.artifacts.filter((a) => a.id !== id),
      pinned: s.pinned.filter((p) => p !== id),
      activeArtifactId: s.activeArtifactId === id ? null : s.activeArtifactId,
    }))
  },

  togglePin: (id) => {
    set((s) => ({
      pinned: s.pinned.includes(id)
        ? s.pinned.filter((p) => p !== id)
        : [...s.pinned, id],
      artifacts: s.artifacts.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)),
    }))
  },

  addSuggestion: (artifact, message, accessToken, conversationId) => {
    set((s) => ({
      artifacts: [artifact, ...s.artifacts],
      suggestions: [{ id: artifact.id, artifact, message, createdAt: Date.now() }, ...s.suggestions],
    }))
    persistArtifactInBackground(artifact, accessToken, conversationId)
  },

  acceptSuggestion: (id) => {
    set((s) => ({
      suggestions: s.suggestions.filter((sug) => sug.id !== id),
      activeArtifactId: id,
      isOpen: true,
    }))
  },

  saveSuggestionForLater: (id) => {
    set((s) => ({
      suggestions: s.suggestions.filter((sug) => sug.id !== id),
    }))
  },

  discardSuggestion: (id) => {
    set((s) => ({
      suggestions: s.suggestions.filter((sug) => sug.id !== id),
      artifacts: s.artifacts.filter((a) => a.id !== id),
      pinned: s.pinned.filter((p) => p !== id),
    }))
  },
    }),
    {
      name: 'summa-workspace',
      storage: createJSONStorage(() => localStorage),
      // Only persist data, not the action functions — and not `isOpen`,
      // which should always start closed on a fresh load.
      partialize: (s) => ({
        activeArtifactId: s.activeArtifactId,
        artifacts: s.artifacts,
        suggestions: s.suggestions,
        pinned: s.pinned,
      }),
    },
  ),
)

/* ------------------------------------------------------------------ */
/* Selectors / helpers                                                 */
/* ------------------------------------------------------------------ */

export function useActiveArtifact(): Artifact | null {
  return useWorkspaceStore((s) => {
    if (!s.activeArtifactId) return null
    return s.artifacts.find((a) => a.id === s.activeArtifactId) ?? null
  })
}

export function useRecentArtifacts(limit = 5): Artifact[] {
  return useWorkspaceStore(
    useShallow((s) =>
      s.artifacts
        .filter((a) => !a.archived)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, limit),
    ),
  )
}

export function usePinnedArtifacts(): Artifact[] {
  return useWorkspaceStore(
    useShallow((s) => s.artifacts.filter((a) => a.pinned && !a.archived)),
  )
}

export const SOURCE_LABELS: Record<ArtifactSource, string> = {
  'conversation': 'Conversation',
  'uploaded-pdf': 'Uploaded PDF',
  'lecture-notes': 'Lecture Notes',
  'youtube-video': 'YouTube Video',
  'previous-artifact': 'Previous Artifact',
  'knowledge-base': 'Knowledge Base',
  'library': 'Library',
  'manual-input': 'Manual Input',
}

export const SOURCE_ICONS: Record<ArtifactSource, string> = {
  'conversation': '💬',
  'uploaded-pdf': '📄',
  'lecture-notes': '📝',
  'youtube-video': '🎥',
  'previous-artifact': '🔗',
  'knowledge-base': '🧠',
  'library': '📚',
  'manual-input': '✍️',
}
