'use client'

import * as React from 'react'
import type { ChatComponentData } from '@/components/prompt-kit/chat-components'

export interface UseChatMessage {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  reasoningActive?: boolean
  streaming?: boolean
  error?: string
  /** Optional UI component(s) attached to this message (hexagon, quiz, etc.) */
  components?: ChatComponentData[]
}

export interface UseChatOptions {
  api?: string
  enableThinking?: boolean
  userId?: string
  conversationId?: string
  onDone?: (messages: UseChatMessage[]) => void
  onError?: (err: string) => void
}

export interface UseChatReturn {
  messages: UseChatMessage[]
  status: 'ready' | 'submitted' | 'streaming' | 'error'
  isLoading: boolean
  send: (text: string, components?: ChatComponentData[], conversationId?: string | null) => void
  sendWithComponent: (text: string, component: ChatComponentData, conversationId?: string | null) => void
  stop: () => void
  regenerate: () => void
  reset: () => void
  setMessages: React.Dispatch<React.SetStateAction<UseChatMessage[]>>
}

/**
 * Minimal chat hook that streams from the /api/chat SSE endpoint.
 * Designed to plug into prompt-kit components.
 */
export function useChat(opts: UseChatOptions = {}): UseChatReturn {
  const { api = '/api/chat', enableThinking = true, userId, conversationId, onDone, onError } = opts
  const [messages, setMessages] = React.useState<UseChatMessage[]>([])
  const [status, setStatus] = React.useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready')
  const abortRef = React.useRef<AbortController | null>(null)

  const stop = React.useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStatus('ready')
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i === prev.length - 1 && m.role === 'assistant') {
          return { ...m, streaming: false, reasoningActive: false }
        }
        return m
      }),
    )
  }, [])

  const runStream = React.useCallback(
    async (history: UseChatMessage[], components?: ChatComponentData[], requestConversationId?: string | null) => {
      const controller = new AbortController()
      abortRef.current = controller
      setStatus('submitted')

      const assistantIndex = history.length
      let assistantContent = ''
      let assistantReasoning = ''
      setMessages([
        ...history,
        {
          role: 'assistant',
          content: '',
          reasoning: '',
          streaming: true,
          reasoningActive: true,
          components,
        },
      ])

      try {
        const res = await fetch(api, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            user_id: userId ?? 'anonymous',
            conversation_id: requestConversationId ?? conversationId ?? null,
            enableThinking,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => 'Request failed')
          throw new Error(text || `HTTP ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let sawFirstContent = false

        setStatus('streaming')

        const update = (patch: Partial<UseChatMessage>) => {
          setMessages((prev) =>
            prev.map((m, i) => (i === assistantIndex ? { ...m, ...patch } : m)),
          )
        }

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          let idx: number
          while ((idx = buffer.indexOf('\n\n')) >= 0) {
            const raw = buffer.slice(0, idx).trim()
            buffer = buffer.slice(idx + 2)
            if (!raw.startsWith('data: ')) continue
            const json = raw.slice(6)
            let event: { type: string; delta?: string; message?: string }
            try {
              event = JSON.parse(json)
            } catch {
              continue
            }
            if (event.type === 'thinking' && event.delta) {
              assistantReasoning += event.delta
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === assistantIndex
                    ? { ...m, reasoningActive: true, reasoning: assistantReasoning }
                    : m,
                ),
              )
            } else if (event.type === 'content' && event.delta) {
              if (!sawFirstContent) {
                sawFirstContent = true
                update({ reasoningActive: false })
              }
              assistantContent += event.delta
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === assistantIndex
                    ? { ...m, content: assistantContent }
                    : m,
                ),
              )
            } else if (event.type === 'error') {
              throw new Error(event.message || 'Stream error')
            } else if (event.type === 'done') {
              update({ streaming: false, reasoningActive: false })
            }
          }
        }

        update({ streaming: false, reasoningActive: false })
        onDone?.([
          ...history,
          {
            role: 'assistant',
            content: assistantContent,
            reasoning: assistantReasoning || undefined,
            reasoningActive: false,
            streaming: false,
            components,
          },
        ])
        setStatus('ready')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Stream failed'
        if ((err as any)?.name === 'AbortError') {
          setStatus('ready')
          return
        }
        setStatus('error')
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 && m.role === 'assistant'
              ? {
                  ...m,
                  streaming: false,
                  reasoningActive: false,
                  error: msg,
                  content: m.content || `⚠️ ${msg}`,
                }
              : m,
          ),
        )
        onError?.(msg)
      } finally {
        abortRef.current = null
      }
    },
    [api, conversationId, enableThinking, onDone, onError, userId],
  )

  const send = React.useCallback(
    (text: string, components?: ChatComponentData[], requestConversationId?: string | null) => {
      const trimmed = text.trim()
      if (!trimmed) return
      if (status === 'submitted' || status === 'streaming') return
      const next: UseChatMessage[] = [...messages, { role: 'user', content: trimmed }]
      setMessages(next)
      void runStream(next, components, requestConversationId)
    },
    [messages, runStream, status],
  )

  /** Convenience: send a message that triggers a specific UI component. */
  const sendWithComponent = React.useCallback(
    (text: string, component: ChatComponentData, requestConversationId?: string | null) =>
      send(text, [component], requestConversationId),
    [send],
  )

  const regenerate = React.useCallback(() => {
    if (status === 'submitted' || status === 'streaming') return
    setMessages((prev) => {
      const copy = [...prev]
      // Preserve components from the assistant message we're dropping
      let preservedComponents: ChatComponentData[] | undefined
      while (copy.length && copy[copy.length - 1].role === 'assistant') {
        const removed = copy.pop() as UseChatMessage
        if (removed.components && !preservedComponents) {
          preservedComponents = removed.components
        }
      }
      if (copy.length === 0) return prev
      void runStream(copy, preservedComponents)
      return copy
    })
  }, [runStream, status])

  const reset = React.useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setStatus('ready')
  }, [])

  const isLoading = status === 'submitted' || status === 'streaming'

  return { messages, status, isLoading, send, sendWithComponent, stop, regenerate, reset, setMessages }
}

export default useChat
