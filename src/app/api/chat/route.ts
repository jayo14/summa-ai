import { NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * POST /api/chat
 *
 * Streams a chat completion from the Z.ai GLM model. The response body is a
 * stream of SSE-style events separated by `\n\n`. Each event is one of:
 *
 *   data: {"type":"thinking","delta":"..."}\n\n
 *   data: {"type":"content","delta":"..."}\n\n
 *   data: {"type":"done"}\n\n
 *   data: {"type":"error","message":"..."}\n\n
 *
 * The server enables the model's thinking mode so the client can render a
 * ChainOfThought panel alongside the final answer.
 *
 * NOTE: z-ai-web-dev-sdk returns the raw `ReadableStream<Uint8Array>` body
 * when `stream: true` is set. We parse SSE chunks from it ourselves.
 */
export async function POST(req: NextRequest) {
  let body: {
    messages: ChatMessage[]
    enableThinking?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const messages = Array.isArray(body?.messages) ? body.messages : []
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages must be a non-empty array' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const enableThinking = body.enableThinking !== false

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      }
      try {
        const zai = await ZAI.create()
        const upstream = (await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'You are Summa AI, an adaptive learning companion. You remember what the student knows, you proactively point out gaps, and you keep explanations concise, friendly, and well-structured with Markdown. Use fenced code blocks for code.',
            },
            ...messages,
          ],
          stream: true,
          thinking: { type: enableThinking ? 'enabled' : 'disabled' },
        })) as ReadableStream<Uint8Array>

        // The SDK returns the raw response body when streaming. Parse SSE.
        const reader = upstream.getReader()
        const decoder = new TextDecoder()
        let sseBuffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          sseBuffer += decoder.decode(value, { stream: true })

          // SSE events separated by blank line.
          let sep: number
          while ((sep = sseBuffer.indexOf('\n\n')) >= 0) {
            const raw = sseBuffer.slice(0, sep)
            sseBuffer = sseBuffer.slice(sep + 2)
            // Each event may have multiple lines; we only care about `data:`.
            for (const line of raw.split('\n')) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue
              const payload = trimmed.slice(5).trim()
              if (!payload || payload === '[DONE]') continue
              try {
                const json = JSON.parse(payload)
                const delta = json?.choices?.[0]?.delta ?? {}
                const reasoning: string | undefined =
                  delta.reasoning_content ?? delta.reasoning ?? delta.thinking
                const content: string | undefined = delta.content
                if (reasoning) send({ type: 'thinking', delta: reasoning })
                if (content) send({ type: 'content', delta: content })
              } catch {
                // Non-JSON line — ignore.
              }
            }
          }
        }

        send({ type: 'done' })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        send({ type: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  })
}
