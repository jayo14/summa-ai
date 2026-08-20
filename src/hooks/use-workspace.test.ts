import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWorkspaceStore } from './use-workspace'
import type { ChatComponentData } from '@/components/prompt-kit/chat-components'

vi.mock('@/lib/api', () => ({
  createArtifact: vi.fn(),
}))

import { createArtifact as createArtifactRemote } from '@/lib/api'

const quiz: ChatComponentData = {
  type: 'quiz',
  title: 'Recursion Quiz',
  questions: [
    { id: 'q1', question: 'What stops recursion?', options: ['Base case', 'Loop'], correctIndex: 0 },
  ],
}

function resetStore() {
  useWorkspaceStore.setState({
    isOpen: false,
    activeArtifactId: null,
    artifacts: [],
    suggestions: [],
    pinned: [],
  })
}

describe('useWorkspaceStore persistence to backend', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
    vi.mocked(createArtifactRemote).mockReset()
    vi.mocked(createArtifactRemote).mockResolvedValue({
      id: 'server-1',
      title: 'Recursion Quiz',
      type: 'quiz',
      component: quiz,
      source: 'conversation',
      pinned: false,
      archived: false,
      version: 1,
      created_at: '',
      updated_at: '',
    })
  })

  it('createArtifact POSTs to /artifacts when an accessToken is provided', async () => {
    useWorkspaceStore.getState().createArtifact({
      title: 'Recursion Quiz',
      component: quiz,
      accessToken: 'token-123',
    })

    await vi.waitFor(() => expect(createArtifactRemote).toHaveBeenCalledTimes(1))
    const [payload, token] = vi.mocked(createArtifactRemote).mock.calls[0]
    expect(token).toBe('token-123')
    expect(payload.title).toBe('Recursion Quiz')
    expect(payload.type).toBe('quiz')
    expect(payload.component).toEqual(quiz)
  })

  it('createArtifact does not attempt a network call without an accessToken', () => {
    useWorkspaceStore.getState().createArtifact({ title: 'Local only', component: quiz })
    expect(createArtifactRemote).not.toHaveBeenCalled()
  })

  it('addSuggestion (the chat-generated path) also persists via POST /artifacts', async () => {
    useWorkspaceStore.getState().addSuggestion(
      {
        id: 'a1',
        title: 'Recursion Quiz',
        type: 'quiz',
        versions: [{ version: 1, createdAt: Date.now(), component: quiz }],
        currentVersion: 1,
        source: 'conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        archived: false,
        pinned: false,
      },
      'Summa AI generated: Recursion Quiz',
      'token-123',
      'conv-1',
    )

    await vi.waitFor(() => expect(createArtifactRemote).toHaveBeenCalledTimes(1))
    const [payload] = vi.mocked(createArtifactRemote).mock.calls[0]
    expect(payload.conversation_id).toBe('conv-1')
  })

  it('local state is set immediately (optimistic) regardless of backend persistence', () => {
    const id = useWorkspaceStore.getState().createArtifact({
      title: 'Recursion Quiz',
      component: quiz,
      accessToken: 'token-123',
    })
    expect(useWorkspaceStore.getState().artifacts[0].id).toBe(id)
    expect(useWorkspaceStore.getState().activeArtifactId).toBe(id)
  })

  it('persists artifacts/suggestions/pinned across a simulated reload via localStorage', async () => {
    useWorkspaceStore.getState().createArtifact({ title: 'Recursion Quiz', component: quiz })
    await vi.waitFor(() => {
      const raw = localStorage.getItem('summa-workspace')
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw!)
      expect(parsed.state.artifacts).toHaveLength(1)
    })
  })
})
