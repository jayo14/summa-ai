"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase"
import { fetchCurrentUserProfile } from "@/lib/onboarding"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

export interface AuthSession {
  accessToken?: string
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    onboarded?: boolean
  }
}

interface AuthContextValue {
  session: AuthSession | null
  status: AuthStatus
  signIn: (
    provider: "google" | "credentials",
    options?: { email?: string; password?: string; callbackUrl?: string },
  ) => Promise<void>
  signOut: (options?: { callbackUrl?: string }) => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue>({
  session: null,
  status: "loading",
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AuthSession | null>(null)
  const [status, setStatus] = React.useState<AuthStatus>("loading")
  const supabaseRef = React.useRef(createClient())
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refreshSession = React.useCallback(async () => {
    const {
      data: { session: supabaseSession },
    } = await supabaseRef.current.auth.getSession()

    if (!mountedRef.current) return

    if (!supabaseSession) {
      setSession(null)
      setStatus("unauthenticated")
      return
    }

    let onboarded = false
    try {
      const profile = await fetchCurrentUserProfile(supabaseSession.access_token)
      onboarded = profile.onboarded ?? false
    } catch {}

    if (!mountedRef.current) return

    setSession({
      accessToken: supabaseSession.access_token,
      user: {
        id: supabaseSession.user.id,
        name:
          supabaseSession.user.user_metadata?.full_name ??
          supabaseSession.user.user_metadata?.name ??
          null,
        email: supabaseSession.user.email ?? null,
        image:
          supabaseSession.user.user_metadata?.avatar_url ??
          supabaseSession.user.user_metadata?.picture ??
          null,
        onboarded,
      },
    })
    setStatus("authenticated")
  }, [])

  React.useEffect(() => {
    void refreshSession()

    const {
      data: { subscription },
    } = supabaseRef.current.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        if (mountedRef.current) {
          setSession(null)
          setStatus("unauthenticated")
        }
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void refreshSession()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshSession])

  const signIn = React.useCallback(
    async (
      provider: "google" | "credentials",
      options?: { email?: string; password?: string; callbackUrl?: string },
    ) => {
      setStatus("loading")

      if (provider === "google") {
        const { error } = await supabaseRef.current.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
      } else if (provider === "credentials") {
        const { error } = await supabaseRef.current.auth.signInWithPassword({
          email: options?.email ?? "",
          password: options?.password ?? "",
        })
        if (error) throw error
      }
    },
    [],
  )

  const signOut = React.useCallback(
    async (options?: { callbackUrl?: string }) => {
      await supabaseRef.current.auth.signOut()
      if (mountedRef.current) {
        setSession(null)
        setStatus("unauthenticated")
      }
      if (options?.callbackUrl) {
        window.location.href = options.callbackUrl
      }
    },
    [],
  )

  return React.createElement(
    AuthContext.Provider,
    { value: { session, status, signIn, signOut } },
    children,
  )
}

export function useAuth() {
  return React.useContext(AuthContext)
}
