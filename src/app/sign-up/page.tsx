import { SignUpScreen } from "@/components/sign-up-screen"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account — Summa AI",
  description: "Create your free Summa AI account. Personalized study plans, saved conversations, and progress tracking that carries over.",
}


export default function SignUpPage() {
  return <SignUpScreen />
}
