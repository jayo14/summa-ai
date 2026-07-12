'use client'

import * as React from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Sparkles, Brain, Layers, Target, Network, Calendar, AlertTriangle,
  ArrowRight, ChevronDown, Play, CheckCircle2, GitBranch, Hexagon as HexagonIcon,
  Sun, Moon, BookOpen, Zap, BarChart3, Shield, MessageSquare,
  ChevronRight, Menu, X, Users, Clock, Trophy,
} from 'lucide-react'
import { FocusRing } from '@/components/focus-ring'

export interface LandingPageProps {
  onGetStarted: () => void
  isDark: boolean
  onToggleTheme: () => void
}

/* ──────────────────────────────────────────────── */
/*  Main                                            */
/* ──────────────────────────────────────────────── */

export function LandingPage({ onGetStarted, isDark, onToggleTheme }: LandingPageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const [mobileMenu, setMobileMenu] = React.useState(false)

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden bg-background">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-0.5 origin-left bg-summa-accent"
        style={{ scaleX }}
      />
      <NavBar
        onGetStarted={onGetStarted}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />
      <HeroSection onGetStarted={onGetStarted} scrollYProgress={scrollYProgress} />
      <LogoCloud />
      <StatsBar />
      <HowItWorks />
      <FeaturesBento />
      <Testimonials />
      <PricingSection onGetStarted={onGetStarted} />
      <FAQSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden"
          >
            <div className="flex h-full flex-col items-center justify-center gap-8">
              {['Features', 'How it works', 'Pricing', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileMenu(false)}
                  className="text-2xl font-medium transition-colors hover:text-foreground/70"
                >
                  {item}
                </a>
              ))}
              <Button onClick={onGetStarted} className="mt-4 rounded-full px-8">
                Get started free <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────────────────────────────────────── */
