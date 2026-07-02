import "next-auth"
import "next-auth/jwt"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      onboarded?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    accessToken?: string
    onboarded?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    id?: string
    onboarded?: boolean
  }
}
