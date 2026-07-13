"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/prompt-kit/loader"
import { SummaLogo } from "@/components/prompt-kit/summa-logo"
import { fastapiUrl } from "@/lib/fastapi"

function passwordStrength(pw: string): { label: string; color: string; width: string } {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  const map = [
    { label: "Weak", color: "bg-red-500", width: "20%" },
    { label: "Weak", color: "bg-red-500", width: "20%" },
    { label: "Fair", color: "bg-orange-500", width: "40%" },
    { label: "Good", color: "bg-yellow-500", width: "60%" },
    { label: "Strong", color: "bg-lime-500", width: "80%" },
    { label: "Very strong", color: "bg-green-500", width: "100%" },
  ]
  return map[Math.min(score, 5)]
}

export function SignUpScreen() {
  const router = useRouter()
  const { status } = useSession()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [loading, setLoading] = React.useState<"google" | "summa" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const mounted = React.useRef(true)
  React.useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/chat")
    }
  }, [router, status])

  const safeSetLoading = (v: typeof loading) => {
    if (mounted.current) setLoading(v)
  }
  const safeSetError = (v: string | null) => {
    if (mounted.current) setError(v)
  }

  const startOnboarding = React.useCallback(() => {
    router.push("/onboarding")
    router.refresh()
  }, [router])

  const handleCreate = async () => {
    if (password !== confirm) {
      safeSetError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      safeSetError("Password must be at least 6 characters")
      return
    }
    if (!name.trim()) {
      safeSetError("Please enter your name")
      return
    }

    safeSetLoading("summa")
    safeSetError(null)

    try {
      // 1. Create account via dedicated backend endpoint
      const res = await fetch(fastapiUrl("/auth/signup"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          provider: "credentials",
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const detail = (body as { detail?: string }).detail
        if (res.status === 409) {
          safeSetError("An account with this email already exists. Try signing in.")
        } else {
          safeSetError(detail || "We could not create your account. Please try again.")
        }
        safeSetLoading(null)
        return
      }

      // 2. Sign in with the new credentials
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/onboarding",
        redirect: false,
      })

      if (!mounted.current) return
      safeSetLoading(null)

      if (result?.error) {
        safeSetError("Account created but sign-in failed. Please try signing in.")
        return
      }

      startOnboarding()
    } catch {
      if (mounted.current) {
        safeSetLoading(null)
        safeSetError("A network error occurred. Please check your connection and try again.")
      }
    }
  }

  const handleGoogle = async () => {
    safeSetLoading("google")
    safeSetError(null)
    await signIn("google", {
      callbackUrl: "/onboarding",
    })
    if (mounted.current) safeSetLoading(null)
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader variant="dots" text="Checking your session" />
      </div>
    )
  }

  const strength = password.length > 0 ? passwordStrength(password) : null
  const passwordsMatch = confirm.length === 0 || password === confirm

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
              Free to start, no card needed
            </div>

            <h1 className="mt-6 max-w-xl text-[34px] leading-[40px] tracking-tight sm:text-[46px] sm:leading-[52px] font-serif font-medium text-foreground">
              Build a profile that <span className="highlight-mark">learns with you</span>.
            </h1>

            <p className="mt-5 max-w-md text-base text-muted-foreground leading-relaxed">
              Create your Summa AI account in seconds. We build a knowledge graph, study plans, and progress tracking around the way you actually learn.
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

          {/* Right: sign-up card */}
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
                    <div className="text-sm text-muted-foreground">Create your account</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full justify-between rounded-[10px] px-4 py-6 h-auto text-base font-medium"
                    variant="outline"
                    type="button"
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
                      or sign up with email
                    </span>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-border/40" />
                  </div>

                  <div className="space-y-3">
                    {/* Name */}
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Full name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 rounded-[10px] border-border/40 bg-background pl-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20"
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-[10px] border-border/40 bg-background pl-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20"
                      />
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                    {/* Strength bar */}
                    {strength && (
                      <div className="space-y-1 -mt-1">
                        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-border/40">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                            style={{ width: strength.width }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground/60">
                          Strength: {strength.label}
                        </p>
                      </div>
                    )}

                    {/* Confirm password */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Confirm password"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`h-11 rounded-[10px] border-border/40 bg-background pl-10 pr-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20 ${
                          confirm.length > 0 && !passwordsMatch ? "border-destructive/50" : ""
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                        aria-label={showConfirm ? "Hide confirm" : "Show confirm"}
                      >
                        {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {confirm.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-destructive -mt-1">Passwords do not match</p>
                    )}

                    {/* Error */}
                    {error ? (
                      <p className="text-sm text-destructive bg-destructive/5 rounded-[10px] px-3 py-2">
                        {error}
                      </p>
                    ) : null}

                    {/* Submit */}
                    <Button
                      className="w-full rounded-[10px] py-6 h-auto text-base font-medium"
                      type="button"
                      onClick={() => void handleCreate()}
                      disabled={
                        !name.trim() ||
                        !email.trim() ||
                        !password.trim() ||
                        !confirm.trim() ||
                        !passwordsMatch ||
                        loading !== null
                      }
                    >
                      {loading === "summa" ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Creating…
                        </span>
                      ) : (
                        <>
                          <BookOpen className="size-4" />
                          Create account
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="font-medium text-foreground hover:text-summa-accent transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
