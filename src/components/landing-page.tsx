'use client'

import * as React from 'react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Sparkles, Brain, Layers, Target, Network, Calendar, AlertTriangle,
  ArrowRight, ChevronDown, Play, CheckCircle2, GitBranch, Hexagon,
  Sun, Moon, Zap, BarChart3, Shield, MessageSquare,
  ChevronRight, Menu, X, Trophy, Quote, BookOpen, Search, Clock,
  Lightbulb, Rocket, Users,
} from 'lucide-react'
import { FocusRing } from '@/components/focus-ring'

export interface LandingPageProps {
  onGetStarted: () => void
  isDark: boolean
  onToggleTheme: () => void
}

export function LandingPage({ onGetStarted, isDark, onToggleTheme }: LandingPageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const [mobileMenu, setMobileMenu] = React.useState(false)

  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '-40px' })
    const els = document.querySelectorAll('.reveal, .reveal-top')
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden bg-background selection:bg-summa-accent/20 selection:text-summa-accent">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-0.5 origin-left bg-gradient-to-r from-summa-accent/40 via-summa-accent to-summa-accent/40"
        style={{ scaleX }}
      />

      <NavBar onGetStarted={onGetStarted} isDark={isDark} onToggleTheme={onToggleTheme} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />
      <HeroSection onGetStarted={onGetStarted} />
      <TrustBar />
      <StatsBar />
      <FeaturesBento />
      <ExperienceShowcase />
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

/* ─────────────────────────────────────────────── */
/*  NAV                                            */
/* ─────────────────────────────────────────────── */

function NavBar({ onGetStarted, isDark, onToggleTheme, mobileMenu, setMobileMenu }: any) {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[1216px]">
      <div className="bg-background/80 backdrop-blur-xl border border-border/40 rounded-xl md:rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-summa-accent to-summa-accent/80 text-white shadow-lg shadow-summa-accent/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-summa-accent/30 group-hover:scale-105">
            <Sparkles className="size-4" />
          </div>
          <span className="font-serif text-xl font-bold text-foreground tracking-tight">Summa<span className="text-summa-accent">AI</span></span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {['Features', 'How it works', 'Pricing', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

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
            className="hidden sm:inline-flex rounded-[10px] h-9 px-5 text-sm font-medium shadow-sm"
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
    </header>
  )
}

/* ─────────────────────────────────────────────── */
/*  HERO                                           */
/* ─────────────────────────────────────────────── */

function HeroSection({ onGetStarted }: any) {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-summa-accent/[0.06] via-background to-background pt-[126px] lg:pt-[166px] pb-10">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{
        backgroundImage: 'radial-gradient(circle at 15% 8%, rgba(255,255,255,.9), transparent 40%), radial-gradient(circle at 88% 20%, rgba(14,116,144,.08), transparent 40%)'
      }} />

      <div className="relative mx-auto max-w-[1216px] flex flex-col items-center justify-between md:flex-row px-4">
        <div className="pb-12 md:max-w-[440px] lg:max-w-[560px] xl:max-w-[600px] space-y-4 text-center md:text-start">

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="reveal-top mx-auto flex w-fit items-center rounded-full border border-border bg-background md:mx-0"
          >
            <span className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-green-500"></span>
              Now in public beta
            </span>
          </motion.div>

          <h1 className="reveal text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-[46px] md:leading-[52px] lg:text-[58px] lg:leading-[64px] font-serif font-medium text-foreground">
            The learning companion<br className="hidden md:block" /> that <span className="highlight-mark">never forgets.</span>
          </h1>

          <p className="reveal text-base text-muted-foreground leading-relaxed max-w-[520px]">
            Summa AI remembers your knowledge, tracks gaps across sessions, and generates quizzes, flashcards, and study plans — all in one persistent workspace.
          </p>

          <div className="reveal mt-6 flex flex-wrap items-stretch gap-3 md:mt-9 justify-center md:justify-start">
            <Button
              onClick={onGetStarted}
              className="rounded-[10px] px-6 py-3 text-sm font-medium h-auto"
            >
              Start learning free <ArrowRight className="ml-1.5 size-4" />
            </Button>
            <button className="group inline-flex items-center justify-center gap-2 rounded-[10px] border border-border/60 bg-background px-6 py-3 text-sm font-medium transition-all hover:border-summa-accent/30 hover:bg-summa-accent/5">
              <span className="flex size-8 items-center justify-center rounded-full bg-summa-accent/10 text-summa-accent group-hover:bg-summa-accent/20 transition-colors">
                <Play className="size-3.5 ml-0.5" />
              </span>
              Watch demo
            </button>
          </div>

          <p className="reveal text-xs text-muted-foreground/50 pt-2">No credit card. Start learning in under 2 minutes.</p>
        </div>

        <div className="reveal w-[300px] lg:w-[400px] xl:w-[460px]">
          <div className="rounded-[24px] bg-background border border-border shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] p-4 space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-2.5">
              <Search className="size-4 text-muted-foreground/60 shrink-0" />
              <span className="text-sm text-muted-foreground">Quiz me on Transformers</span>
            </div>

            <div className="rounded-xl bg-summa-accent/[0.04] border border-summa-accent/10 p-4 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                The attention mechanism computes a <strong>weighted sum</strong> of values, where weights are determined by the query&apos;s similarity to each key.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="chip"><span className="size-1.5 rounded-full bg-green-500"></span> Knowledge Graph · Transformers</span>
                <span className="chip"><span className="size-1.5 rounded-full bg-green-500"></span> Artifact · Flashcard Set</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground/60 px-1">
              <span className="flex items-center gap-1"><Clock className="size-3.5" /> Answered in 1.2s</span>
              <span className="flex items-center gap-1"><Brain className="size-3.5" /> Retrieved from memory</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────── */
