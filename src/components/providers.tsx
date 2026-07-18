"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { FeatureFlagsProvider } from "@/lib/feature-flags"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FeatureFlagsProvider>
        {children}
      </FeatureFlagsProvider>
    </SessionProvider>
  )
}