/*  NAV                                             */
/* ──────────────────────────────────────────────── */

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
          ? 'bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="inline-flex size-9 items-center justify-center rounded-xl bg-summa-accent text-summa-accent-foreground transition-transform group-hover:scale-105">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">Summa AI</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {['Features', 'How it works', 'Pricing', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-muted-foreground transition-all hover:text-summa-accent relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-summa-accent after:transition-all hover:after:w-full"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary/70 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Button
            onClick={onGetStarted}
            className="hidden rounded-full sm:inline-flex h-9 px-5 text-sm font-medium shadow-sm"
          >
            Get started free
          </Button>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary/70 transition-colors md:hidden"
            aria-label="Menu"
          >
            {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

/* ──────────────────────────────────────────────── */
/*  HERO                                            */
/* ──────────────────────────────────────────────── */

function HeroSection({ onGetStarted, scrollYProgress }: any) {
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden pt-24">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 120, 0], y: [0, -60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-48 -left-48 size-[600px] rounded-full bg-foreground/[0.03] blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-48 -right-48 size-[700px] rounded-full bg-foreground/[0.02] blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.015] blur-[120px]"
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-secondary/40 px-5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
        >
          <FocusRing value={100} size="sm" state="complete" aria-label="Ready">
            <span className="text-[8px] font-bold tabular-nums text-foreground">AI</span>
          </FocusRing>
          <span>The AI-native learning workspace</span>
          <span className="hidden sm:inline">· Now in public beta</span>
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
          <span className="bg-gradient-to-r from-foreground via-foreground/70 to-foreground/40 bg-clip-text text-transparent">
            that never forgets
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-8 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed"
        >
          Summa AI is an adaptive learning workspace that remembers what you know, tracks your gaps,
          and generates quizzes, flashcards, and study plans — all in one persistent environment.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="h-13 rounded-full px-8 text-base font-medium shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Start learning free
            <ArrowRight className="ml-1.5 size-4" />
          </Button>
          <button className="inline-flex h-13 items-center gap-2.5 rounded-full border border-border/60 px-6 text-sm font-medium transition-all hover:bg-secondary/50 hover:border-summa-accent/20">
            <Play className="size-4" />
            Watch demo
            <span className="hidden sm:inline text-muted-foreground">· 2 min</span>
          </button>
        </motion.div>

        {/* Floating widget preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 mx-auto max-w-3xl"
        >
          <div className="relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-1 shadow-xl">
            <div className="rounded-xl border border-border/30 bg-card/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="size-2 rounded-full bg-red-400/70" />
                    <div className="size-2 rounded-full bg-yellow-400/70" />
                    <div className="size-2 rounded-full bg-green-400/70" />
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground">
                    <Sparkles className="mr-1 inline size-3" />
                    Summa AI Workspace
                  </span>
                </div>
                <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/30">
                  v2
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.2fr]">
                <div className="space-y-2">
                  {[
                    { role: 'user', text: 'Quiz me on Transformers' },
                    { role: 'ai', text: "I've generated a quiz. Open in workspace →" },
                  ].map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.3 }}
                      className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs',
                          msg.role === 'user'
                            ? 'rounded-tr-md bg-summa-accent text-summa-accent-foreground'
                            : 'rounded-tl-md bg-secondary/80',
                        )}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="rounded-xl border border-border/30 bg-secondary/20 p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                    <Brain className="size-3.5" />
                    Quiz: Transformers
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">What does attention compute?</p>
                  <div className="space-y-1.5">
                    {['A weighted sum of values', 'A simple average', 'A fixed dot product'].map((opt, i) => (
                      <div
                        key={opt}
                        className={cn(
                          'flex items-center justify-between rounded-lg border px-3 py-1.5 text-[11px]',
                          i === 0 ? 'border-summa-accent/20 bg-summa-accent/5' : 'border-border/40',
                        )}
                      >
                        {opt}
                        {i === 0 && <CheckCircle2 className="size-3 text-foreground/60" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1.5 text-muted-foreground"
          >
            <span className="text-[10px] font-medium uppercase tracking-widest">Scroll</span>
            <ChevronDown className="size-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ──────────────────────────────────────────────── */
/*  LOGO CLOUD                                      */
/* ──────────────────────────────────────────────── */

function LogoCloud() {
  const logos = [
    { name: 'Adaptive', icon: <Brain className="size-5" /> },
    { name: 'Persistent', icon: <span className="text-lg font-bold">∞</span> },
    { name: 'Smart', icon: <Zap className="size-5" /> },
    { name: 'Secure', icon: <Shield className="size-5" /> },
    { name: 'Personalized', icon: <Target className="size-5" /> },
  ]

  return (
    <section className="py-16 border-y border-border/40 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="mb-8 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Built for learners who demand more
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2 text-muted-foreground/60"
            >
              {logo.icon}
              <span className="text-sm font-medium">{logo.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────── */
/*  STATS                                           */
/* ──────────────────────────────────────────────── */

function StatsBar() {
  const stats = [
    { value: '7+', label: 'Artifact types', icon: <Layers className="size-4" /> },
    { value: '6', label: 'Proficiency dims', icon: <HexagonIcon className="size-4" /> },
    { value: '∞', label: 'Memory capacity', icon: <span className="text-base font-bold">∞</span> },
    { value: '0', label: 'Setup cost', icon: <Target className="size-4" /> },
  ]

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 text-center transition-all hover:border-summa-accent/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-summa-accent/10 text-summa-accent">
                  {s.icon}
                </div>
                <div
                  className="text-4xl tracking-tight sm:text-5xl"
                  style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
                >
                  {s.value}
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────── */
/*  HOW IT WORKS                                    */
/* ──────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Tell us about you',
      desc: 'Share your degree, field, goals, and learning style. Takes 2 minutes.',
      icon: <MessageSquare className="size-5" />,
    },
    {
      number: '02',
      title: 'Learn naturally',
      desc: 'Ask questions, get quizzes, flashcards, and study plans — all versioned and saved.',
      icon: <Brain className="size-5" />,
    },
    {
      number: '03',
      title: 'Grow persistently',
      desc: 'Summa AI tracks your knowledge, fills gaps, and follows up proactively.',
      icon: <Trophy className="size-5" />,
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-secondary/10">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <h2
            className="text-4xl tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
          >
            Three steps to learn smarter
          </h2>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute top-12 left-[15%] right-[15%] hidden h-px bg-gradient-to-r from-foreground/10 via-foreground/30 to-foreground/10 md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative mb-6 inline-flex size-20 items-center justify-center rounded-2xl bg-summa-accent text-summa-accent-foreground shadow-lg">
                {step.icon}
                <div className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground border border-border/50 shadow-sm">
                  {i + 1}
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

/* ──────────────────────────────────────────────── */
/*  FEATURES — BENTO GRID                           */
/* ──────────────────────────────────────────────── */

interface FeatureData {
  id: string
  icon: React.ReactNode
  title: string
  desc: string
  color: string
  illustration: React.ReactNode
  span?: 'wide' | 'tall' | 'both'
}

function FeaturesBento() {
  const features: FeatureData[] = [
    {
      id: 'adaptive',
      icon: <Brain className="size-5" />,
      title: 'Adaptive Tutoring',
      desc: 'Explains at your level — undergrad to Master\'s. Remembers what you know.',
      color: 'from-blue-500/10 to-purple-500/10',
      illustration: <AdaptiveIllust />,
      span: 'tall',
    },
    {
      id: 'artifacts',
      icon: <Layers className="size-5" />,
      title: 'Artifact System',
      desc: 'Quizzes, flashcards, plans — each is a first-class, versioned entity.',
      color: 'from-emerald-500/10 to-teal-500/10',
      illustration: <ArtifactIllust />,
    },
    {
      id: 'exam',
      icon: <Target className="size-5" />,
      title: 'Exam Prep Engine',
      desc: 'Upload your timetable, get a personalized study roadmap that adjusts dynamically.',
      color: 'from-amber-500/10 to-orange-500/10',
      illustration: <ExamIllust />,
      span: 'wide',
    },
    {
      id: 'hexagon',
      icon: <HexagonIcon className="size-5" />,
      title: 'Proficiency Hexagon',
      desc: 'Six dimensions: Depth, Problem-Solving, Speed, Consistency, Confidence, Creativity.',
      color: 'from-rose-500/10 to-pink-500/10',
      illustration: <HexagonIllust />,
    },
    {
      id: 'graph',
      icon: <Network className="size-5" />,
      title: 'Knowledge Graph',
      desc: 'See prerequisites, gaps, and mastery in one interactive graph.',
      color: 'from-cyan-500/10 to-sky-500/10',
      illustration: <GraphIllust />,
    },
    {
      id: 'version',
      icon: <GitBranch className="size-5" />,
      title: 'Version History',
      desc: 'Every modification creates a new version. Never lose work. Restore anytime.',
      color: 'from-violet-500/10 to-purple-500/10',
      illustration: <VersionIllust />,
    },
    {
      id: 'memory',
      icon: <Calendar className="size-5" />,
      title: 'Proactive Memory',
      desc: 'Remembers your exams, follows up, and reminds you without prompting.',
      color: 'from-indigo-500/10 to-blue-500/10',
      illustration: <MemoryIllust />,
    },
    {
      id: 'gap',
      icon: <AlertTriangle className="size-5" />,
      title: 'Gap Analysis',
      desc: 'Finds what you don\'t know before you realize it. Color-coded by priority.',
      color: 'from-red-500/10 to-rose-500/10',
      illustration: <GapIllust />,
    },
  ]

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <h2
            className="text-4xl tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
          >
            Everything you need to learn smarter
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            From adaptive tutoring to proactive memory — Summa AI is the first workspace built
            around how learning actually works.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const spanClasses = f.span === 'tall' ? 'sm:row-span-2' : f.span === 'wide' ? 'sm:col-span-2' : f.span === 'both' ? 'sm:col-span-2 sm:row-span-2' : ''
            return (
              <FeatureCard
                key={f.id}
                feature={f}
                index={i}
                className={spanClasses}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  index,
  className,
}: {
  feature: FeatureData
  index: number
  className?: string
}) {
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
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-6 transition-all duration-300',
        'hover:border-summa-accent/20 hover:shadow-xl hover:-translate-y-0.5',
        feature.span === 'tall' ? 'flex flex-col' : '',
        className,
      )}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
          feature.color,
          hovered && 'opacity-100',
        )}
      />
      <div className="relative z-10">
        <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-summa-accent/10 text-summa-accent ring-1 ring-summa-accent/10 group-hover:bg-summa-accent/15 group-hover:ring-summa-accent/20 transition-all">
          {feature.icon}
        </div>
        <h3 className="text-base font-semibold mb-1.5">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feature.desc}</p>
      </div>
      <div className={cn('relative z-10 mt-auto', feature.span === 'tall' ? 'flex-1 flex items-end' : '')}>
        <div className="w-full rounded-xl bg-secondary/20 border border-border/30 overflow-hidden p-3 transition-all group-hover:border-summa-accent/15 group-hover:bg-secondary/30">
          {feature.illustration}
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────── */
/*  ILLUSTRATIONS (cleaned up)                      */
/* ──────────────────────────────────────────────── */

function AdaptiveIllust() {
  return (
    <div className="flex flex-col gap-2">
      {[
        { me: true, t: 'Explain transformers at my level' },
        { me: false, meta: "Master's CS", t: 'Self-attention weighs each token...' },
        { me: true, t: 'Make it simpler' },
        { me: false, meta: 'Visual learner', t: 'Think attention = spotlight...' },
      ].map((m, i) => (
        <div
          key={i}
          className={cn('flex max-w-[85%] gap-1.5', m.me && 'self-end flex-row-reverse')}
        >
          {!m.me && (
            <div className="size-5 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center mt-0.5">
              <Sparkles className="size-2.5" />
            </div>
          )}
          <div
            className={cn(
              'rounded-xl px-3 py-1.5 text-[11px] leading-relaxed',
              m.me ? 'rounded-tr-sm bg-summa-accent text-summa-accent-foreground' : 'rounded-tl-sm bg-secondary',
            )}
          >
            {m.meta && (
              <span className="block text-[9px] text-muted-foreground mb-0.5">{m.meta}</span>
            )}
            {m.t}
          </div>
        </div>
      ))}
    </div>
  )
}

function ArtifactIllust() {
  const cards = [
    { l: 'Quiz', i: <Brain className="size-2.5" />, c: 'bg-summa-accent text-summa-accent-foreground' },
    { l: 'Cards', i: <Layers className="size-2.5" />, c: 'bg-secondary text-foreground' },
    { l: 'Plan', i: <Target className="size-2.5" />, c: 'bg-secondary text-foreground' },
  ]
  return (
    <div className="relative flex items-center justify-center h-24">
      {cards.map((card, i) => (
        <motion.div
          key={card.l}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
          style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : -60 }}
          className={cn('w-36 rounded-xl border p-3 shadow-md', card.c)}
        >
          <div className="flex items-center gap-1.5 mb-2">
            {card.i}
            <span className="text-[10px] font-medium">{card.l}</span>
          </div>
          <div className="space-y-1">
            {[60, 40, 50].map((w, j) => (
              <div
                key={j}
                className="h-1 rounded-full bg-current opacity-15"
                style={{ width: `${w - i * 5}%` }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ExamIllust() {
  const weeks = ['Embeddings', 'RNNs', 'Attention', 'Transformers', 'Practice', 'Review']
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
        <Calendar className="size-3" /> NLP Final — Dec 15
      </div>
      <div className="flex gap-2 justify-center">
        {weeks.map((w, i) => (
          <div key={w} className="flex flex-col items-center gap-0.5">
            <FocusRing value={[100, 85, 70, 60, 45, 30][i]} size="sm" state={i < 3 ? 'complete' : 'active'} aria-label={w}>
              <span className="text-[7px] font-bold tabular-nums text-foreground">W{i + 1}</span>
            </FocusRing>
          </div>
        ))}
      </div>
    </div>
  )
}

function HexagonIllust() {
  const dims = [
    { l: 'Depth', a: -90, s: 78 },
    { l: 'Problem', a: -30, s: 65 },
    { l: 'Speed', a: 30, s: 42 },
    { l: 'Consist', a: 90, s: 80 },
    { l: 'Confidence', a: 150, s: 55 },
    { l: 'Creative', a: 210, s: 70 },
  ]
  const cx = 80, cy = 70, R = 50
  const pts = dims
    .map((d) => {
      const r = (d.s / 100) * R
      const a = (d.a * Math.PI) / 180
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    })
    .join(' ')
  return (
    <svg width="160" height="140" className="overflow-visible mx-auto">
      {[0.5, 1].map((s, i) => (
        <polygon
          key={i}
          points={dims
            .map((d) => {
              const r = s * R
              const a = (d.a * Math.PI) / 180
              return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
            })
            .join(' ')}
          fill="none"
          stroke="var(--border)"
          strokeWidth="0.8"
          strokeDasharray={s === 1 ? undefined : '2 3'}
        />
      ))}
      <polygon
        points={pts}
        fill="var(--foreground)"
        fillOpacity="0.1"
        stroke="var(--foreground)"
        strokeWidth="1.5"
      />
      {dims.map((d, i) => {
        const r = (d.s / 100) * R
        const a = (d.a * Math.PI) / 180
        return (
          <circle
            key={i}
            cx={cx + r * Math.cos(a)}
            cy={cy + r * Math.sin(a)}
            r="2"
            fill="var(--foreground)"
          />
        )
      })}
    </svg>
  )
}

function GraphIllust() {
  return (
    <div className="flex items-center justify-center h-28">
      <svg width="200" height="110" className="overflow-visible">
        {[
          [0, 2], [1, 2], [2, 4], [3, 4], [4, 5],
        ].map((e, i) => {
          const a = nodes[e[0]], b = nodes[e[1]]
          return (
            <line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="var(--border)" strokeWidth="1" strokeDasharray={e[1] === 5 ? '3 2' : undefined}
            />
          )
        })}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="10" fill={n.m} fillOpacity="0.12" stroke={n.m} strokeWidth="1" />
            <text x={n.x} y={n.y + 20} textAnchor="middle" className="fill-muted-foreground text-[7px] font-medium">{n.l}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
const nodes = [
  { l: 'Lin. Alg', x: 30, y: 30, m: '#0E0F11' },
  { l: 'Prob', x: 30, y: 80, m: '#0E0F11' },
  { l: 'Embed', x: 90, y: 45, m: '#737882' },
  { l: 'RNN', x: 90, y: 90, m: '#737882' },
  { l: 'Attn', x: 150, y: 30, m: '#C59F91' },
  { l: 'TF', x: 150, y: 80, m: '#CCCCCC' },
]

function VersionIllust() {
  const vs = [
    { v: 'v3', n: 'Harder questions', a: true },
    { v: 'v2', n: 'Made it harder', a: false },
    { v: 'v1', n: 'Initial gen', a: false },
  ]
  return (
    <div className="space-y-1.5">
      {vs.map((ver, i) => (
        <div
          key={ver.v}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-2.5 py-1.5',
            ver.a ? 'border-summa-accent/15 bg-summa-accent/5' : 'border-border/40 bg-secondary/20',
          )}
        >
          <div
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-medium',
              ver.a ? 'bg-summa-accent text-summa-accent-foreground' : 'bg-secondary text-muted-foreground',
            )}
          >
            {ver.v}
          </div>
          <span className={cn('text-[11px]', ver.a ? 'font-medium' : 'text-muted-foreground')}>
            {ver.n}
          </span>
          {ver.a && (
            <span className="ml-auto rounded-full bg-foreground/10 px-1.5 py-0.5 text-[8px]">
              Current
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function MemoryIllust() {
  const notifs = [
    { e: '📚', t: 'NLP final in 14 days. Ready?' },
    { e: '✅', t: 'How did Calculus quiz go?' },
    { e: '💡', t: "Haven't reviewed Attention in 3d." },
  ]
  return (
    <div className="space-y-1.5">
      {notifs.map((n, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-border/40 bg-card/50 p-2">
          <div className="text-xs">{n.e}</div>
          <p className="text-[10px] text-muted-foreground flex-1">{n.t}</p>
          <div className="size-1.5 rounded-full bg-foreground/30 mt-1" />
        </div>
      ))}
    </div>
  )
}

function GapIllust() {
  const gaps = [
    { t: 'Attention Mechanism', p: 'High', w: '90%' },
    { t: 'Matrix Mult', p: 'Medium', w: '60%' },
    { t: 'Positional Enc', p: 'Low', w: '30%' },
  ]
  return (
    <div className="space-y-2">
      {gaps.map((g, i) => (
        <div key={g.t} className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="font-medium truncate">{g.t}</span>
              <span className="text-muted-foreground shrink-0">{g.p}</span>
            </div>
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  i === 0 ? 'bg-summa-accent' : 'bg-muted-foreground/40',
                )}
                style={{ width: g.w }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────── */
/*  TESTIMONIALS                                    */
/* ──────────────────────────────────────────────── */

function Testimonials() {
  const testimonials = [
    {
      quote: "Summa AI remembers what I've studied and surfaces exactly what I need to review. It's like having a tutor who never sleeps.",
      name: 'Alex Chen',
      role: 'CS Master\'s Student',
      stars: 5,
    },
    {
      quote: 'The gap analysis alone saved me from failing my NLP final. It found prerequisites I didn\'t know I was missing.',
      name: 'Sarah Kim',
      role: 'Undergrad, AI Major',
      stars: 5,
    },
    {
      quote: 'I\'ve tried every study app. This is the first one that actually adapts to how I learn instead of forcing me into their template.',
      name: 'Marcus Johnson',
      role: 'Lifelong Learner',
      stars: 5,
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-secondary/10">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Testimonials
          </p>
          <h2
            className="text-4xl tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
          >
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
              className="group relative rounded-2xl border border-border/50 bg-card/40 p-6 transition-all hover:border-summa-accent/20 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <svg key={j} className="size-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-semibold">
                  {t.name.split(' ').map((n) => n[0]).join('')}
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

/* ──────────────────────────────────────────────── */
/*  PRICING                                         */
/* ──────────────────────────────────────────────── */

function PricingSection({ onGetStarted }: any) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Get started with core features',
      features: ['7 artifact types', '10 conversations', 'Basic gap analysis', 'Community support'],
      cta: 'Get started free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$12',
      desc: 'For serious learners',
      features: ['Unlimited conversations', 'Advanced gap analysis', 'Exam prep engine', 'Version history', 'Priority support'],
      cta: 'Start free trial',
      popular: true,
    },
    {
      name: 'Team',
      price: '$29',
      desc: 'For study groups & classrooms',
      features: ['Everything in Pro', 'Up to 10 members', 'Shared knowledge graph', 'Progress dashboard', 'API access'],
      cta: 'Contact sales',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Pricing
          </p>
          <h2
            className="text-4xl tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Start free. Upgrade when you outgrow us.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 mx-auto max-w-5xl">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'relative rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl',
                plan.popular
                  ? 'border-summa-accent/30 bg-card shadow-lg'
                  : 'border-border/50 bg-card/50',
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-summa-accent px-4 py-0.5 text-[10px] font-medium text-summa-accent-foreground">
                  Most popular
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </div>
              <div className="mb-5">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">/mo</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-foreground/60 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={onGetStarted}
                variant={plan.popular ? 'default' : 'outline'}
                className="w-full rounded-full"
              >
                {plan.cta}
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────── */
/*  FAQ                                             */
/* ──────────────────────────────────────────────── */

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
    <section id="faq" className="py-20 md:py-28 bg-secondary/10">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">FAQ</p>
          <h2
            className="text-4xl tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
          >
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
              className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden transition-all hover:border-summa-accent/15"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium">{faq.q}</span>
                <ChevronRight
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                    openIndex === i && 'rotate-90',
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

/* ──────────────────────────────────────────────── */
/*  CTA                                             */
/* ──────────────────────────────────────────────── */

function CTASection({ onGetStarted }: any) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-summa-accent" />
      <div className="absolute inset-0 bg-gradient-to-tr from-summa-accent via-summa-accent/95 to-summa-accent/90" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)',
      }} />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <FocusRing
            size="lg"
            state="active"
            value={65}
            aria-label="Join now"
            className="mx-auto mb-8"
          >
            <Sparkles className="size-6 text-background" />
          </FocusRing>
          <h2
            className="text-4xl tracking-tight text-background sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
          >
            Start your learning journey
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-background/60">
            Join Summa AI and experience an AI-native learning workspace that grows with you.
          </p>
          <div className="mt-10">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="h-13 rounded-full bg-background px-8 text-base font-medium text-foreground shadow-xl hover:bg-background/90 hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started free
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </div>
          <p className="mt-6 text-sm text-background/40">
            No credit card required · Free forever plan
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────── */
/*  FOOTER                                          */
/* ──────────────────────────────────────────────── */

function Footer() {
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex size-8 items-center justify-center rounded-lg bg-summa-accent text-summa-accent-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span className="text-sm font-bold">Summa AI</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-summa-accent"
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Built for learners everywhere
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border/30 text-center text-[11px] text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Summa AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
