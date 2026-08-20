import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from './use-chat'

function sseResponse(lines: string[]) {
  const body = lines.map((l) => `data: ${l}\n\n`).join('')
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(body))
      controller.close()
    },
  })
  return new Response(stream, { status: 200 })
}

describe('useChat SSE parsing + artifact validation', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses content/thinking/done events and accumulates message text', async () => {
    fetchMock.mockResolvedValue(
      sseResponse([
        JSON.stringify({ type: 'thinking', delta: 'considering...' }),
        JSON.stringify({ type: 'content', delta: 'Hello' }),
        JSON.stringify({ type: 'content', delta: ' world' }),
        '[DONE]',
      ]),
    )
    const onDone = vi.fn()
    const { result } = renderHook(() => useChat({ onDone }))

    act(() => {
      result.current.send('hi')
    })

    await waitFor(() => expect(onDone).toHaveBeenCalled())
    const finalMessages = onDone.mock.calls[0][0]
    expect(finalMessages.at(-1).content).toBe('Hello world')
  })

  it('passes through a well-formed artifact payload to onArtifact', async () => {
    const goodArtifact = {
      id: 'a1',
      title: 'Recursion Quiz',
      type: 'quiz',
      data: {
        type: 'quiz',
        title: 'Recursion Quiz',
        questions: [
          {
            id: 'q1',
            question: 'What stops recursion?',
            options: ['Base case', 'Loop', 'Pointer', 'Overflow'],
            correctIndex: 0,
          },
        ],
      },
    }
    fetchMock.mockResolvedValue(
      sseResponse([
        JSON.stringify({ type: 'artifact', artifact: goodArtifact }),
        JSON.stringify({ type: 'content', delta: 'Here you go' }),
        '[DONE]',
      ]),
    )
    const onArtifact = vi.fn()
    const { result } = renderHook(() => useChat({ onArtifact }))

    act(() => {
      result.current.send('quiz me on recursion')
    })

    await waitFor(() => expect(onArtifact).toHaveBeenCalledTimes(1))
    expect(onArtifact).toHaveBeenCalledWith(goodArtifact)

    // The validated component must land on the assistant message itself so
    // ChatBubble can render it inline via ChatComponentRenderer — not just
    // reach the onArtifact side-channel.
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.messages.at(-1)?.components).toEqual([goodArtifact.data])
  })

  it('drops a malformed artifact payload without throwing and without calling onArtifact', async () => {
    const malformed = {
      id: 'a1',
      title: 'Broken Quiz',
      type: 'quiz',
      // `data` present but missing required `questions` — must be rejected.
      data: { type: 'quiz', title: 'Broken Quiz' },
    }
    fetchMock.mockResolvedValue(
      sseResponse([
        JSON.stringify({ type: 'artifact', artifact: malformed }),
        JSON.stringify({ type: 'content', delta: 'Oops' }),
        '[DONE]',
      ]),
    )
    const onArtifact = vi.fn()
    const onError = vi.fn()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { result } = renderHook(() => useChat({ onArtifact, onError }))

    expect(() => {
      act(() => {
        result.current.send('quiz me')
      })
    }).not.toThrow()

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(onArtifact).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('passes through a skeleton artifact event (no data) unchanged', async () => {
    const skeleton = { id: 'pending-quiz', title: 'Quiz', type: 'quiz' }
    fetchMock.mockResolvedValue(
      sseResponse([
        JSON.stringify({ type: 'artifact', artifact: skeleton }),
        JSON.stringify({ type: 'content', delta: 'Text answer only' }),
        '[DONE]',
      ]),
    )
    const onArtifact = vi.fn()
    const { result } = renderHook(() => useChat({ onArtifact }))

    act(() => {
      result.current.send('quiz me')
    })

    await waitFor(() => expect(onArtifact).toHaveBeenCalledTimes(1))
    expect(onArtifact).toHaveBeenCalledWith(skeleton)
  })
})
