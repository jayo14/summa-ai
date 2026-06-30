'use client'

import * as React from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Sparkles, Brain, Layers, Target, Network, Calendar, AlertTriangle,
  ArrowRight, ChevronDown, Play, CheckCircle2, GitBranch, Hexagon as HexagonIcon,
} from 'lucide-react'

export interface LandingPageProps {
  onGetStarted: () => void
  isDark: boolean
  onToggleTheme: () => void
}

export function LandingPage({ onGetStarted, isDark, onToggleTheme }: LandingPageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <div ref={containerRef} className="relative min-h-dvh overflow-hidden bg-background">
      <motion.div className="fixed top-0 left-0 right-0 z-50 h-0.5 origin-left bg-foreground" style={{ scaleX }} />
      <NavBar onGetStarted={onGetStarted} isDark={isDark} onToggleTheme={onToggleTheme} />
      <HeroSection onGetStarted={onGetStarted} heroY={heroY} heroOpacity={heroOpacity} />
      <StatsBar />
      <WorkspacePreview />
      <FeaturesParallax />
      <QuoteSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  )
}

/* ===== NAV ===== */
function NavBar({ onGetStarted, isDark, onToggleTheme }: any) {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
      className={cn('fixed top-0 left-0 right-0 z-40 transition-all duration-300', scrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border' : 'bg-transparent')}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex size-8 items-center justify-center rounded-lg bg-foreground text-background"><Sparkles className="size-4" /></div>
          <span className="text-lg font-semibold tracking-tight">Summa AI</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#workspace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Workspace</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleTheme} className="rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors">{isDark ? '☀️' : '🌙'}</button>
          <Button onClick={onGetStarted} className="rounded-full h-9 px-5 text-sm font-medium">Get Started</Button>
        </div>
      </div>
    </motion.nav>
  )
}

/* ===== HERO ===== */
function HeroSection({ onGetStarted, heroY, heroOpacity }: any) {
  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ x: [0, 100, 0], y: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-40 -left-40 size-[500px] rounded-full bg-foreground/[0.03] blur-[100px]" />
        <motion.div animate={{ x: [0, -80, 0], y: [0, 60, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-40 -right-40 size-[600px] rounded-full bg-foreground/[0.02] blur-[120px]" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)' }} />
      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="relative flex size-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-30" /><span className="relative inline-flex size-2 rounded-full bg-foreground" /></span>
          The AI-native learning workspace
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-5xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontWeight: 400 }}>
          The learning companion<br />that <span className="italic text-muted-foreground">never forgets</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Summa AI is an adaptive learning workspace that remembers your knowledge, tracks your gaps, and generates quizzes, flashcards, and study plans — all in one persistent, evolving environment.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button onClick={onGetStarted} className="h-12 rounded-full px-8 text-base font-medium">Start learning free<ArrowRight className="ml-1 size-4" /></Button>
          <button className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-base font-medium transition-colors hover:bg-secondary"><Play className="size-4" />Watch demo</button>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-20 flex justify-center">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-muted-foreground"><ChevronDown className="size-5" /></motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ===== STATS ===== */
function StatsBar() {
  const stats = [{ value: '7+', label: 'Artifact types' }, { value: '6', label: 'Proficiency dimensions' }, { value: '∞', label: 'Memory capacity' }, { value: '0', label: 'Setup cost' }]
  return (
    <section className="border-y border-border bg-secondary/30 py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>{s.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===== WORKSPACE PREVIEW ===== */
function WorkspacePreview() {
  return (
    <section id="workspace" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
          <h2 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>Not a chatbot. A workspace.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Every AI output is a first-class artifact — persistent, versioned, and connected.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
            <div className="size-3 rounded-full bg-foreground/10" /><div className="size-3 rounded-full bg-foreground/10" /><div className="size-3 rounded-full bg-foreground/10" />
            <div className="ml-4 text-xs text-muted-foreground"><Sparkles className="mr-1 inline size-3" />Summa AI Workspace</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-4 border-r border-border p-6 min-h-[400px]">
              {[
                { me: true, text: 'Quiz me on Transformers' },
                { me: false, text: "I've generated a quiz. It's open in the workspace →" },
                { me: true, text: 'Make it harder' },
                { me: false, text: 'Updated to v2 — harder. Previous version saved.' },
              ].map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: msg.me ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.2 }} className={cn('flex', msg.me ? 'justify-end' : 'justify-start gap-2')}>
                  {!msg.me && <div className="size-7 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center"><Sparkles className="size-3.5" /></div>}
                  <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', msg.me ? 'rounded-tr-md bg-foreground text-background' : 'rounded-tl-md bg-secondary')}>{msg.text}</div>
                </motion.div>
              ))}
            </div>
            <div className="bg-secondary/20 p-6 min-h-[400px]">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="rounded-2xl border border-border bg-card p-4 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Brain className="size-4" /><span className="text-sm font-medium">Quiz: Transformers</span></div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">v2</span>
                </div>
                <p className="text-sm font-medium">What does attention compute?</p>
                {['A weighted sum of values', 'A simple average', 'A fixed dot product', 'A random projection'].map((o, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 + i * 0.1 }} className={cn('mt-2 flex items-center justify-between rounded-lg border px-3 py-2 text-xs', i === 0 ? 'border-foreground/20 bg-foreground/5' : 'border-border')}>{o}{i === 0 && <CheckCircle2 className="size-3.5" />}</motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ===== PARALLAX FEATURE CARDS ===== */

interface FeatureData { id: string; icon: React.ReactNode; title: string; desc: string; illustration: React.ReactNode }

function FeaturesParallax() {
  const features: FeatureData[] = [
    { id: 'adaptive', icon: <Brain className="size-5" />, title: 'Adaptive Tutoring', desc: "Explains at your level — undergrad, master's, or lifelong learner. Remembers what you know.", illustration: <AdaptiveIllust /> },
    { id: 'artifacts', icon: <Layers className="size-5" />, title: 'Artifact System', desc: 'Quizzes, flashcards, study plans, and more — each is a first-class, versioned entity.', illustration: <ArtifactIllust /> },
    { id: 'exam', icon: <Target className="size-5" />, title: 'Exam Prep Engine', desc: 'Upload your timetable and get a personalized, dynamically-adjusting study roadmap.', illustration: <ExamIllust /> },
    { id: 'hexagon', icon: <HexagonIcon className="size-5" />, title: 'Proficiency Hexagon', desc: 'Six dimensions: Depth, Problem-Solving, Speed, Consistency, Confidence, Creativity.', illustration: <HexagonIllust /> },
    { id: 'graph', icon: <Network className="size-5" />, title: 'Knowledge Graph', desc: 'Every concept is connected. See prerequisites, gaps, and mastery in one interactive graph.', illustration: <GraphIllust /> },
    { id: 'version', icon: <GitBranch className="size-5" />, title: 'Version History', desc: 'Every modification creates a new version. Never lose previous work. Restore anytime.', illustration: <VersionIllust /> },
    { id: 'memory', icon: <Calendar className="size-5" />, title: 'Proactive Memory', desc: 'Remembers your exams, follows up without prompting, and reminds you proactively.', illustration: <MemoryIllust /> },
    { id: 'gap', icon: <AlertTriangle className="size-5" />, title: 'Gap Analysis', desc: "Automatically finds what you don't know before you realize it. Color-coded by priority.", illustration: <GapIllust /> },
  ]
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index)) })
    }, { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' })
    containerRef.current?.querySelectorAll('[data-card]')?.forEach((c) => obs.observe(c))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="features" className="relative">
      <div className="sticky top-20 z-20 bg-background/80 py-8 backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">Features</p>
          <h2 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>Everything you need to learn smarter</h2>
        </div>
      </div>
      <div ref={containerRef} className="relative" style={{ scrollSnapType: 'y proximity' }}>
        {features.map((f, i) => <FeatureCard key={f.id} feature={f} index={i} isActive={active === i} />)}
      </div>
      <div className="sticky bottom-8 z-30 flex justify-center pb-8">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 backdrop-blur-md">
          {features.map((_, i) => (
            <button key={i} onClick={() => containerRef.current?.querySelector(`[data-index="${i}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={cn('h-1.5 rounded-full transition-all duration-300', active === i ? 'w-6 bg-foreground' : 'w-1.5 bg-border hover:bg-muted-foreground')} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index, isActive }: { feature: FeatureData; index: number; isActive: boolean }) {
  const even = index % 2 === 0
  return (
    <div data-card data-index={index} className="flex min-h-[100dvh] items-center justify-center px-6 py-16" style={{ scrollSnapAlign: 'center' }}>
      <div className={cn('grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2', !even && 'lg:grid-flow-col-dense')}>
        <motion.div initial={{ opacity: 0, x: even ? -40 : 40 }} animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.3, x: even ? -20 : 20 }} transition={{ duration: 0.6 }} className={cn(!even && 'lg:col-start-2')}>
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">{feature.icon}</div>
            <span className="text-5xl font-light text-muted-foreground/20" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>{String(index + 1).padStart(2, '0')}</span>
          </div>
          <h3 className="mb-4 text-3xl tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>{feature.title}</h3>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">{feature.desc}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 0.95 }} transition={{ duration: 0.7, delay: 0.1 }} className={cn('relative flex items-center justify-center', !even && 'lg:col-start-1 lg:row-start-1')}>
          <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-[2rem] border border-border bg-secondary/30" />
          <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-[2rem] border border-border bg-secondary/50" />
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-2xl">{feature.illustration}</div>
        </motion.div>
      </div>
    </div>
  )
}

/* ===== ILLUSTRATIONS ===== */

function AdaptiveIllust() {
  return (
    <div className="flex h-72 flex-col justify-center gap-4">
      {[{ me: true, t: 'Explain transformers at my level' }, { me: false, meta: 'Level: Master\'s CS', t: 'Self-attention weighs each token...' }, { me: true, t: 'Make it simpler' }, { me: false, meta: 'Level: Visual learner', t: 'Think of attention like a spotlight...' }].map((m, i) => (
        <motion.div key={i} animate={{ x: m.me ? [0, 8, 0] : [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }} className={cn('flex max-w-[80%] gap-2', m.me && 'self-end flex-row-reverse')}>
          {!m.me && <div className="size-7 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center"><Sparkles className="size-3.5" /></div>}
          <div className={cn('rounded-2xl px-4 py-2.5 text-sm', m.me ? 'rounded-tr-md bg-foreground text-background' : 'rounded-tl-md bg-secondary')}>
            {m.meta && <><span className="text-xs text-muted-foreground">{m.meta}</span><br /></>}
            {m.t}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ArtifactIllust() {
  return (
    <div className="relative flex h-72 items-center justify-center">
      {[{ l: 'Quiz', i: <Brain className="size-3" />, c: 'bg-foreground text-background' }, { l: 'Flashcards', i: <Layers className="size-3" />, c: 'bg-secondary text-foreground border border-border' }, { l: 'Study Plan', i: <Target className="size-3" />, c: 'bg-secondary text-foreground border border-border' }].map((card, i) => (
        <motion.div key={card.l} animate={{ y: [0, -8, 0], rotate: [0, i % 2 ? -2 : 2, 0] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.6 }} style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : -180 }} className={cn('w-64 rounded-2xl border p-5 shadow-xl', card.c)}>
          <div className="mb-3 flex items-center gap-2">{card.i}<span className="text-sm font-medium">{card.l}</span></div>
          <div className="space-y-1.5">{[80, 55, 65].map((w, j) => <div key={j} className="h-1.5 rounded-full bg-current opacity-20" style={{ width: `${w - i * 5}%` }} />)}</div>
        </motion.div>
      ))}
    </div>
  )
}

function ExamIllust() {
  return (
    <div className="flex h-72 flex-col justify-center gap-3">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="size-4" /> NLP Final — Dec 15</div>
      {['Word Embeddings', 'RNNs & LSTMs', 'Attention', 'Transformers', 'Practice', 'Review'].map((w, i) => (
        <motion.div key={w} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} className={cn('flex size-6 items-center justify-center rounded-full text-xs', i < 3 ? 'bg-foreground text-background' : 'border border-border bg-secondary')}>{i < 3 ? <CheckCircle2 className="size-3.5" /> : i + 1}</motion.div>
          <div className="flex-1">
            <div className="flex items-center justify-between"><span className={cn('text-sm', i < 3 ? 'text-muted-foreground line-through' : 'font-medium')}>Week {i + 1}: {w}</span><span className="text-xs text-muted-foreground">{i < 3 ? 'Done' : 'Upcoming'}</span></div>
            <div className="mt-1 h-1 rounded-full bg-secondary"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(20, 100 - i * 15)}%` }} transition={{ delay: i * 0.1 + 0.3 }} className="h-full rounded-full bg-foreground" /></div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function HexagonIllust() {
  const dims = [{ l: 'Depth', a: -90, s: 78 }, { l: 'Problem', a: -30, s: 65 }, { l: 'Speed', a: 30, s: 42 }, { l: 'Consist', a: 90, s: 80 }, { l: 'Confidence', a: 150, s: 55 }, { l: 'Creative', a: 210, s: 70 }]
  const cx = 150, cy = 130, R = 90
  const pts = dims.map(d => { const r = (d.s / 100) * R, a = (d.a * Math.PI) / 180; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}` }).join(' ')
  return (
    <div className="flex h-72 items-center justify-center">
      <svg width="300" height="260" className="overflow-visible">
        {[0.25, 0.5, 0.75, 1].map((s, i) => <polygon key={i} points={dims.map(d => { const r = s * R, a = (d.a * Math.PI) / 180; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}` }).join(' ')} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray={s === 1 ? undefined : '2 3'} />)}
        {dims.map((d, i) => { const a = (d.a * Math.PI) / 180; return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="var(--border)" strokeWidth="1" /> })}
        <motion.polygon initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} style={{ transformOrigin: `${cx}px ${cy}px` }} points={pts} fill="var(--foreground)" fillOpacity="0.15" stroke="var(--foreground)" strokeWidth="2" />
        {dims.map((d, i) => { const r = (d.s / 100) * R, a = (d.a * Math.PI) / 180; return <motion.circle key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r="3" fill="var(--foreground)" /> })}
        {dims.map((d, i) => { const a = (d.a * Math.PI) / 180, lr = R + 16; return <text key={i} x={cx + lr * Math.cos(a)} y={cy + lr * Math.sin(a)} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[9px] font-medium">{d.l}</text> })}
      </svg>
    </div>
  )
}

function GraphIllust() {
  const nodes = [{ l: 'Lin. Algebra', x: 60, y: 50, m: '#0E0F11' }, { l: 'Probability', x: 60, y: 150, m: '#0E0F11' }, { l: 'Embeddings', x: 180, y: 80, m: '#737882' }, { l: 'RNN/LSTM', x: 180, y: 170, m: '#737882' }, { l: 'Attention', x: 300, y: 50, m: '#C59F91' }, { l: 'Transformers', x: 300, y: 150, m: '#CCCCCC' }]
  const edges = [[0, 2], [1, 2], [2, 4], [3, 4], [4, 5]]
  return (
    <div className="flex h-72 items-center justify-center">
      <svg width="360" height="220" className="overflow-visible">
        {edges.map((e, i) => { const a = nodes[e[0]], b = nodes[e[1]]; return <motion.line key={i} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.15, duration: 0.5 }} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeWidth="1.5" strokeDasharray={e[1] === 5 ? '4 3' : undefined} /> })}
        {nodes.map((n, i) => (
          <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}>
            <circle cx={n.x} cy={n.y} r="18" fill={n.m} fillOpacity="0.15" stroke={n.m} strokeWidth="1.5" />
            <text x={n.x} y={n.y + 32} textAnchor="middle" className="fill-muted-foreground text-[9px] font-medium">{n.l}</text>
          </motion.g>
        ))}
      </svg>
    </div>
  )
}

