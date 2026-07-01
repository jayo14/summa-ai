import type { OnboardingData } from "@/components/prompt-kit/onboarding-flow"

export function onboardingKey(userId: string) {
  return `summa-onboarded:${userId}`
}

export function onboardingDataKey(userId: string) {
  return `summa-onboarding-data:${userId}`
}

export function isOnboarded(userId: string) {
  if (typeof window === "undefined") return false
  return localStorage.getItem(onboardingKey(userId)) === "true"
}

export function setOnboarded(userId: string, value: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem(onboardingKey(userId), value ? "true" : "false")
}

export function getOnboardingData(userId: string): OnboardingData | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(onboardingDataKey(userId))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as OnboardingData
    return {
      ...parsed,
      exams: Array.isArray(parsed.exams)
        ? parsed.exams.map((exam) => ({
            ...exam,
            date: exam.date ? new Date(exam.date) : undefined,
          }))
        : [],
    }
  } catch {
    return null
  }
}

export function setOnboardingData(userId: string, data: OnboardingData) {
  if (typeof window === "undefined") return
  localStorage.setItem(onboardingDataKey(userId), JSON.stringify(data))
}

export function updateOnboardingData(userId: string, patch: Partial<OnboardingData>) {
  if (typeof window === "undefined") return
  const current = getOnboardingData(userId)
  if (!current) return
  setOnboardingData(userId, { ...current, ...patch })
}
