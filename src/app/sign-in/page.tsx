import { SignInScreen } from "@/components/sign-in-screen"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — Summa AI",
  description: "Sign in to your Summa AI account. Your persistent learner profile, knowledge graph, and study plans carry across every session.",
}


export default function SignInPage() {
  return <SignInScreen />
}

