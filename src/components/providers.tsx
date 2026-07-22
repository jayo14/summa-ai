"use client"

import * as React from "react"
import { AuthProvider } from "@/lib/use-supabase-auth"
import { FeatureFlagsProvider } from "@/lib/feature-flags"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FeatureFlagsProvider>
        {children}
      </FeatureFlagsProvider>
    </AuthProvider>
  )
}

