import { ForgotPasswordScreen } from "@/components/forgot-password-screen"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password — Summa AI",
  description: "Reset your Summa AI password. Enter your email and we'll send you a link to get back into your account.",
}


export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />
}
