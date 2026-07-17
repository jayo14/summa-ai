import { fastapiFetch, fastapiUrl } from "./fastapi"

/* ── Types ────────────────────────────────────────────────────────── */

export interface HexagonDim {
  dimension: string
  score: number
}

export interface HexagonEvolution {
  month: string
  Depth: number
  "Problem-Solving": number
  Speed: number
  Consistency: number
  Confidence: number
  Creativity: number
}

export interface QuizScore {
  date: string
  score: number
  topic: string
}

export interface StudyTimeEntry {
  topic: string
  hours: number
}

export interface TopicMastery {
  topic: string
  mastery: number
  trend: "up" | "down"
}

export interface ExamReadiness {
  exam: string
  readiness: number
  daysLeft: number
}

export interface AnalyticsData {
  hexagonDimensions: HexagonDim[]
  hexagonEvolution: HexagonEvolution[]
  quizScores: QuizScore[]
  studyTime: StudyTimeEntry[]
  topicMastery: TopicMastery[]
  examReadiness: ExamReadiness[]
  summary: {
    avgScore: number
    totalHours: number
    avgReadiness: number
    quizzesTaken: number
  }
}

export interface TimelineEvent {
  id: string
  type: "artifact-generated" | "quiz-completed" | "study-session" | "resource-uploaded" | "milestone" | "recommendation" | "reminder" | "streak"
  title: string
  description: string
  timestamp: string
  meta?: { label: string; value: string }[]
}

export interface MemoryFact {
  content: string
  type: string
  created_at?: string
}

export interface MemorySummary {
  total: number
  by_type: Record<string, number>
}

export interface Artifact {
  id: string
  title: string
  type: string
  component: unknown
  source: string
  source_label?: string | null
  pinned: boolean
  archived: boolean
  version: number
  parent_artifact_id?: string | null
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  type: "pdf" | "video" | "webpage" | "notes"
  title: string
  source: string
  uploadedAt?: string
  size?: string | null
  duration?: string | null
  conceptsExtracted?: number
  status?: "processed" | "processing" | "failed"
}

export interface Concept {
  id: string
  name: string
  category: string
  mastery: "mastered" | "learning" | "struggling" | "gap"
  relatedConcepts?: number
  source?: string
}

/* ── Helpers ──────────────────────────────────────────────────────── */

async function apiGet<T>(path: string, token?: string): Promise<T | null> {
  try {
    return await fastapiFetch<T>(path, undefined, token)
  } catch (error) {
    console.error(`apiGet ${path} failed:`, error)
    return null
  }
}

async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T | null> {
  try {
    return await fastapiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }, token)
  } catch (error) {
    console.error(`apiPost ${path} failed:`, error)
    return null
  }
}

async function apiDelete(path: string, token?: string): Promise<boolean> {
  try {
    await fastapiFetch<unknown>(path, { method: "DELETE" }, token)
    return true
  } catch (error) {
    console.error(`apiDelete ${path} failed:`, error)
    return false
  }
}

async function apiGetOrThrow<T>(path: string, token?: string): Promise<T> {
  return fastapiFetch<T>(path, undefined, token)
}

async function apiPostOrThrow<T>(path: string, body: unknown, token?: string): Promise<T> {
  return fastapiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }, token)
}

async function apiDeleteOrThrow(path: string, token?: string): Promise<void> {
  await fastapiFetch<unknown>(path, { method: "DELETE" }, token)
}

/* ── Analytics ────────────────────────────────────────────────────── */

export async function fetchAnalytics(token: string): Promise<AnalyticsData | null> {
  return apiGet<AnalyticsData>("/analytics", token)
}

export async function fetchAnalyticsOrThrow(token: string): Promise<AnalyticsData> {
  return apiGetOrThrow<AnalyticsData>("/analytics", token)
}

export async function fetchHexagon(token: string): Promise<HexagonDim[] | null> {
  const res = await apiGet<{ dimensions?: HexagonDim[] }>("/memory/hexagon", token)
  return res?.dimensions ?? null
}

export async function fetchExams(token: string): Promise<ExamReadiness[] | null> {
  const res = await apiGet<{ exams?: ExamReadiness[] }>("/memory/exams?upcoming_only=true", token)
  return res?.exams ?? null
}

export async function fetchLearningProgress(token: string): Promise<TopicMastery[] | null> {
  const res = await apiGet<{ progress?: TopicMastery[] }>("/memory/progress", token)
  return res?.progress ?? null
}

/* ── Artifacts / Resources ────────────────────────────────────────── */

export async function fetchArtifacts(token: string, type?: string): Promise<Artifact[] | null> {
  const qs = type ? `?type=${type}` : ""
  return apiGet<Artifact[]>(`/artifacts${qs}`, token)
}

export async function deleteArtifact(id: string, token: string): Promise<boolean> {
  return apiDelete(`/artifacts/${id}`, token)
}

export async function deleteArtifactOrThrow(id: string, token: string): Promise<void> {
  await apiDeleteOrThrow(`/artifacts/${id}`, token)
}

/* ── Materials & Concepts ─────────────────────────────────────────── */

export async function fetchMaterials(token: string): Promise<Material[] | null> {
  const raw = await apiGet<Material[] | { materials?: Material[] }>("/materials", token)
  if (!raw) return null
  if (Array.isArray(raw)) return raw
  return raw.materials ?? null
}

export async function fetchConcepts(token: string): Promise<Concept[] | null> {
  const raw = await apiGet<Concept[] | { concepts?: Concept[] }>("/concepts", token)
  if (!raw) return null
  if (Array.isArray(raw)) return raw
  return raw.concepts ?? null
}

/* ── Timeline ─────────────────────────────────────────────────────── */

export async function fetchTimelineEvents(token: string, limit = 50): Promise<TimelineEvent[] | null> {
  const raw = await apiGet<TimelineEvent[] | { events?: TimelineEvent[] }>(`/timeline?limit=${limit}`, token)
  if (!raw) return null
  if (Array.isArray(raw)) return raw
  return raw.events ?? null
}

/* ── Hybrid Memory ────────────────────────────────────────────────── */

export async function fetchMemoryFacts(token: string, type?: string, limit = 20): Promise<MemoryFact[] | null> {
  const qs = type ? `?memory_type=${type}&limit=${limit}` : `?limit=${limit}`
  const res = await apiGet<{ facts?: MemoryFact[] }>(`/memory/hybrid/facts${qs}`, token)
  return res?.facts ?? null
}

export async function fetchMemorySummary(token: string): Promise<MemorySummary | null> {
  return apiGet<MemorySummary>("/memory/hybrid/summary", token)
}

export async function forgetMemoryTopic(token: string, dataset = "main", topic?: string): Promise<boolean> {
  const body: Record<string, unknown> = { dataset_name: dataset }
  if (topic) body.topic = topic
  const res = await apiPost<{ status?: string }>("/memory/forget", body, token)
  return res?.status === "success"
}

export async function forgetDataset(token: string, dataset = "main"): Promise<boolean> {
  return forgetMemoryTopic(token, dataset)
}
