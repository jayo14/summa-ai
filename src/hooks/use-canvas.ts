'use client'

import { create } from 'zustand'
import type { ChatComponentData } from '@/components/prompt-kit/chat-components'

export type CanvasMode = 'empty' | 'single' | 'grid' | 'dashboard'

export interface CanvasEntry {
  id: string
  component: ChatComponentData
  addedAt: number
}

interface CanvasState {
  /** Whether the canvas panel is visible */
  isOpen: boolean
  /** Components currently rendered in the canvas */
  entries: CanvasEntry[]
  /** Layout mode — auto-computed from entries.length but can be overridden */
  modeOverride: CanvasMode | null

  /** Actions */
  open: () => void
  close: () => void
  toggle: () => void
  addComponent: (component: ChatComponentData) => void
  removeComponent: (id: string) => void
  clear: () => void
  setMode: (mode: CanvasMode | null) => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  isOpen: false,
  entries: [],
  modeOverride: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  addComponent: (component) => {
    const id = `${component.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({
      isOpen: true,
      entries: [...s.entries, { id, component, addedAt: Date.now() }],
    }))
  },

  removeComponent: (id) =>
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== id),
    })),

  clear: () => set({ entries: [], modeOverride: null }),

  setMode: (mode) => set({ modeOverride: mode }),
}))

/** Derived mode: if override is set, use it; otherwise compute from entries. */
export function useCanvasMode(): CanvasMode {
  const { entries, modeOverride } = useCanvasStore()
  if (modeOverride) return modeOverride
  if (entries.length === 0) return 'empty'
  if (entries.length === 1) return 'single'
  return 'grid'
}
