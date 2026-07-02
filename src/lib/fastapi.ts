export type FastapiUser = {
  id: string
  email: string
  name?: string | null
  avatar?: string | null
  bio?: string | null
  provider?: string | null
  onboarded?: boolean
  onboarding_data?: unknown
  created_at?: string
  updated_at?: string
}

export type FastapiConversation = {
  id: string
  user_id: string
  title: string
  snippet?: string | null
  archived?: boolean
  created_at?: string
  updated_at?: string
}

export type FastapiMessage = {
  id?: string
  conversation_id?: string
  role: "user" | "assistant"
  content: string
  reasoning?: string | null
  components?: unknown
  created_at?: string
}

export const FASTAPI_BASE_URL =
  (process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ?? process.env.FASTAPI_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "")

export function fastapiUrl(path: string) {
  return `${FASTAPI_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export async function fastapiFetch<T>(
  path: string,
  init?: RequestInit,
  accessToken?: string,
): Promise<T> {
  const response = await fetch(fastapiUrl(path), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(text || `FastAPI request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
