"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, CheckCircle2, Lock, Mail, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/prompt-kit/loader"
import { SummaLogo } from "@/components/prompt-kit/summa-logo"

export function SignUpScreen() {
  const router = useRouter()
  const { status } = useSession()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState<"google" | "summa" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/chat")
    }
  }, [router, status])

  const startOnboarding = React.useCallback(() => {
    router.push("/onboarding")
    router.refresh()
  }, [router])

  const handleCreate = async () => {
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
      setError("We could not create your account. Please check your details and try again.")
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

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader variant="dots" text="Checking your session" />
      </div>
    )
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
          {/* Left: Value prop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center pb-8 lg:pb-16"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-green-500"></span>
              Free to start, no card needed
            </div>

            <h1 className="mt-6 max-w-xl text-[34px] leading-[40px] tracking-tight sm:text-[46px] sm:leading-[52px] font-serif font-medium text-foreground">
              Build a profile that <span className="highlight-mark">learns with you</span>.
            </h1>

            <p className="mt-5 max-w-md text-base text-muted-foreground leading-relaxed">
              Create your Summa AI account in seconds. We build a knowledge graph, study plans, and progress tracking around the way you actually learn.
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
                  className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-4 py-3 text-sm shadow-sm"
                >
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Sign-up card */}
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
                      or sign up with your email
                    </span>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-border/40" />
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Full name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="h-11 rounded-[10px] border-border/40 bg-background pl-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20"
                      />
                    </div>
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
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-11 rounded-[10px] border-border/40 bg-background pl-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                      <Input
                        placeholder="Confirm password"
                        type="password"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        className="h-11 rounded-[10px] border-border/40 bg-background pl-10 text-sm focus-visible:border-summa-accent/40 focus-visible:ring-summa-accent/20"
                      />
                    </div>
                    <Button
                      className="w-full rounded-[10px] py-6 h-auto text-base font-medium"
                      type="button"
                    >
                      <BookOpen className="size-4" />
                      Create account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