function VersionIllust() {
  const vs = [{ v: 'v3', n: 'Only multiple choice', a: true }, { v: 'v2', n: 'Made it harder', a: false }, { v: 'v1', n: 'Initial generation', a: false }]
  return (
    <div className="flex h-72 flex-col justify-center gap-3">
      {vs.map((ver, i) => (
        <motion.div key={ver.v} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className={cn('flex items-center gap-4 rounded-2xl border p-4', ver.a ? 'border-foreground/20 bg-foreground/5 shadow-lg' : 'border-border bg-secondary/30')}>
          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-medium', ver.a ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground')}>{ver.v}</div>
          <div className="flex-1"><p className={cn('text-sm', ver.a ? 'font-medium' : 'text-muted-foreground')}>{ver.n}</p><div className="mt-1.5 flex gap-1">{[40, 50, 60].map((w, j) => <div key={j} className={cn('h-1 rounded-full', ver.a ? 'bg-foreground' : 'bg-border')} style={{ width: w }} />)}</div></div>
          {ver.a && <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="rounded-full bg-foreground/10 px-2 py-1 text-xs">Current</motion.div>}
        </motion.div>
      ))}
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><GitBranch className="size-3.5" /> Restore any version — never lose your work</div>
    </div>
  )
}

function MemoryIllust() {
  const notifs = [{ e: '📚', t: 'Your NLP final is in 14 days. Ready?', time: '2h ago' }, { e: '✅', t: 'How did your Calculus quiz go yesterday?', time: '1d ago' }, { e: '💡', t: "You haven't reviewed Attention in 3 days. Quick refresher?", time: '3d ago' }]
  return (
    <div className="flex h-72 flex-col justify-center gap-3">
      {notifs.map((n, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-base">{n.e}</div>
          <div className="flex-1"><p className="text-sm font-medium">{n.t}</p><p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p></div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} className="size-2 rounded-full bg-foreground" />
        </motion.div>
      ))}
      <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-center text-xs text-muted-foreground">Summa AI reaches out — you never have to ask</motion.p>
    </div>
  )
}

