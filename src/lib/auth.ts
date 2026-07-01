import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

import { FASTAPI_BASE_URL, fastapiUrl } from "@/lib/fastapi"

type BackendAuthResponse = {
  id?: string
  email?: string
  name?: string
  avatar?: string | null
  access_token?: string
  token?: string
}

function fallbackUserId(email: string) {
  return email.toLowerCase()
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
        if (!email) {
          return null
        }

        const backendAuthUrl =
          process.env.FASTAPI_AUTH_LOGIN_URL ||
          process.env.NEXT_PUBLIC_FASTAPI_AUTH_LOGIN_URL ||
          ""

        if (backendAuthUrl) {
          try {
            const response = await fetch(backendAuthUrl, {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                email,
                password: credentials?.password ?? "",
              }),
            })

            if (response.ok) {
              const data = (await response.json()) as BackendAuthResponse
              return {
                id: data.id ?? data.email ?? fallbackUserId(email),
                email: data.email ?? email,
                name: data.name ?? "",
                image: data.avatar ?? null,
                accessToken: data.access_token ?? data.token,
              }
            }
          } catch {
            // Fall through to local session creation when the backend auth
            // endpoint is unavailable during frontend integration work.
          }
        }

        return {
          id: fallbackUserId(email),
          email,
          name: "",
          image: null,
          accessToken: undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        token.accessToken = (user as { accessToken?: string }).accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? token.sub ?? session.user.email ?? ""
        session.user.name = token.name ?? session.user.name
        session.user.email = token.email ?? session.user.email ?? ""
        session.user.image = token.picture ?? session.user.image
      }
      session.accessToken = token.accessToken as string | undefined
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const fastapiAuthBaseUrl = FASTAPI_BASE_URL

export function buildConversationUrl(path: string) {
  return fastapiUrl(path)
}
