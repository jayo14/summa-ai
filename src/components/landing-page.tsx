'use client'

import * as React from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Sparkles, Brain, Layers, Target, Network, Calendar, AlertTriangle,
  ArrowRight, ChevronDown, Play, CheckCircle2, GitBranch, Hexagon as HexagonIcon,
  Sun, Moon, BookOpen, Zap, BarChart3, Shield, MessageSquare,
  ChevronRight, Menu, X, Trophy, Clock, Star, Quote,
} from 'lucide-react'
import { FocusRing } from '@/components/focus-ring'

export interface LandingPageProps {
  onGetStarted: () => void
  isDark: boolean
  onToggleTheme: () => void
}

/* ────────────────────────────────────────────────────────── */
/*  MAIN                                                      */
/* ────────────────────────────────────────────────────────── */

export function LandingPage({ onGetStarted, isDark, onToggleTheme }: LandingPageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const [mobileMenu, setMobileMenu] = React.useState(false)

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden bg-background selection:bg-summa-accent/20 selection:text-summa-accent">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-0.5 origin-left bg-gradient-to-r from-summa-accent/40 via-summa-accent to-summa-accent/40"
        style={{ scaleX }}
      />

      <NavBar onGetStarted={onGetStarted} isDark={isDark} onToggleTheme={onToggleTheme} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />

      <HeroSection onGetStarted={onGetStarted} scrollYProgress={scrollYProgress} />
      <TrustBar />
      <MetricsSection />
      <HowItWorks />
      <FeaturesShowcase />
      <ProblemSolution />
      <TestimonialsSection />
      <PricingSection onGetStarted={onGetStarted} />
      <FAQSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/90 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-8"
          >
            {['Features', 'How it works', 'Pricing', 'FAQ'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setMobileMenu(false)}
                className="text-2xl font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
            <Button onClick={onGetStarted} className="mt-4 rounded-full px-8 h-12 text-base">
              Get started free <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  NAV                                                       */
/* ────────────────────────────────────────────────────────── */

function NavBar({ onGetStarted, isDark, onToggleTheme, mobileMenu, setMobileMenu }: any) {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
        scrolled
          ? 'bg-background/60 backdrop-blur-2xl border-b border-border/30 shadow-lg shadow-black/5'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-summa-accent to-summa-accent/80 text-white shadow-lg shadow-summa-accent/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-summa-accent/30 group-hover:scale-105">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">Summa<span className="text-summa-accent">AI</span></span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {['Features', 'How it works', 'Pricing', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-muted-foreground hover:text-summa-accent transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-summa-accent after:rounded-full after:transition-all hover:after:w-full"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 text-muted-foreground hover:bg-summa-accent/10 hover:text-summa-accent transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Button
            onClick={onGetStarted}
            className="hidden sm:inline-flex rounded-full h-9 px-5 text-sm font-medium shadow-lg shadow-summa-accent/20 hover:shadow-xl hover:shadow-summa-accent/30 transition-all"
          >
            Get started free
          </Button>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-full p-2 text-muted-foreground hover:bg-summa-accent/10 hover:text-summa-accent transition-all md:hidden"
            aria-label="Menu"
          >
            {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  HERO                                                      */
/* ────────────────────────────────────────────────────────── */

function HeroSection({ onGetStarted, scrollYProgress }: any) {
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden pt-24">
      {/* Deep animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-64 -left-64 size-[800px] rounded-full bg-summa-accent/[0.04] blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-64 -right-64 size-[800px] rounded-full bg-summa-accent/[0.03] blur-[180px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-summa-accent/[0.02] blur-[140px]"
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--summa-accent) 1px, transparent 1px), linear-gradient(90deg, var(--summa-accent) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-summa-accent/20 bg-summa-accent/[0.04] px-5 py-1.5 text-xs font-medium text-summa-accent backdrop-blur-sm"
        >
          <FocusRing value={100} size="sm" state="complete" aria-label="Live">
            <span className="text-[7px] font-bold text-summa-accent">AI</span>
          </FocusRing>
          <span>Now in public beta</span>
          <span className="hidden sm:inline text-muted-foreground">· Join 2,000+ learners</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontWeight: 400 }}
        >
          The learning companion<br />
          <span className="bg-gradient-to-r from-summa-accent via-summa-accent/80 to-summa-accent/40 bg-clip-text text-transparent">
            that never forgets
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-8 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          An adaptive learning workspace that remembers your knowledge, tracks gaps,
          and generates quizzes, flashcards, and study plans — all in one persistent environment.
        </motion.p>

        {/* CTA group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="h-13 rounded-full px-8 text-base font-medium bg-summa-accent text-summa-accent-foreground shadow-xl shadow-summa-accent/30 hover:shadow-2xl hover:shadow-summa-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Start learning free
            <ArrowRight className="ml-1.5 size-4" />
          </Button>
          <button className="group inline-flex h-13 items-center gap-2.5 rounded-full border border-border/60 px-6 text-sm font-medium transition-all hover:border-summa-accent/30 hover:bg-summa-accent/5">
            <span className="flex size-8 items-center justify-center rounded-full bg-summa-accent/10 text-summa-accent group-hover:bg-summa-accent/20 transition-colors">
              <Play className="size-3.5 ml-0.5" />
            </span>
            Watch demo
          </button>
        </motion.div>

        {/* Floating glass preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 mx-auto max-w-4xl"
        >
          <div className="relative rounded-2xl border border-border/30 bg-background/30 backdrop-blur-xl p-1 shadow-2xl shadow-black/5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-summa-accent/[0.02] to-transparent pointer-events-none" />
            <div className="relative rounded-xl border border-border/20 bg-background/40 p-5">
              {/* Browser chrome */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-red-400/60" />
                    <div className="size-2.5 rounded-full bg-yellow-400/60" />
                    <div className="size-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <div className="ml-2 rounded-full bg-summa-accent/5 border border-summa-accent/10 px-3 py-1">
                    <span className="text-[11px] text-summa-accent font-medium flex items-center gap-1.5">
                      <Sparkles className="size-3" />
                      summa.ai
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-summa-accent/10 px-2.5 py-0.5 text-[10px] font-medium text-summa-accent border border-summa-accent/20">
                    v2 · Current
                  </span>
                </div>
              </div>

              {/* Chat + Artifact split */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.2fr]">
                <div className="space-y-3">
                  {[
                    { role: 'user', text: 'Quiz me on Transformers' },
                    { role: 'ai', text: "I've generated a quiz. It's open in the workspace →" },
                  ].map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + i * 0.3 }}
                      className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[92%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'rounded-tr-md bg-summa-accent text-summa-accent-foreground shadow-sm'
                            : 'rounded-tl-md bg-secondary/70',
                        )}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {/* Input bar */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/60 px-4 py-2.5"
                  >
                    <span className="text-sm text-muted-foreground flex-1">Ask Summa AI...</span>
                    <div className="size-7 rounded-full bg-summa-accent/20 flex items-center justify-center">
                      <ArrowRight className="size-3.5 text-summa-accent" />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 }}
                  className="rounded-xl border border-border/30 bg-background/30 p-4"
                >
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                    <Brain className="size-4 text-summa-accent" />
                    Quiz: Transformers
                    <span className="ml-auto text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">4 questions</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">What does attention compute?</p>
                  <div className="space-y-2">
                    {['A weighted sum of values', 'A simple average', 'A fixed dot product'].map((opt, i) => (
                      <div
                        key={opt}
                        className={cn(
                          'flex items-center justify-between rounded-lg border px-3.5 py-2 text-sm',
                          i === 0 ? 'border-summa-accent/30 bg-summa-accent/5' : 'border-border/40',
                        )}
                      >
                        {opt}
                        {i === 0 && <CheckCircle2 className="size-4 text-summa-accent" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1.5 text-muted-foreground/60"
          >
            <span className="text-[9px] font-medium uppercase tracking-[0.2em]">Scroll</span>
            <ChevronDown className="size-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  TRUST BAR                                                 */
/* ────────────────────────────────────────────────────────── */

function TrustBar() {
  const items = [
    { label: 'Adaptive', icon: <Brain className="size-4" /> },
    { label: 'Persistent', icon: <span className="text-lg font-bold leading-none">∞</span> },
    { label: 'Smart', icon: <Zap className="size-4" /> },
    { label: 'Secure', icon: <Shield className="size-4" /> },
    { label: 'Personalized', icon: <Target className="size-4" /> },
  ]

  return (
    <section className="py-12 border-y border-border/30 bg-gradient-to-r from-summa-accent/[0.02] via-transparent to-summa-accent/[0.02]">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">
          Trusted by learners who demand more
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
            >
              <span className="text-summa-accent/50">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  METRICS                                                   */
/* ────────────────────────────────────────────────────────── */

function MetricsSection() {
  const metrics = [
    { value: 7, suffix: '+', label: 'Artifact types', icon: <Layers className="size-4" /> },
    { value: 6, suffix: '', label: 'Proficiency dimensions', icon: <HexagonIcon className="size-4" /> },
    { value: 99, suffix: '%', label: 'Uptime', icon: <BarChart3 className="size-4" /> },
    { value: 0, suffix: '', label: 'Setup cost', icon: <Target className="size-4" /> },
  ]

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/30 p-6 text-center hover:border-summa-accent/20 hover:shadow-lg hover:shadow-summa-accent/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-summa-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-summa-accent/10 text-summa-accent">
                  {m.icon}
                </div>
                <div
                  className="text-4xl tracking-tight sm:text-5xl text-foreground"
                  style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
                >
                  <CountUp target={m.value} />{m.suffix}
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground">{m.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CountUp({ target }: { target: number }) {
  const [count, setCount] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const duration = 1500
          const step = 16
          const totalSteps = duration / step
          const increment = target / totalSteps
          const timer = setInterval(() => {
            start += increment
            if (start >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, step)
        }
      },
      { threshold: 0.5 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{count}</span>
}

/* ────────────────────────────────────────────────────────── */
/*  HOW IT WORKS — animated connecting path                  */
/* ────────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    { number: 1, title: 'Tell us about you', desc: 'Share your degree, field, goals, and learning style. Takes 2 minutes.', icon: <MessageSquare className="size-5" /> },
    { number: 2, title: 'Learn naturally', desc: 'Ask questions, get quizzes, flashcards, and study plans — all versioned.', icon: <Brain className="size-5" /> },
    { number: 3, title: 'Grow persistently', desc: 'Summa AI tracks your knowledge, fills gaps, and follows up proactively.', icon: <Trophy className="size-5" /> },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gradient-to-b from-summa-accent/[0.02] to-transparent">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">How it works</p>
          <h2 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>
            Three steps to learn smarter
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            From first session to mastery — Summa AI grows with you.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <svg className="absolute top-14 left-[15%] right-[15%] hidden h-px md:block" width="100%" height="2">
            <motion.line
              x1="0" y1="1" x2="100%" y2="1"
              stroke="var(--summa-accent)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="opacity-30"
            />
          </svg>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="inline-flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-summa-accent to-summa-accent/80 text-summa-accent-foreground shadow-xl shadow-summa-accent/20">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 inline-flex size-7 items-center justify-center rounded-full bg-background text-sm font-bold text-summa-accent border-2 border-summa-accent/20 shadow-sm">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  FEATURES SHOWCASE — glass bento                          */
/* ────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    id: 'adaptive', icon: <Brain className="size-5" />, title: 'Adaptive Tutoring',
    desc: 'Explains at your level — undergrad to Master\'s. Remembers what you know and adjusts dynamically.',
    color: 'from-blue-500/5 to-purple-500/5', accent: 'text-blue-500',
    span: 'tall',
  },
  {
    id: 'artifacts', icon: <Layers className="size-5" />, title: 'Artifact System',
    desc: 'Quizzes, flashcards, plans — each is a first-class, versioned entity.',
    color: 'from-emerald-500/5 to-teal-500/5', accent: 'text-emerald-500',
  },
  {
    id: 'exam', icon: <Target className="size-5" />, title: 'Exam Prep Engine',
    desc: 'Upload your timetable, get a personalized study roadmap that adjusts dynamically.',
    color: 'from-amber-500/5 to-orange-500/5', accent: 'text-amber-500',
    span: 'wide',
  },
  {
    id: 'hexagon', icon: <HexagonIcon className="size-5" />, title: 'Proficiency Hexagon',
    desc: 'Six dimensions: Depth, Problem-Solving, Speed, Consistency, Confidence, Creativity.',
    color: 'from-rose-500/5 to-pink-500/5', accent: 'text-rose-500',
  },
  {
    id: 'graph', icon: <Network className="size-5" />, title: 'Knowledge Graph',
    desc: 'See prerequisites, gaps, and mastery in one interactive graph.',
    color: 'from-cyan-500/5 to-sky-500/5', accent: 'text-cyan-500',
  },
  {
    id: 'version', icon: <GitBranch className="size-5" />, title: 'Version History',
    desc: 'Every modification creates a new version. Never lose work. Restore anytime.',
    color: 'from-violet-500/5 to-purple-500/5', accent: 'text-violet-500',
  },
  {
    id: 'memory', icon: <Calendar className="size-5" />, title: 'Proactive Memory',
    desc: 'Remembers your exams, follows up, and reminds you without prompting.',
    color: 'from-indigo-500/5 to-blue-500/5', accent: 'text-indigo-500',
  },
  {
    id: 'gap', icon: <AlertTriangle className="size-5" />, title: 'Gap Analysis',
    desc: 'Finds what you don\'t know before you realize it. Color-coded by priority.',
    color: 'from-red-500/5 to-rose-500/5', accent: 'text-red-500',
  },
]

function FeaturesShowcase() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">Features</p>
          <h2 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>
            Everything you need<br />to learn smarter
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            From adaptive tutoring to proactive memory — the first workspace built around how learning actually works.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.id}
              feature={f}
              index={i}
              className={f.span === 'tall' ? 'sm:row-span-2' : f.span === 'wide' ? 'sm:col-span-2' : ''}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index, className }: any) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/30 bg-background/30 backdrop-blur-sm p-6 transition-all duration-300',
        'hover:border-summa-accent/20 hover:shadow-xl hover:shadow-summa-accent/5 hover:-translate-y-0.5',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
          feature.color,
          hovered && 'opacity-100',
        )}
      />
      <div className="relative z-10">
        <div className={cn(
          'mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-summa-accent/10 text-summa-accent ring-1 ring-summa-accent/10',
          'group-hover:bg-summa-accent/15 group-hover:ring-summa-accent/20 transition-all',
        )}>
          {feature.icon}
        </div>
        <h3 className="text-base font-semibold mb-1.5">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  PROBLEM / SOLUTION                                       */
/* ────────────────────────────────────────────────────────── */

function ProblemSolution() {
  const pairs = [
    { problem: 'Forget what you studied last week', solution: 'Persistent memory across every session — Summa AI remembers' },
    { problem: 'Generic explanations that miss your level', solution: 'Adaptive tutoring calibrated to your degree and field' },
    { problem: 'Lost quizzes and scattered notes', solution: 'Every artifact is versioned, saved, and searchable' },
    { problem: 'No one reminds you what to review', solution: 'Proactive follow-ups based on your knowledge gaps' },
  ]

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-transparent via-summa-accent/[0.02] to-transparent">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">The shift</p>
          <h2 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>
            Learning shouldn't be this hard
          </h2>
        </motion.div>

        <div className="mx-auto max-w-4xl space-y-4">
          {pairs.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 rounded-2xl border border-border/30 bg-card/20 p-5 hover:border-summa-accent/15 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="size-7 shrink-0 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="size-3.5 text-destructive/70" />
                </div>
                <p className="text-sm text-muted-foreground pt-0.5">{p.problem}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-7 shrink-0 rounded-full bg-summa-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="size-3.5 text-summa-accent" />
                </div>
                <p className="text-sm font-medium pt-0.5">{p.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  TESTIMONIALS                                              */
/* ────────────────────────────────────────────────────────── */

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Summa AI remembers what I've studied and surfaces exactly what I need to review. It's like having a tutor who never sleeps.",
      name: 'Alex Chen', role: 'CS Master\'s Student',
      initials: 'AC',
    },
    {
      quote: 'The gap analysis alone saved me from failing my NLP final. It found prerequisites I didn\'t know I was missing.',
      name: 'Sarah Kim', role: 'Undergrad, AI Major',
      initials: 'SK',
    },
    {
      quote: 'This is the first study app that actually adapts to how I learn instead of forcing me into their template.',
      name: 'Marcus Johnson', role: 'Lifelong Learner',
      initials: 'MJ',
    },
  ]

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">Testimonials</p>
          <h2 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>
            Loved by learners
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl border border-border/30 bg-background/30 backdrop-blur-sm p-6 transition-all hover:border-summa-accent/20 hover:shadow-xl hover:shadow-summa-accent/5 hover:-translate-y-1"
            >
              <Quote className="size-6 text-summa-accent/20 mb-4" />
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-summa-accent to-summa-accent/60 flex items-center justify-center text-xs font-semibold text-summa-accent-foreground shadow-md">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  PRICING                                                   */
/* ────────────────────────────────────────────────────────── */

function PricingSection({ onGetStarted }: any) {
  const [yearly, setYearly] = React.useState(false)

  const plans = [
    {
      name: 'Free', price: 0, yearlyPrice: 0,
      desc: 'Get started with core features',
      features: ['7 artifact types', '10 conversations', 'Basic gap analysis', 'Community support'],
      popular: false,
    },
    {
      name: 'Pro', price: 12, yearlyPrice: 10,
      desc: 'For serious learners',
      features: ['Unlimited conversations', 'Advanced gap analysis', 'Exam prep engine', 'Version history', 'Priority support'],
      popular: true,
    },
    {
      name: 'Team', price: 29, yearlyPrice: 24,
      desc: 'For study groups & classrooms',
      features: ['Everything in Pro', 'Up to 10 members', 'Shared knowledge graph', 'Progress dashboard', 'API access'],
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 md:py-28 bg-gradient-to-b from-summa-accent/[0.02] to-transparent">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">Pricing</p>
          <h2 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">Start free. Upgrade when you outgrow us.</p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border/30 bg-card/30 p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition-all', !yearly && 'bg-summa-accent text-summa-accent-foreground shadow-sm')}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition-all', yearly && 'bg-summa-accent text-summa-accent-foreground shadow-sm')}
            >
              Yearly
              <span className="ml-1.5 text-[10px] opacity-70">-17%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 mx-auto max-w-5xl">
          {plans.map((plan, i) => {
            const price = yearly ? plan.yearlyPrice : plan.price
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'relative rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl',
                  plan.popular
                    ? 'border-summa-accent/30 bg-card shadow-lg shadow-summa-accent/10'
                    : 'border-border/30 bg-card/50',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-summa-accent to-summa-accent/80 px-4 py-0.5 text-[10px] font-medium text-summa-accent-foreground shadow-lg">
                    Most popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </div>
                <div className="mb-5">
                  <span className="text-4xl font-bold">${price}</span>
                  <span className="text-sm text-muted-foreground ml-1">/mo</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-summa-accent shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={onGetStarted}
                  variant={plan.popular ? 'default' : 'outline'}
                  className={cn('w-full rounded-full', plan.popular ? 'bg-summa-accent text-summa-accent-foreground hover:bg-summa-accent/90 shadow-md' : '')}
                >
                  {plan.name === 'Free' ? 'Get started' : plan.name === 'Team' ? 'Contact sales' : 'Start free trial'}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  FAQ                                                       */
/* ────────────────────────────────────────────────────────── */

function FAQSection() {
  const faqs = [
    { q: 'How is Summa AI different from ChatGPT?', a: 'Summa AI is purpose-built for learning — it remembers your knowledge graph, tracks gaps across sessions, and generates persistent artifacts (quizzes, flashcards, plans) instead of one-off chat messages.' },
    { q: 'Do I need to install anything?', a: 'No. Summa AI runs entirely in your browser. Just sign in and start learning.' },
    { q: 'Is my data private?', a: 'Yes. Your learning data is encrypted and never used to train models. You can delete your data at any time.' },
    { q: 'Can I use Summa AI for multiple subjects?', a: 'Absolutely. Summa AI maintains separate knowledge graphs per subject and can switch contexts seamlessly.' },
    { q: 'What if I already have a SummaStudy account?', a: 'You can sign in with the same credentials — Summa AI and SummaStudy share one account. Your library content will carry over with a Library badge.' },
  ]

  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">FAQ</p>
          <h2 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden transition-all hover:border-summa-accent/15"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium">{faq.q}</span>
                <ChevronRight
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                    openIndex === i && 'rotate-90 text-summa-accent',
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  CTA                                                       */
/* ────────────────────────────────────────────────────────── */

function CTASection({ onGetStarted }: any) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-summa-accent via-summa-accent/95 to-summa-accent/90" />
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, white 0%, transparent 50%), radial-gradient(circle at 80% 70%, white 0%, transparent 50%)',
      }} />
      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 size-32 rounded-full bg-white/5 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 right-10 size-40 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <FocusRing size="lg" state="active" value={65} aria-label="Progress" className="mx-auto mb-8">
            <Sparkles className="size-6 text-white" />
          </FocusRing>
          <h2 className="text-4xl tracking-tight text-white sm:text-5xl md:text-6xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>
            Start your learning journey
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
            Join Summa AI and experience an AI-native learning workspace that grows with you.
          </p>
          <div className="mt-10">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="h-13 rounded-full bg-white px-8 text-base font-medium text-summa-accent shadow-xl hover:bg-white/90 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get started free
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/30">No credit card required · Free forever plan</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  FOOTER                                                    */
/* ────────────────────────────────────────────────────────── */

function Footer() {
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <footer className="border-t border-border/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-summa-accent to-summa-accent/80 text-summa-accent-foreground shadow-md">
              <Sparkles className="size-3.5" />
            </div>
            <span className="text-sm font-bold">Summa<span className="text-summa-accent">AI</span></span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="transition-colors hover:text-summa-accent">{link.label}</a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">Built for learners everywhere</p>
        </div>
        <div className="mt-8 pt-6 border-t border-border/20 text-center text-[11px] text-muted-foreground/40">
          &copy; {new Date().getFullYear()} Summa AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
