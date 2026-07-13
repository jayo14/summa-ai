import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

import { fastapiUrl } from "@/lib/fastapi"

type BackendAuthResponse = {
  access_token?: string
  token_type?: string
  user?: {
    id?: string
    email?: string
    name?: string | null
    avatar?: string | null
    bio?: string | null
    provider?: string | null
    onboarded?: boolean
    onboarding_data?: unknown
  }
  token?: string
}

type AuthRequestPayload = {
  email: string
  password?: string
  provider: "credentials" | "google"
  name?: string | null
  avatar?: string | null
}

async function exchangeBackendSession(payload: AuthRequestPayload) {
  const response = await fetch(fastapiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response.text().catch(() => "")
    throw new Error(message || "Backend authentication failed")
  }

  return (await response.json()) as BackendAuthResponse
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "SummaStudy",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim()
        const password = credentials?.password ?? ""
        if (!email) {
          return null
        }

        try {
          const data = await exchangeBackendSession({
            email,
            password,
            provider: "credentials",
          })

          if (!data.user?.id || !data.user.email || !data.access_token) {
            return null
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name ?? "",
            image: data.user.avatar ?? null,
            accessToken: data.access_token,
            onboarded: data.user.onboarded ?? false,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        token.accessToken = (user as { accessToken?: string }).accessToken
        token.onboarded = (user as { onboarded?: boolean }).onboarded ?? false
      }

      if (account?.provider === "google" && token.accessToken == null) {
        const googleProfile = profile as {
          email?: string
          name?: string
          picture?: string
        } | undefined
        const email = (googleProfile?.email ?? token.email ?? "").trim()
        if (email) {
          const data = await exchangeBackendSession({
            email,
            name: googleProfile?.name ?? token.name ?? undefined,
            avatar: googleProfile?.picture ?? token.picture ?? undefined,
            provider: "google",
          })
          token.id = data.user?.id ?? token.id
          token.name = data.user?.name ?? token.name
          token.email = data.user?.email ?? token.email
          token.picture = data.user?.avatar ?? token.picture
          token.accessToken = data.access_token ?? token.accessToken
          token.onboarded = data.user?.onboarded ?? token.onboarded
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? token.sub ?? session.user.email ?? ""
        session.user.name = token.name ?? session.user.name
        session.user.email = token.email ?? session.user.email ?? ""
        session.user.image = token.picture ?? session.user.image
        session.user.onboarded = (token.onboarded as boolean | undefined) ?? false
      }
      session.accessToken = token.accessToken as string | undefined
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export function buildConversationUrl(path: string) {
  return fastapiUrl(path)
}
