"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { Loader } from "@/components/prompt-kit/loader"
import { OnboardingFlow, type OnboardingData } from "@/components/prompt-kit/onboarding-flow"
import { getOnboardingData, isOnboarded, setOnboarded, setOnboardingData } from "@/lib/onboarding"

export const dynamic = "force-dynamic"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/sign-in")
      return
    }
    const userId = session?.user?.id || session?.user?.email
    if (!userId) return
    if (isOnboarded(userId)) {
      router.replace("/chat")
      return
    }
    setReady(true)
  }, [router, session?.user?.email, session?.user?.id, status])

  const userId = session?.user?.id || session?.user?.email || ""
  const initialData = React.useMemo(() => {
    if (!userId) {
      return {
        name: session?.user?.name ?? "",
        email: session?.user?.email ?? "",
        avatar: session?.user?.image ?? undefined,
      }
    }

    const stored = getOnboardingData(userId)
    return {
      ...stored,
      name: stored?.name ?? session?.user?.name ?? "",
      email: stored?.email ?? session?.user?.email ?? "",
      avatar: stored?.avatar ?? session?.user?.image ?? undefined,
    }
  }, [session?.user?.email, session?.user?.image, session?.user?.name, userId])

  if (status === "loading" || !ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader variant="dots" text="Preparing your profile" />
      </div>
    )
  }

  return (
    <OnboardingFlow
      initialData={initialData}
      onDataChange={(data: OnboardingData) => {
        if (userId) {
          setOnboardingData(userId, data)
        }
      }}
      onComplete={(data: OnboardingData) => {
        if (userId) {
          setOnboardingData(userId, data)
          setOnboarded(userId, true)
        }
        router.push("/chat")
        router.refresh()
      }}
      onSkip={(data: OnboardingData) => {
        if (userId) {
          setOnboardingData(userId, data)
          setOnboarded(userId, true)
        }
        router.push("/chat")
        router.refresh()
      }}
    />
  )
}
