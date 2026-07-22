"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/use-supabase-auth"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, CheckCircle2, Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/prompt-kit/loader"
import { SummaLogo } from "@/components/prompt-kit/summa-logo"
import { fetchCurrentUserProfile } from "@/lib/onboarding"

export function SignInScreen() {
  const router = useRouter()
  const { session, status, signIn } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [loading, setLoading] = React.useState<"google" | "summa" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const mounted = React.useRef(true)
  React.useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  React.useEffect(() => {
    if (status !== "authenticated") return
    const accessToken = session?.accessToken
    let cancelled = false

    const run = async () => {
      if (!accessToken) {
        router.replace(session?.user?.onboarded ? "/chat" : "/onboarding")
        return
      }

      try {
        const profile = await fetchCurrentUserProfile(accessToken)
        if (cancelled) return
        router.replace(profile.onboarded ? "/chat" : "/onboarding")
      } catch {
        if (!cancelled) {
          router.replace(session?.user?.onboarded ? "/chat" : "/onboarding")
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [router, session?.accessToken, session?.user?.onboarded, status])

  const safe = {
    setLoading: (v: typeof loading) => { if (mounted.current) setLoading(v) },
    setError: (v: string | null) => { if (mounted.current) setError(v) },
  }

  const startOnboarding = React.useCallback(() => {
    router.push("/onboarding")
    router.refresh()
  }, [router])

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader variant="dots" text="Checking your session" />
      </div>
    )
  }

  const handleSummaStudy = async () => {
    safe.setLoading("summa")
    safe.setError(null)
    try {
      await signIn("credentials", { email, password })
      if (!mounted.current) return
      safe.setLoading(null)
      startOnboarding()
    } catch {
      if (!mounted.current) return
      safe.setLoading(null)
      safe.setError("We could not start your account. Please check your details and try again.")
    }
  }

  const handleGoogle = async () => {
    safe.setLoading("google")
    safe.setError(null)
    await signIn("google")
    if (mounted.current) safe.setLoading(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
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
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center pb-8 lg:pb-16"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Start with a profile that remembers
            </div>

            <h1 className="mt-6 max-w-xl text-[34px] leading-[40px] tracking-tight sm:text-[46px] sm:leading-[52px] font-serif font-medium text-foreground">
              Learn with a guide that <span className="highlight-mark">keeps up</span> with you.
            </h1>

            <p className="mt-5 max-w-md text-base text-muted-foreground leading-relaxed">
              Sign in once to create your persistent learner profile. Your knowledge graph, study plans, and progress carry across every session.
            </p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 grid gap-3 sm:grid-cols-2"
            >
              {[
                "Personalized study plans",
                "Saved conversations",
                "Progress that carries over",
                "Quick quiz and review sessions",
              ].map((item) => (
                <motion.div
                  key={item}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-4 py-3 text-sm shadow-sm transition-colors"
                >
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: sign-in card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center justify-center"
          >
            <Card className="w-full max-w-[440px] border border-border/50 bg-card/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] backdrop-blur rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <SummaLogo size={28} />
                  <div>
                    <div className="text-lg font-semibold tracking-tight font-serif">Summa AI</div>
                    <div className="text-sm text-muted-foreground">Welcome back</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full justify-between rounded-[10px] px-4 py-6 h-auto text-base font-medium"
                    variant="outline"
                    onClick={handleGoogle}
                    disabled={loading !== null}
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border/40 bg-background font-bold text-foreground text-sm">
                        G
                      </span>
                      Continue with Google
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Button>

                  <div className="relative py-2 text-center">
                    <span className="relative z-10 bg-card px-2 text-xs text-muted-foreground/60">
                      or sign in with your SummaStudy profile
                    </span>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-border/40" />
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-11 rounded-[10px] border-border/40 bg-background pl-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-11 rounded-[10px] border-border/40 bg-background pl-10 pr-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end -mt-1 mb-1">
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    {error ? (
                      <p className="text-sm text-destructive bg-destructive/5 rounded-[10px] px-3 py-2">{error}</p>
                    ) : null}
                    <Button
                      className="w-full rounded-[10px] py-6 h-auto text-base font-medium"
                      onClick={() => void handleSummaStudy()}
                      disabled={!email.trim() || !password.trim() || loading !== null}
                    >
                      <BookOpen className="size-4" />
                      {loading === "summa" ? (
                        <span className="ml-2">Signing in…</span>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 rounded-[10px] border border-border/30 bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    New around here?{" "}
                    <Link href="/sign-up" className="font-medium text-foreground hover:text-summa-accent transition-colors">
                      Create an account
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
