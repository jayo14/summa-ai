"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface FeatureFlags {
  WEBSOCKET_ENABLED: boolean
  NEW_CHAT_UI: boolean
  ADVANCED_ANALYTICS: boolean
}

const DEFAULT_FLAGS: FeatureFlags = {
  WEBSOCKET_ENABLED: true,
  NEW_CHAT_UI: false,
  ADVANCED_ANALYTICS: false,
}

const FeatureFlagsContext = createContext<{
  flags: FeatureFlags
  setFlags: (flags: Partial<FeatureFlags>) => void
}>({
  flags: DEFAULT_FLAGS,
  setFlags: () => {},
})

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlagsState] = useState<FeatureFlags>(DEFAULT_FLAGS)

  useEffect(() => {
    const stored = localStorage.getItem("feature-flags")
    if (stored) {
      try {
        setFlagsState({ ...DEFAULT_FLAGS, ...JSON.parse(stored) })
      } catch {}
    }
  }, [])

  const setFlags = (updates: Partial<FeatureFlags>) => {
    setFlagsState((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem("feature-flags", JSON.stringify(next))
      return next
    })
  }

  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext)
}
