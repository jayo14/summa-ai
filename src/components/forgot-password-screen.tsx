"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, Mail, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SummaLogo } from "@/components/prompt-kit/summa-logo"
import { createClient } from "@/lib/supabase"

export function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState("")
  const [sent, setSent] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Enter your email address")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` },
      )
      if (resetError) throw resetError
      setSent(true)
    } catch {
      setError("Could not send reset link. Please check your email and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 8%, rgba(255,255,255,.9), transparent 40%), radial-gradient(circle at 88% 20%, rgba(14,116,144,.06), transparent 40%)",
        }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1216px] items-center px-4 py-10 sm:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Left side */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center pb-8 lg:pb-16"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-green-500"></span>
              No worries, we all forget
            </div>

            <h1 className="mt-6 max-w-xl text-[34px] leading-[40px] tracking-tight sm:text-[46px] sm:leading-[52px] font-serif font-medium text-foreground">
              Reset your <span className="highlight-mark">password</span> in a flash.
            </h1>

            <p className="mt-5 max-w-md text-base text-muted-foreground leading-relaxed">
              Enter the email you signed up with and we&apos;ll send you a link to get
              back into your account.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Link sent in seconds",
                "Secure reset process",
                "Back to learning fast",
                "No data loss ever",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-4 py-3 text-sm shadow-sm"
                >
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <Card className="w-full max-w-[440px] border border-border/50 bg-card/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] backdrop-blur rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <SummaLogo size={28} />
                  <div>
                    <div className="text-lg font-semibold tracking-tight font-serif">Summa AI</div>
                    <div className="text-sm text-muted-foreground">Reset your password</div>
                  </div>
                </div>

                {sent ? (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-600 dark:text-green-400 flex items-start gap-3">
                      <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Check your inbox</p>
                        <p className="mt-1 text-muted-foreground">
                          If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                          password reset link.
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full rounded-[10px] py-6 h-auto text-base font-medium"
                      asChild
                    >
                      <Link href="/sign-in">
                        <ArrowLeft className="size-4" />
                        Back to sign in
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Email address"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-11 rounded-[10px] border-border/40 bg-background pl-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20"
                      />
                    </div>

                    {error ? (
                      <p className="text-sm text-destructive bg-destructive/5 rounded-[10px] px-3 py-2">{error}</p>
                    ) : null}

                    <Button
                      className="w-full rounded-[10px] py-6 h-auto text-base font-medium"
                      onClick={() => void handleSubmit()}
                      disabled={loading}
                    >
                      <Sparkles className="size-4" />
                      {loading ? "Sending…" : "Send reset link"}
                    </Button>

                    <div className="pt-2 text-center">
                      <Link
                        href="/sign-in"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="size-3.5" />
                        Back to sign in
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
