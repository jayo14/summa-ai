/**
 * zod mirror of apps/api/app/models/components.py — validates every
 * AI-sourced `artifact` SSE payload before it reaches a chat component.
 * Keep this in lockstep with the backend schema; a field added on one side
 * and not the other reopens the `Any`-typed crash path this replaces.
 */
import { z } from 'zod'

const baseComponent = { title: z.string().optional() }

export const hexagonComponentSchema = z.object({
  ...baseComponent,
  type: z.literal('hexagon'),
  dimensions: z
    .array(z.object({ label: z.string(), score: z.number().min(0).max(100) }))
    .min(1),
})

export const quizComponentSchema = z.object({
  ...baseComponent,
  type: z.literal('quiz'),
  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        options: z.array(z.string()).min(2),
        correctIndex: z.number().int().min(0),
        explanation: z.string().optional(),
      }),
    )
    .min(1),
})

export const flashcardsComponentSchema = z.object({
  ...baseComponent,
  type: z.literal('flashcards'),
  cards: z
    .array(z.object({ id: z.string(), front: z.string(), back: z.string() }))
    .min(1),
})

export const studyPlanComponentSchema = z.object({
  ...baseComponent,
  type: z.literal('study-plan'),
  days: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        tasks: z
          .array(z.object({ id: z.string(), text: z.string(), done: z.boolean().optional() }))
          .min(1),
      }),
    )
    .min(1),
})

export const graphComponentSchema = z.object({
  ...baseComponent,
  type: z.literal('graph'),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        x: z.number(),
        y: z.number(),
        mastery: z.enum(['mastered', 'learning', 'struggling', 'gap']),
      }),
    )
    .min(1),
  edges: z.array(z.object({ from: z.string(), to: z.string() })).default([]),
})

export const timelineComponentSchema = z.object({
  ...baseComponent,
  type: z.literal('timeline'),
  events: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        date: z.string(),
        description: z.string().optional(),
        status: z.enum(['upcoming', 'past', 'urgent']),
      }),
    )
    .min(1),
})

export const gapAnalysisComponentSchema = z.object({
  ...baseComponent,
  type: z.literal('gap-analysis'),
  gaps: z
    .array(
      z.object({
        id: z.string(),
        topic: z.string(),
        reason: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
        estTime: z.string(),
      }),
    )
    .min(1),
})

export const chatComponentDataSchema = z.discriminatedUnion('type', [
  hexagonComponentSchema,
  quizComponentSchema,
  flashcardsComponentSchema,
  studyPlanComponentSchema,
  graphComponentSchema,
  timelineComponentSchema,
  gapAnalysisComponentSchema,
])

export type ChatComponentDataValidated = z.infer<typeof chatComponentDataSchema>

export const artifactPayloadSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  data: chatComponentDataSchema,
})

export type ArtifactPayloadValidated = z.infer<typeof artifactPayloadSchema>

/**
 * Validates a raw `artifact` SSE event. Returns the validated component data
 * on success. On failure (missing `data`, malformed shape, unknown type),
 * logs why and returns null — callers must never render/open on null, and
 * must never throw.
 */
export function parseArtifactEvent(raw: unknown): ArtifactPayloadValidated | null {
  const result = artifactPayloadSchema.safeParse(raw)
  if (!result.success) {
    console.warn('[chat] rejected malformed artifact SSE payload:', result.error.flatten())
    return null
  }
  return result.data
}
