import type { OnboardingData } from "@/components/prompt-kit/onboarding-flow"
import { fastapiFetch, type FastapiUser } from "@/lib/fastapi"

const ONBOARDING_DATA_KEY = "summa-onboarding-data"
const ONBOARDED_KEY = "summa-onboarded"

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function storageKey(prefix: string, userId: string) {
  return `${prefix}:${userId}`
}

export function normalizeOnboardingData(raw: unknown): Partial<OnboardingData> {
  if (!raw || typeof raw !== "object") return {}

  const data = raw as Record<string, unknown>
  const exams = Array.isArray(data.exams)
    ? data.exams.map((exam) => {
        const entry = exam as Record<string, unknown>
        return {
          id: String(entry.id ?? ""),
          name: String(entry.name ?? ""),
          date: entry.date ? new Date(String(entry.date)) : undefined,
        }
      })
    : []

  return {
    name: typeof data.name === "string" ? data.name : undefined,
    email: typeof data.email === "string" ? data.email : undefined,
    avatar: typeof data.avatar === "string" ? data.avatar : undefined,
    degree: typeof data.degree === "string" ? data.degree : undefined,
    field: typeof data.field === "string" ? data.field : undefined,
    year: typeof data.year === "string" ? data.year : undefined,
    learningStyle:
      data.learningStyle === "visual" || data.learningStyle === "auditory" || data.learningStyle === "kinesthetic"
        ? data.learningStyle
        : undefined,
    stylePrefs:
      data.stylePrefs && typeof data.stylePrefs === "object"
        ? (data.stylePrefs as OnboardingData["stylePrefs"])
        : undefined,
    goals: typeof data.goals === "string" ? data.goals : undefined,
    exams,
    personality:
      data.personality && typeof data.personality === "object"
        ? (data.personality as OnboardingData["personality"])
        : undefined,
  }
}

export function getOnboardingData(userId: string): Partial<OnboardingData> | undefined {
  if (!canUseStorage() || !userId) return undefined

  const raw = window.localStorage.getItem(storageKey(ONBOARDING_DATA_KEY, userId))
  if (!raw) return undefined

  try {
    return normalizeOnboardingData(JSON.parse(raw))
  } catch {
    return undefined
  }
}

export function setOnboardingData(userId: string, data: Partial<OnboardingData>) {
  if (!canUseStorage() || !userId) return
  window.localStorage.setItem(storageKey(ONBOARDING_DATA_KEY, userId), JSON.stringify(data))
}

export function isOnboarded(userId: string) {
  if (!canUseStorage() || !userId) return false
  return window.localStorage.getItem(storageKey(ONBOARDED_KEY, userId)) === "true"
}

export function setOnboarded(userId: string, value: boolean) {
  if (!canUseStorage() || !userId) return
  window.localStorage.setItem(storageKey(ONBOARDED_KEY, userId), value ? "true" : "false")
}

export function buildOnboardingProfile(user: FastapiUser | null | undefined): Partial<OnboardingData> {
  if (!user) return {}

  const onboardingData = normalizeOnboardingData(user.onboarding_data)
  return {
    ...onboardingData,
    name: onboardingData.name ?? user.name ?? "",
    email: onboardingData.email ?? user.email ?? "",
    avatar: onboardingData.avatar ?? user.avatar ?? undefined,
  }
}

export async function fetchCurrentUserProfile(accessToken: string) {
  return fastapiFetch<FastapiUser>("/user", undefined, accessToken)
}

export async function updateCurrentUserProfile(accessToken: string, patch: Partial<FastapiUser> & { onboarding_data?: unknown; onboarded?: boolean }) {
  return fastapiFetch<FastapiUser>(
    "/user",
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
    accessToken,
  )
}