function GapIllust() {
  const gaps = [{ t: 'Attention Mechanism', p: 'High', c: 'bg-foreground', w: '90%' }, { t: 'Matrix Multiplication', p: 'Medium', c: 'bg-muted-foreground', w: '60%' }, { t: 'Softmax & Scaling', p: 'Medium', c: 'bg-muted-foreground', w: '50%' }, { t: 'Positional Encoding', p: 'Low', c: 'bg-border', w: '30%' }]
  return (
    <div className="flex h-72 flex-col justify-center gap-4">
      <p className="text-sm font-medium text-muted-foreground">Concepts you need before Transformers:</p>
      {gaps.map((g, i) => (
        <motion.div key={g.t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-4">
          <div className="w-40 shrink-0"><p className="text-sm font-medium">{g.t}</p><span className="text-xs text-muted-foreground">{g.p} priority</span></div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><motion.div initial={{ width: 0 }} animate={{ width: g.w }} transition={{ delay: i * 0.15 + 0.3, duration: 0.6 }} className={cn('h-full rounded-full', g.c)} /></div>
          <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}><AlertTriangle className={cn('size-4', i === 0 ? 'text-foreground' : 'text-muted-foreground')} /></motion.div>
        </motion.div>
      ))}
    </div>
  )
}

/* ===== QUOTE ===== */
function QuoteSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.blockquote initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl leading-relaxed tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>
          "The best teachers don't just teach — they remember your name, your struggles, your wins, and your dreams."
        </motion.blockquote>
        <p className="mt-8 text-sm text-muted-foreground">Summa AI does exactly that.</p>
      </div>
    </section>
  )
}

/* ===== CTA ===== */
function CTASection({ onGetStarted }: any) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-foreground" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl tracking-tight text-background sm:text-5xl md:text-6xl" style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}>Start your learning journey</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-background/60">Join Summa AI and experience an AI-native learning workspace that grows with you.</p>
          <div className="mt-10"><Button onClick={onGetStarted} className="h-12 rounded-full bg-background px-8 text-base font-medium text-foreground hover:bg-background/90">Get started free<ArrowRight className="ml-1 size-4" /></Button></div>
          <p className="mt-6 text-sm text-background/40">No credit card required · Free forever plan</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ===== FOOTER ===== */
function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2"><div className="inline-flex size-7 items-center justify-center rounded-lg bg-foreground text-background"><Sparkles className="size-3.5" /></div><span className="text-sm font-semibold">Summa AI</span></div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground"><a href="#features" className="hover:text-foreground transition-colors">Features</a><a href="#workspace" className="hover:text-foreground transition-colors">Workspace</a></div>
          <p className="text-xs text-muted-foreground">Built with ❤️ for learners everywhere</p>
        </div>
      </div>
    </footer>
  )
}