/*  TRUST BAR                                      */
/* ─────────────────────────────────────────────── */

function TrustBar() {
  const items = [
    { label: 'Adaptive', icon: <Brain className="size-4" /> },
    { label: 'Persistent', icon: <span className="text-lg font-bold leading-none">∞</span> },
    { label: 'Smart', icon: <Zap className="size-4" /> },
    { label: 'Secure', icon: <Shield className="size-4" /> },
    { label: 'Personalized', icon: <Target className="size-4" /> },
  ]

  return (
    <section className="py-10 md:py-14 border-y border-border/30 bg-gradient-to-r from-summa-accent/[0.02] via-transparent to-summa-accent/[0.02]">
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

/* ─────────────────────────────────────────────── */
/*  STATS BAR                                      */
/* ─────────────────────────────────────────────── */

function StatsBar() {
  return (
    <section className="bg-card border-y border-border/30 py-10 md:py-14 lg:py-20">
      <div className="reveal mx-auto flex max-w-[1216px] flex-col items-center justify-between gap-10 px-4 py-4 md:flex-row">
        <h2 className="max-w-[500px] text-[28px] leading-[34px] tracking-tight sm:text-[34px] sm:leading-[40px] font-serif font-medium text-foreground text-center md:text-left">
          Smart learners stop losing progress to scattered notes.
        </h2>
        <div className="flex w-full flex-wrap items-center gap-8 lg:w-fit lg:gap-14 justify-center md:justify-end">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-[34px] leading-[40px] sm:text-[40px] sm:leading-[44px] font-serif font-medium text-foreground">7+</h2>
            <p className="text-sm text-muted-foreground">Artifact types</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-[34px] leading-[40px] sm:text-[40px] sm:leading-[44px] font-serif font-medium text-foreground">6</h2>
            <p className="text-sm text-muted-foreground">Proficiency dimensions</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-[34px] leading-[40px] sm:text-[40px] sm:leading-[44px] font-serif font-medium text-foreground">100%</h2>
            <p className="text-sm text-muted-foreground">Persistent memory</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────── */
/*  FEATURES BENTO                                 */
/* ─────────────────────────────────────────────── */

function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-[1216px] py-[110px] lg:py-[140px]">
      <div className="reveal space-y-4 px-4 text-center mx-auto max-w-[640px]">
        <h2 className="text-[28px] leading-[34px] tracking-tight sm:text-[34px] sm:leading-[40px] lg:text-[46px] lg:leading-[52px] font-serif font-medium text-foreground">
          Everything scattered. One place to learn.
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          Summa AI remembers what you know, adapts to your level, and generates study materials — no re-tagging, no new habits, no forgotten sessions.
        </p>
      </div>

      <ul className="relative mt-10 grid w-full grid-cols-12 gap-3 px-4 lg:mt-16 xl:gap-7 xl:px-0">
        <li className="reveal col-span-12 lg:col-span-5">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-2xl bg-card border border-border/30 p-5 md:p-7">
            <div className="space-y-3">
              <h4 className="text-[22px] leading-[28px] font-serif font-medium text-foreground">Learn in plain English</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Type a real question the way you&apos;d ask a tutor — no keywords, no filters, no guessing what to study next.</p>
            </div>
            <div className="dotted-bg relative isolate flex h-[240px] w-full items-center justify-center overflow-hidden rounded-xl bg-muted/30 p-4">
              <div className="w-[85%] rounded-xl bg-background border border-border/30 shadow-sm p-3 space-y-2">
                <div className="text-xs text-muted-foreground/60">You asked</div>
                <div className="text-sm text-foreground">&ldquo;Explain backpropagation simply&rdquo;</div>
                <div className="h-px bg-border/30"></div>
                <div className="text-xs text-muted-foreground/60">Summa AI adapted to</div>
                <span className="chip"><span className="size-1.5 rounded-full bg-green-500"></span> Undergraduate level</span>
              </div>
            </div>
          </div>
        </li>
        <li className="reveal col-span-12 lg:col-span-7">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-2xl bg-card border border-border/30 p-5 md:p-7">
            <div className="space-y-3">
              <h4 className="text-[22px] leading-[28px] font-serif font-medium text-foreground">Every session, remembered</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Your knowledge graph persists across sessions — Summa AI knows what you&apos;ve mastered and what needs review.</p>
            </div>
            <div className="dotted-bg relative isolate flex h-[170px] lg:h-[240px] w-full items-end justify-center overflow-hidden rounded-xl bg-muted/30 p-4">
              <div className="flex flex-wrap gap-2 pb-2 justify-center">
                <span className="chip"><span className="size-1.5 rounded-full bg-green-500"></span> Knowledge Graph · Calculus</span>
                <span className="chip"><span className="size-1.5 rounded-full bg-green-500"></span> Quiz · Linear Algebra</span>
                <span className="chip"><span className="size-1.5 rounded-full bg-green-500"></span> Flashcards · ML Basics</span>
              </div>
            </div>
          </div>
        </li>
        <li className="reveal col-span-12 lg:col-span-7">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-2xl bg-card border border-border/30 p-5 md:p-7">
            <div className="space-y-3">
              <h4 className="text-[22px] leading-[28px] font-serif font-medium text-foreground">Adapts to your learning style</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">No template. Summa AI calibrates to your degree, field, and goals — then teaches the way you learn best.</p>
            </div>
            <div className="dotted-bg relative isolate flex h-[240px] w-full items-center justify-center overflow-hidden rounded-xl bg-muted/30 p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="size-16 rounded-xl bg-background border border-border/30 shadow-sm flex items-center justify-center text-xs font-medium text-muted-foreground">Quiz</div>
                <div className="size-16 rounded-xl bg-background border border-border/30 shadow-sm flex items-center justify-center text-xs font-medium text-muted-foreground">Flashcard</div>
                <div className="size-16 rounded-xl bg-background border border-border/30 shadow-sm flex items-center justify-center text-xs font-medium text-muted-foreground">Plan</div>
                <div className="size-16 rounded-xl bg-background border border-border/30 shadow-sm flex items-center justify-center text-xs font-medium text-muted-foreground">Explain</div>
                <div className="size-16 rounded-xl bg-background border border-border/30 shadow-sm flex items-center justify-center text-xs font-medium text-muted-foreground">Graph</div>
                <div className="size-16 rounded-xl bg-background border border-border/30 shadow-sm flex items-center justify-center text-xs font-medium text-muted-foreground">Review</div>
              </div>
            </div>
          </div>
        </li>
        <li className="reveal col-span-12 lg:col-span-5">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-2xl bg-card border border-border/30 p-5 md:p-7">
            <div className="space-y-3">
              <h4 className="text-[22px] leading-[28px] font-serif font-medium text-foreground">Made for how you actually learn</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Made for students who need depth — undergrad to Master&apos;s level, with proactive follow-ups and gap analysis.</p>
            </div>
            <div className="dotted-bg relative isolate flex h-[240px] w-full items-center justify-center overflow-hidden rounded-xl bg-muted/30 p-4">
              <div className="flex items-end gap-3">
                <div className="w-9 rounded-t-md bg-summa-accent/30" style={{ height: '50px' }}></div>
                <div className="w-9 rounded-t-md bg-summa-accent" style={{ height: '95px' }}></div>
                <div className="w-9 rounded-t-md bg-amber-500" style={{ height: '70px' }}></div>
                <div className="w-9 rounded-t-md bg-summa-accent/60" style={{ height: '40px' }}></div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </section>
  )
}

/* ─────────────────────────────────────────────── */
/*  EXPERIENCE SHOWCASE                            */
/* ─────────────────────────────────────────────── */

function ExperienceShowcase() {
  return (
    <section id="how-it-works" className="bg-card border-y border-border/30">
      <div className="mx-auto max-w-[1216px] py-14 lg:py-28">
        <div className="reveal space-y-4 px-4 text-center mx-auto max-w-[640px]">
          <h2 className="text-[28px] leading-[34px] tracking-tight sm:text-[34px] sm:leading-[40px] lg:text-[46px] lg:leading-[52px] font-serif font-medium text-foreground">
            Learn once. Remember forever.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            A single workspace sits on top of every concept you study — and every session builds on the last.
          </p>
        </div>

        <ul className="mt-14 flex flex-col gap-y-10 px-4 lg:mt-16 lg:gap-y-20 xl:px-0">
          <li className="reveal">
            <div className="flex flex-col items-center justify-between gap-x-5 gap-y-6 md:px-10 lg:px-0 md:flex-row">
              <div className="flex w-full flex-col items-center text-center md:w-1/2 md:grow md:items-start md:text-left lg:max-w-[491px]">
                <h3 className="text-[22px] leading-[28px] sm:text-[34px] sm:leading-[40px] font-serif font-medium text-foreground">One workspace for every subject</h3>
                <p className="mt-5 text-base text-muted-foreground leading-relaxed">Stop tab-switching between notes, PDFs, and flashcards. Ask Summa AI once — it checks your entire knowledge graph at the same time.</p>
                <div className="mt-6 lg:mt-11">
                  <Button onClick={() => {}} className="rounded-[10px] px-6 py-3 text-sm font-medium h-auto">
                    Start learning now
                  </Button>
                </div>
              </div>
              <div className="w-full rounded-3xl border-t-2 border-summa-accent bg-gradient-to-b from-summa-accent/[0.06] to-background overflow-hidden px-6 sm:px-10 md:h-[300px] md:max-w-[300px] md:pt-10 lg:h-[440px] lg:max-w-[460px] lg:px-14 lg:pt-14 lg:pb-6 flex justify-center">
                <div className="mt-10 h-auto w-full md:mt-0 rounded-t-2xl bg-background shadow-2xl border border-border/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border/30 px-3 py-2">
                    <Search className="size-4 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground">Search across all subjects…</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip text-[11px]"><span className="size-1.5 rounded-full bg-green-500"></span> Calculus</span>
                    <span className="chip text-[11px]"><span className="size-1.5 rounded-full bg-green-500"></span> ML</span>
                    <span className="chip text-[11px]"><span className="size-1.5 rounded-full bg-green-500"></span> Linear Algebra</span>
                  </div>
                  <div className="h-16 rounded-lg bg-muted/30"></div>
                </div>
              </div>
            </div>
          </li>
          <li className="reveal">
            <div className="flex flex-col items-center justify-between gap-x-5 gap-y-6 md:px-10 lg:px-0 md:flex-row-reverse">
              <div className="flex w-full flex-col items-center text-center md:w-1/2 md:grow md:items-start md:text-left lg:max-w-[491px]">
                <h3 className="text-[22px] leading-[28px] sm:text-[34px] sm:leading-[40px] font-serif font-medium text-foreground">Knowledge you can trust</h3>
                <p className="mt-5 text-base text-muted-foreground leading-relaxed">Every answer is grounded in your knowledge graph, with source artifacts you can review — so you never have to take the AI&apos;s word for it.</p>
                <div className="mt-6 lg:mt-11">
                  <Button onClick={() => {}} className="rounded-[10px] px-6 py-3 text-sm font-medium h-auto">
                    Explore your knowledge
                  </Button>
                </div>
              </div>
              <div className="w-full rounded-3xl border-t-2 border-summa-accent bg-gradient-to-b from-summa-accent/[0.06] to-background overflow-hidden px-6 sm:px-10 md:h-[300px] md:max-w-[300px] md:pt-10 lg:h-[440px] lg:max-w-[460px] lg:px-14 lg:pt-14 lg:pb-6 flex justify-center">
                <div className="mt-10 h-auto w-full md:mt-0 rounded-t-2xl bg-background shadow-2xl border border-border/30 p-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">&ldquo;Backpropagation uses the chain rule to compute gradients layer by layer.&rdquo;</p>
                  <div className="h-px bg-border/30"></div>
                  <span className="chip text-[11px]"><span className="size-1.5 rounded-full bg-green-500"></span> Artifact · Flashcard Set · ML Basics</span>
                  <div className="h-10 rounded-lg bg-muted/30"></div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────── */
/*  TESTIMONIALS                                   */
/* ─────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    quote: 'Summa AI remembers everything I study and shows me what to review. Like a tutor that never sleeps.',
    name: 'Alex Chen', role: 'CS Master\'s Student', initials: 'AC',
  },
  {
    quote: 'The gap analysis alone saved me from failing my NLP final. It found prerequisites I didn\'t know I was missing.',
    name: 'Sarah Kim', role: 'Undergrad, AI Major', initials: 'SK',
  },
  {
    quote: 'This is the first study app that actually adapts to how I learn instead of forcing me into their template.',
    name: 'Marcus Johnson', role: 'Lifelong Learner', initials: 'MJ',
  },
]

function TestimonialsSection() {
  return (
    <section className="py-14 lg:py-28">
      <div className="mx-auto max-w-[1216px]">
        <div className="reveal space-y-4 px-4 text-center mx-auto max-w-[640px]">
          <h2 className="text-[28px] leading-[34px] tracking-tight sm:text-[34px] sm:leading-[40px] lg:text-[46px] lg:leading-[52px] font-serif font-medium text-foreground">
            Students who stopped searching and started learning
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            See how Summa AI changed the way students study, review, and master new subjects.
          </p>
        </div>

        <ul className="relative mt-8 grid w-full grid-cols-6 gap-3 px-4 md:mt-16">
          {[0, 1, 2, 1, 2, 0].map((i, idx) => {
            const t = TESTIMONIALS[i]
            return (
              <li key={idx} className="reveal col-span-6 flex flex-col items-start justify-between rounded-xl bg-muted/30 p-3 md:col-span-3 lg:col-span-2">
                <figure className="flex h-full flex-col gap-5 w-full">
                  <div className="flex grow flex-col gap-6 rounded-xl px-3 py-4">
                    <Quote className="size-6 text-summa-accent/20" />
                    <blockquote className="space-y-2">
                      <p className="text-lg text-foreground font-medium font-serif">&ldquo;{t.quote}&rdquo;</p>
                    </blockquote>
                  </div>
                  <figcaption className="flex items-center justify-between rounded-lg bg-background border border-border/30 px-5 py-3 w-full">
                    <div className="flex items-center gap-x-3">
                      <div className="size-11 rounded-full bg-summa-accent/10 flex items-center justify-center text-xs font-medium text-summa-accent">
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground/60">{t.role}</p>
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────── */
/*  PRICING                                        */
/* ─────────────────────────────────────────────── */

function PricingSection({ onGetStarted }: any) {
  const [yearly, setYearly] = React.useState(false)

  const plans = [
    {
      name: 'Free', price: 0, yearlyPrice: 0,
      desc: 'Try Summa AI on one subject.',
      features: ['7 artifact types', '10 conversations', 'Basic gap analysis', 'Community support'],
      disabled: ['WhatsApp export search', 'Admin controls'],
      popular: false,
    },
    {
      name: 'Pro', price: 12, yearlyPrice: 10,
      desc: 'For serious learners.',
      features: ['Everything in Free', 'Unlimited conversations', 'Advanced gap analysis', 'Exam prep engine', 'Version history', 'Priority support'],
      disabled: [],
      popular: true,
    },
    {
      name: 'Team', price: 29, yearlyPrice: 24,
      desc: 'For study groups & classrooms.',
      features: ['Everything in Pro', 'Up to 10 members', 'Shared knowledge graph', 'Progress dashboard', 'API access'],
      disabled: [],
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="mx-auto max-w-[1044px] py-14 lg:py-28">
      <div className="reveal space-y-4 px-4 text-center mx-auto max-w-[640px]">
        <h2 className="text-[28px] leading-[34px] tracking-tight sm:text-[34px] sm:leading-[40px] lg:text-[46px] lg:leading-[52px] font-serif font-medium text-foreground">
          Pricing that scales with your learning
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">Start free. Upgrade when you outgrow us.</p>
      </div>

      <div className="reveal mt-10 flex items-center justify-center gap-x-2">
        <span className="text-sm text-muted-foreground/60">Monthly</span>
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="sr-only"
            checked={yearly}
            onChange={() => setYearly(!yearly)}
            aria-label="Toggle annual billing"
          />
          <div className={`toggle-track relative h-6 w-11 rounded-xl ${yearly ? 'checked' : ''}`}>
            <div className={`toggle-knob absolute start-0.5 top-px size-5 rounded-full bg-background ${yearly ? 'checked' : ''}`}></div>
          </div>
        </label>
        <span className="text-sm text-foreground">Annually</span>
        <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">-20%</span>
      </div>

      <ul className="mt-10 grid w-full list-none grid-cols-1 gap-6 px-4 md:mt-16 lg:grid-cols-3 xl:px-0">
        {plans.map((plan, i) => {
          const price = yearly ? plan.yearlyPrice : plan.price
          return (
            <li key={plan.name} className="reveal">
              <div className={`rounded-[20px] border-4 border-background p-2 pb-5 bg-background ${plan.popular ? 'relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 rounded-full bg-summa-accent px-4 py-1 text-[11px] font-semibold text-white shadow-lg">
                    Most popular
                  </div>
                )}
                <div className={`relative isolate flex flex-col rounded-xl h-full ${plan.popular ? 'bg-foreground text-background dotted-bg' : 'bg-muted/30'}`}>
                  <div className="flex min-h-[152px] flex-col justify-between gap-6 rounded-xl p-4 md:px-3">
                    <h4 className={`text-lg font-medium ${plan.popular ? 'text-background' : 'text-foreground'}`}>{plan.name}</h4>
                    <div>
                      <h3 className={`text-[32px] leading-[38px] sm:text-[40px] sm:leading-[44px] font-medium ${plan.popular ? 'text-background' : 'text-foreground'}`}>
                        ${price}<span className={`text-base font-normal ${plan.popular ? 'text-background/60' : 'text-muted-foreground'}`}>{yearly ? '/year' : '/month'}</span>
                      </h3>
                      <p className={`mt-2 text-sm ${plan.popular ? 'text-background/60' : 'text-muted-foreground'}`}>{plan.desc}</p>
                    </div>
                  </div>
                  <div className="mt-5 px-3 pb-1">
                    <Button
                      onClick={onGetStarted}
                      className={`w-full rounded-[10px] px-4 py-2.5 text-sm font-medium h-auto ${
                        plan.popular
                          ? 'bg-background text-foreground hover:bg-background/90'
                          : 'bg-foreground text-background hover:bg-foreground/90'
                      }`}
                    >
                      {plan.name === 'Free' ? 'Get started' : plan.name === 'Team' ? 'Contact sales' : 'Start free trial'}
                    </Button>
                  </div>
                  <ul className="mt-10 list-none space-y-4 px-3 pb-5">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.popular ? 'text-background/90' : 'text-muted-foreground'}`}>
                        <CheckCircle2 className="size-[18px] shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                    {plan.disabled.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/40">
                        <X className="size-[18px] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ─────────────────────────────────────────────── */
/*  FAQ                                            */
/* ─────────────────────────────────────────────── */

const FAQS = [
  { q: 'How is Summa AI different from ChatGPT?', a: 'Summa AI is purpose-built for learning — it remembers your knowledge graph, tracks gaps across sessions, and generates persistent artifacts (quizzes, flashcards, plans) instead of one-off chat messages.' },
  { q: 'Do I need to install anything?', a: 'No. Summa AI runs entirely in your browser. Just sign in and start learning.' },
  { q: 'Is my data private?', a: 'Yes. Your learning data is encrypted and never used to train models. You can delete your data at any time.' },
  { q: 'Can I use Summa AI for multiple subjects?', a: 'Absolutely. Summa AI maintains separate knowledge graphs per subject and can switch contexts seamlessly.' },
  { q: 'What if I already have a SummaStudy account?', a: 'You can sign in with the same credentials — Summa AI and SummaStudy share one account. Your library content will carry over with a Library badge.' },
]

function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  return (
    <section id="faq" className="py-14 lg:py-28">
      <div className="reveal space-y-4 px-4 text-center mx-auto max-w-[640px]">
        <h2 className="text-[28px] leading-[34px] tracking-tight sm:text-[34px] sm:leading-[40px] lg:text-[46px] lg:leading-[52px] font-serif font-medium text-foreground">Frequently asked questions</h2>
        <p className="text-base text-muted-foreground leading-relaxed">Everything learners ask before getting started.</p>
      </div>

      <ul className="reveal mx-auto mt-10 max-w-[660px] space-y-5 px-4 lg:mt-16 xl:px-0">
        {FAQS.map((faq, i) => (
          <li key={i} className="rounded-xl bg-card border border-border/30 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="group flex w-full cursor-pointer items-center justify-between px-5 py-6 text-start text-base font-medium text-foreground"
              aria-expanded={openIndex === i}
            >
              <span>{faq.q}</span>
              <ChevronRight
                className={cn(
                  'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
                  openIndex === i && 'rotate-90 text-summa-accent',
                )}
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: openIndex === i ? '400px' : '0px',
                opacity: openIndex === i ? 1 : 0,
              }}
            >
              <div className="mb-2 rounded-xl bg-muted/30 px-5 py-6 text-muted-foreground leading-relaxed text-sm">
                {faq.a}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ─────────────────────────────────────────────── */
/*  CTA                                            */
/* ─────────────────────────────────────────────── */

function CTASection({ onGetStarted }: any) {
  return (
    <section className="bg-card px-4 py-14 lg:py-28 border-t border-border/30">
      <div className="reveal relative isolate mx-auto flex max-w-[1216px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-summa-accent/[0.06] to-summa-accent/[0.02] border border-summa-accent/10 py-14 lg:h-[420px]">
        <div className="absolute inset-0 opacity-70" style={{
          backgroundImage: 'radial-gradient(circle at 12% 20%, rgba(255,255,255,.9), transparent 40%), radial-gradient(circle at 90% 80%, rgba(14,116,144,.08), transparent 40%)'
        }} />
        <div className="relative flex w-full flex-col items-center justify-center px-4 text-center lg:max-w-[780px]">
          <h2 className="text-[28px] leading-[34px] tracking-tight sm:text-[34px] sm:leading-[40px] lg:text-[46px] lg:leading-[52px] font-serif font-medium text-foreground">
            Stop forgetting. Start learning.
          </h2>
          <p className="mt-3 max-w-[480px] text-sm text-muted-foreground leading-relaxed lg:mt-4 lg:text-base">
            Start learning in under 2 minutes. No migration, no re-tagging, no new habits to learn.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:mt-10">
            <Button
              onClick={onGetStarted}
              className="rounded-[10px] px-6 py-3 text-sm font-medium h-auto"
            >
              Try Summa AI free
            </Button>
            <button className="rounded-[10px] border border-border/60 bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-summa-accent/30 hover:bg-summa-accent/5">
              Book a demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────── */
/*  FOOTER                                         */
/* ─────────────────────────────────────────────── */

function Footer() {
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1440px] pt-14 pb-10 md:px-4 lg:pt-20 xl:px-28">
        <div className="mx-auto flex w-full flex-col flex-wrap justify-between gap-10 md:flex-row md:flex-nowrap md:items-start px-4 xl:px-0">
          <div className="flex max-w-[400px] flex-col items-start justify-between px-0 text-left sm:w-[400px] md:w-[220px] lg:w-[340px] xl:px-0">
            <a href="#hero" className="flex items-center gap-2">
              <div className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-summa-accent to-summa-accent/80 text-white shadow-lg">
                <Sparkles className="size-4" />
              </div>
              <span className="font-serif text-[20px] font-bold">Summa<span className="text-summa-accent">AI</span></span>
            </a>
            <p className="mt-4 text-sm text-background/60 leading-relaxed">The learning companion that never forgets.</p>
            <div className="mt-5 space-x-2">
              <a href="#" className="inline-flex items-center justify-center size-9 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
                <svg className="size-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.3 1.7-2.3-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.3-3.1-1.3-2.3 0-4.2 1.9-4.2 4.2 0 .3 0 .6.1.9C8.3 9 5.6 7.5 3.7 5.1c-.3.6-.5 1.2-.5 1.9 0 1.5.8 2.8 1.9 3.5-.7 0-1.4-.2-1.9-.5 0 2 1.5 3.7 3.4 4.1-.4.1-.8.2-1.2.2-.3 0-.6 0-.8-.1.6 1.7 2.1 3 4 3-1.5 1.1-3.3 1.8-5.3 1.8-.3 0-.7 0-1-.1C4.2 20.3 6.5 21 9 21c8 0 12.4-6.7 12.4-12.5v-.6c.9-.6 1.6-1.3 2.1-2.1z"/></svg>
              </a>
              <a href="#" className="inline-flex items-center justify-center size-9 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
                <svg className="size-[18px]" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4.2" r="2.2"/><path d="M9.5 9h4v1.8c.7-1.2 2-2 3.7-2 3 0 4.8 1.9 4.8 5.6V21h-4v-6.1c0-1.6-.6-2.7-2-2.7-1.1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1V21h-4V9z"/></svg>
              </a>
            </div>
          </div>

          <div className="w-36 space-y-5 md:w-[110px] lg:w-28">
            <h5 className="text-sm font-medium">Product</h5>
            {['Features', 'How it works', 'Pricing'].map((link) => (
              <li key={link} className="list-none">
                <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-background/60 hover:text-background transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </div>

          <div className="w-36 space-y-5 md:w-[110px] lg:w-28">
            <h5 className="text-sm font-medium">Company</h5>
            {['About', 'Blog'].map((link) => (
              <li key={link} className="list-none">
                <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">{link}</a>
              </li>
            ))}
            <li className="list-none"><a href="#faq" className="text-sm text-background/60 hover:text-background transition-colors">FAQs</a></li>
            <li className="list-none"><a href="#" className="text-sm text-background/60 hover:text-background transition-colors">Contact</a></li>
          </div>

          <div className="w-full space-y-5 md:w-[220px] lg:w-[300px]">
            <h5 className="text-sm font-medium">Start your learning journey</h5>
            <p className="text-sm text-background/60 leading-relaxed">Pick a subject, any subject — and see what persistent learning feels like.</p>
            <Button className="rounded-[10px] px-5 py-2.5 text-sm font-medium h-auto">Try Summa AI free</Button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-6 md:flex-row px-4 xl:px-0">
          <p className="text-sm text-background/50">&copy; {new Date().getFullYear()} Summa AI. All rights reserved.</p>
          <div className="space-x-2">
            <a href="#" className="text-sm text-background/50 hover:text-background transition-colors">Terms</a>
            <span className="text-background/20">·</span>
            <a href="#" className="text-sm text-background/50 hover:text-background transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
