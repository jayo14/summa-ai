"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/prompt-kit/loader"
import { SummaLogo } from "@/components/prompt-kit/summa-logo"
import { isOnboarded } from "@/lib/onboarding"

export function SignInScreen() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState<"google" | "summa" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (status !== "authenticated") return
    const userId = session?.user?.id || session?.user?.email || ""
    if (!userId) return
    router.replace(isOnboarded(userId) ? "/chat" : "/onboarding")
  }, [router, session?.user?.email, session?.user?.id, status])

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
    setLoading("summa")
    setError(null)
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/onboarding",
      redirect: false,
    })
    setLoading(null)

    if (result?.error) {
      setError("We could not start your account. Please check your details and try again.")
      return
    }

    startOnboarding()
  }

  const handleGoogle = async () => {
    setLoading("google")
    setError(null)
    await signIn("google", {
      callbackUrl: "/onboarding",
    })
    setLoading(null)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.14), transparent 68%)",
        }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 py-10 sm:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5" />
              Start with a profile that remembers your goals
            </div>

            <h1
              className="mt-6 max-w-xl text-4xl tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
            >
              Learn with a guide that keeps up with you.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              Create your learner profile, save your progress, and pick up where
              you left off any time.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Personalized study plans",
                "Saved conversations",
                "Progress that carries over",
                "Quick quiz and review sessions",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm shadow-sm"
                >
                  <CheckCircle2 className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden border-border/70 bg-card/90 shadow-2xl backdrop-blur">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <SummaLogo size={28} />
                  <div>
                    <div className="text-lg font-semibold tracking-tight">Summa AI</div>
                    <div className="text-sm text-muted-foreground">Start learning in minutes</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full justify-between rounded-2xl px-4 py-6 text-base"
                    variant="outline"
                    onClick={handleGoogle}
                    disabled={loading !== null}
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex size-9 items-center justify-center rounded-full bg-background">
                        G
                      </span>
                      Continue with Google
                    </span>
                    <ArrowRight className="size-4" />
                  </Button>

                  <div className="relative py-2 text-center">
                    <span className="relative z-10 bg-card px-2 text-xs text-muted-foreground">
                      or sign in with your SummaStudy profile
                    </span>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                  </div>

                  <div className="space-y-3">
                    <Input
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 rounded-xl"
                    />
                    <Input
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 rounded-xl"
                    />
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <Button
                      className="w-full rounded-2xl py-6 text-base"
                      onClick={() => void handleSummaStudy()}
                      disabled={!email.trim() || !password.trim() || loading !== null}
                    >
                      <BookOpen className="size-4" />
                      Sign in
                    </Button>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.2 }}
                  >
                    Sign in once, complete your quick onboarding, and jump straight into
                    your study workspace.
                  </motion.p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
