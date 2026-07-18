'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { v4 as uuid } from 'uuid'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FocusRing } from '@/components/focus-ring'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Upload,
  X,
  Plus,
  Eye,
  Ear,
  Hand,
  GraduationCap,
  Calendar as CalendarIcon,
  Target,
  PartyPopper,
  Rocket,
  Trophy,
  Heart,
  Zap,
  Brain,
  Coffee,
  Moon,
  BookOpen,
  Music,
  Palette,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface OnboardingData {
  name: string
  email: string
  avatar?: string
  degree: string
  field: string
  year: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | null
  stylePrefs: { visual: number; auditory: number; kinesthetic: number }
  goals: string
  exams: { id: string; name: string; date?: Date }[]
  personality: Record<string, string>
}

const INITIAL_DATA: OnboardingData = {
  name: '',
  email: '',
  avatar: undefined,
  degree: '',
  field: '',
  year: '',
  learningStyle: null,
  stylePrefs: { visual: 50, auditory: 50, kinesthetic: 50 },
  goals: '',
  exams: [],
  personality: {},
}

const TOTAL_STEPS = 6

/* ------------------------------------------------------------------ */
/* Main flow                                                           */
/* ------------------------------------------------------------------ */

export interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
  onSkip?: (data: OnboardingData) => void
  initialData?: Partial<OnboardingData>
  onDataChange?: (data: OnboardingData) => void
}

function getStepName(s: number): string {
  switch (s) {
    case 0: return 'Welcome'
    case 1: return 'How it works'
    case 2: return 'Academic Profile'
    case 3: return 'Learning Style'
    case 4: return 'Goals & Exams'
    case 5: return 'Personality Quiz'
    default: return 'Unknown'
  }
}

export function OnboardingFlow({ onComplete, onSkip, initialData, onDataChange }: OnboardingFlowProps) {
  const [step, setStep] = React.useState(0) // 0..6 (6 is completion)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const [data, setData] = React.useState<OnboardingData>({ ...INITIAL_DATA, ...initialData })
  const stuckTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = (patch: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...patch }))

  React.useEffect(() => {
    onDataChange?.(data)
  }, [data, onDataChange])

  // Stuck detection — warn after 30s inactivity on a step
  React.useEffect(() => {
    stuckTimerRef.current = setTimeout(() => {
      console.info(`[onboarding] User may be stuck on step ${step} (${getStepName(step)})`)
    }, 30000)
    return () => {
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current)
    }
  }, [step])

  const goNext = () => {
    setDirection(1)
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }
  const goBack = () => {
    setDirection(-1)
    if (step > 0) setStep((s) => s - 1)
  }

  const handleFinish = () => {
    // Confetti burst!
    const duration = 2500
    const end = Date.now() + duration
    const colors = ['#888888', '#555555', '#aaaaaa', '#666666', '#cccccc']
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
    // Big burst from center
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors,
    })
    setStep(TOTAL_STEPS) // completion screen
  }

  const handleGoToDashboard = () => {
    onComplete(data)
  }

  const progressValue =
    step >= TOTAL_STEPS ? 100 : ((step) / TOTAL_STEPS) * 100

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-background text-foreground">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 0%, hsl(var(--primary) / 0.10), transparent 70%)',
        }}
      />

      {/* Top bar: progress + skip */}
      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Sparkles className="size-4" />
          </div>
          <span className="text-sm font-semibold">Summa AI</span>
        </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {step >= TOTAL_STEPS
                  ? 'All set!'
                  : `Step ${step + 1} of ${TOTAL_STEPS}`}
              </span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <div className="flex justify-center">
              <FocusRing value={progressValue} size="sm" state={step >= TOTAL_STEPS ? 'complete' : 'active'} aria-label={`${Math.round(progressValue)}%`} />
            </div>
          </div>
        {onSkip && step < TOTAL_STEPS && (
          <Button variant="ghost" size="sm" onClick={() => onSkip(data)} className="text-xs">
            Skip
          </Button>
        )}
      </header>

      {/* Step content */}
      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-8 sm:items-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {step === 0 && (
                <Step1Welcome data={data} update={update} onNext={goNext} />
              )}
              {step === 1 && (
                <IntroStep onNext={goNext} onBack={goBack} />
              )}
              {step === 2 && (
                <Step2Academic data={data} update={update} onNext={goNext} onBack={goBack} />
              )}
              {step === 3 && (
                <Step3LearningStyle data={data} update={update} onNext={goNext} onBack={goBack} />
              )}
              {step === 4 && (
                <Step4GoalsExams data={data} update={update} onNext={goNext} onBack={goBack} />
              )}
              {step === 5 && (
                <Step5Personality data={data} update={update} onFinish={handleFinish} onBack={goBack} />
              )}
              {step === TOTAL_STEPS && (
                <CompletionScreen data={data} onGoToDashboard={handleGoToDashboard} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step shell                                                          */
/* ------------------------------------------------------------------ */

function StepShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
      <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">{children}</div>
      <div className="flex items-center justify-between gap-3">{footer}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step 1: Welcome & Name                                              */
/* ------------------------------------------------------------------ */

function Step1Welcome({
  data,
  update,
  onNext,
}: {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
  onNext: () => void
}) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | undefined>(data.avatar)

  const handleFile = (file?: File) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    update({ avatar: url })
  }

  const canContinue = data.name.trim().length > 0

  return (
    <StepShell
      title="Welcome to Summa AI! 👋"
      subtitle="The learning companion that never forgets. Let's get to know you — it takes about 2 minutes."
      footer={
        <>
          <div />
          <Button onClick={onNext} disabled={!canContinue} size="lg" className="gap-2">
            Let's Go! <ArrowRight className="size-4" />
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="size-24 ring-2 ring-border">
              {preview ? <AvatarImage src={preview} alt="Avatar" /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {data.name ? data.name[0]?.toUpperCase() : <Sparkles className="size-8" />}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background transition-transform hover:scale-105"
              aria-label="Upload avatar"
            >
              <Upload className="size-4" />
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(undefined)
                  update({ avatar: undefined })
                }}
                className="absolute -top-1 -right-1 inline-flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md ring-2 ring-background"
                aria-label="Remove avatar"
              >
                <X className="size-3.5" />
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          <p className="text-xs text-muted-foreground">Click the + to upload a photo</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="onb-name">Your name</Label>
            <Input
              id="onb-name"
              placeholder="Alex Johnson"
              value={data.name}
              onChange={(e) => update({ name: e.target.value })}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Used for personalisation across devices. No account required to start.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="onb-email">Email</Label>
            <Input
              id="onb-email"
              type="email"
              placeholder="alex@summa.ai"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Stays private. Used only for account recovery and cross-device sync.</p>
          </div>
        </div>
      </div>
    </StepShell>
  )
}

/* ------------------------------------------------------------------ */
/* Step 1b: Intro — what happens next                                  */
/* ------------------------------------------------------------------ */

function IntroStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const steps = [
    { icon: <GraduationCap className="size-5" />, title: 'Your background', desc: 'Degree, field, and level so explanations match your stage.' },
    { icon: <Brain className="size-5" />, title: 'Learning style', desc: 'Visual, auditory, or kinesthetic — we adapt how we present content.' },
    { icon: <Target className="size-5" />, title: 'Goals & exams', desc: 'Tell us what matters so we build a focused study plan.' },
    { icon: <Sparkles className="size-5" />, title: 'Quick personality quiz', desc: '5 fun questions to make Summa AI feel more like you.' },
  ]

  return (
    <StepShell
      title="Here's what happens next"
      subtitle="Four short steps to personalize your experience. You can skip any time."
      footer={
        <>
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button onClick={onNext} size="lg" className="gap-2">
            Got it, let's go! <ArrowRight className="size-4" />
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-4 rounded-2xl border bg-card p-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {s.icon}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{s.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">Step {i + 1}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        This takes about 2 minutes. Your answers are stored locally and never shared.
      </p>
    </StepShell>
  )
}

/* ------------------------------------------------------------------ */
/* Step 2: Academic Profile                                            */
/* ------------------------------------------------------------------ */

const FIELDS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Biology',
  'Chemistry',
  'Engineering',
  'Economics',
  'Psychology',
  'Literature',
  'Philosophy',
  'Medicine',
  'Law',
  'Business',
  'Music',
  'Other',
]

function Step2Academic({
  data,
  update,
  onNext,
  onBack,
}: {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}) {
  const canContinue = data.degree && data.field && data.year
  return (
    <StepShell
      title="Your academic profile 🎓"
      subtitle="Tell us what you're studying so we can tailor explanations to your level."
      footer={
        <>
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button onClick={onNext} disabled={!canContinue} className="gap-2">
            Continue <ArrowRight className="size-4" />
          </Button>
        </>
      }
    >
      <p className="-mt-2 text-xs text-muted-foreground italic">
        Why we ask: your degree level and field calibrate the depth and vocabulary of explanations. A Year-1 undergrad gets different material than a Master's student.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Degree level</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(['Undergraduate', "Master's", 'Lifelong learner'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => update({ degree: d })}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-sm transition-all hover:scale-[1.02]',
                  data.degree === d
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <GraduationCap
                  className={cn('size-5', data.degree === d ? 'text-primary' : 'text-muted-foreground')}
                />
                <span className="font-medium">{d}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Field of study</Label>
          <Select value={data.field} onValueChange={(v) => update({ field: v })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your field" />
            </SelectTrigger>
            <SelectContent>
              {FIELDS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Year of study</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5+'].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => update({ year: y })}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]',
                  data.year === y
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/40',
                )}
              >
                {y}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Not sure? Pick the closest option — you can change it anytime in Settings.</p>
        </div>
      </div>
    </StepShell>
  )
}

/* ------------------------------------------------------------------ */
/* Step 3: Learning Style                                              */
/* ------------------------------------------------------------------ */

const STYLE_CARDS = [
  {
    id: 'visual' as const,
    icon: <Eye className="size-6" />,
    title: 'Visual',
    body: 'Diagrams, charts, mind maps, and color-coded notes.',
  },
  {
    id: 'auditory' as const,
    icon: <Ear className="size-6" />,
    title: 'Auditory',
    body: 'Lectures, discussions, reading aloud, and audio recordings.',
  },
  {
    id: 'kinesthetic' as const,
    icon: <Hand className="size-6" />,
    title: 'Kinesthetic',
    body: 'Hands-on practice, experiments, and real-world examples.',
  },
]

function Step3LearningStyle({
  data,
  update,
  onNext,
  onBack,
}: {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <StepShell
      title="How do you learn best? 🧠"
      subtitle="Pick your dominant style, then fine-tune your preferences below."
      footer={
        <>
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button onClick={onNext} disabled={!data.learningStyle} className="gap-2">
            Continue <ArrowRight className="size-4" />
          </Button>
        </>
      }
    >
      <p className="-mt-2 text-xs text-muted-foreground italic">
        Why we ask: matching content format to your learning style makes information stick 2-3x better. We'll use this to recommend diagrams, discussions, or hands-on practice.
      </p>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STYLE_CARDS.map((c) => {
            const active = data.learningStyle === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => update({ learningStyle: c.id })}
                className={cn(
                  'group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all hover:scale-[1.02]',
                  active
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <div
                  className={cn(
                    'inline-flex size-10 items-center justify-center rounded-xl transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {c.icon}
                </div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.body}</p>
                {active && (
                  <span className="absolute right-3 top-3 inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="space-y-4 rounded-2xl bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Fine-tune your preferences (0 = not me, 100 = totally me)
          </p>
          <p className="text-[10px] text-muted-foreground/70">Already set based on your choice above. Adjust if you like — or leave as-is.</p>
          {(['visual', 'auditory', 'kinesthetic'] as const).map((s) => (
            <div key={s} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 capitalize">
                  {s === 'visual' && <Eye className="size-3.5" />}
                  {s === 'auditory' && <Ear className="size-3.5" />}
                  {s === 'kinesthetic' && <Hand className="size-3.5" />}
                  {s}
                </span>
                <span className="tabular-nums text-muted-foreground">{data.stylePrefs[s]}</span>
              </div>
              <Slider
                value={[data.stylePrefs[s]]}
                onValueChange={(v) =>
                  update({ stylePrefs: { ...data.stylePrefs, [s]: v[0] } })
                }
                min={0}
                max={100}
                step={5}
              />
            </div>
          ))}
        </div>
      </div>
    </StepShell>
  )
}

/* ------------------------------------------------------------------ */
/* Step 4: Goals & Exams                                               */
/* ------------------------------------------------------------------ */

function Step4GoalsExams({
  data,
  update,
  onNext,
  onBack,
}: {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}) {
  const addExam = () =>
    update({ exams: [...data.exams, { id: uuid(), name: '', date: undefined }] })
  const removeExam = (id: string) =>
    update({ exams: data.exams.filter((e) => e.id !== id) })
  const updateExam = (id: string, patch: Partial<{ name: string; date: Date }>) =>
    update({
      exams: data.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })

  return (
    <StepShell
      title="Goals & upcoming exams 🎯"
      subtitle="What do you want to achieve? List your exams and we'll build a study plan."
      footer={
        <>
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button onClick={onNext} className="gap-2">
            Continue <ArrowRight className="size-4" />
          </Button>
        </>
      }
    >
      <p className="-mt-2 text-xs text-muted-foreground italic">
        Why we ask: knowing your goals and exam dates lets Summa AI build a reverse-calendar study plan, prioritize topics, and send timely reminders.
      </p>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="onb-goals" className="flex items-center gap-2">
            <Target className="size-4" /> Your learning goals
          </Label>
          <Input
            id="onb-goals"
            placeholder="e.g. Master NLP before December, ace my calculus final, learn guitar theory"
            value={data.goals}
            onChange={(e) => update({ goals: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="size-4" /> Upcoming exams
            </Label>
            <Button variant="outline" size="sm" onClick={addExam} className="gap-1">
              <Plus className="size-3.5" /> Add exam
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">Both fields are optional — you can skip this and fill later.</p>
          {data.exams.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No exams yet. Click <strong>Add exam</strong> to add one, or just Continue.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {data.exams.map((exam) => (
                  <motion.li
                    key={exam.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="Exam name (e.g. NLP Final)"
                      value={exam.name}
                      onChange={(e) => updateExam(exam.id, { name: e.target.value })}
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'min-w-[150px] justify-start text-left font-normal',
                            !exam.date && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="size-4" />
                          {exam.date ? format(exam.date, 'MMM d, yyyy') : 'Pick date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={exam.date}
                          onSelect={(d) => updateExam(exam.id, { date: d })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExam(exam.id)}
                      aria-label="Remove exam"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-4" />
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </StepShell>
  )
}

/* ------------------------------------------------------------------ */
/* Step 5: Personality Quiz                                            */
/* ------------------------------------------------------------------ */

const QUIZ: {
  id: string
  question: string
  emoji: string
  options: { id: string; label: string; emoji: string }[]
}[] = [
  {
    id: 'study_time',
    question: 'When do you feel most productive?',
    emoji: '⏰',
    options: [
      { id: 'morning', label: 'Early morning', emoji: '🌅' },
      { id: 'afternoon', label: 'Afternoon', emoji: '☀️' },
      { id: 'evening', label: 'Evening', emoji: '🌆' },
      { id: 'night', label: 'Late night', emoji: '🌙' },
    ],
  },
  {
    id: 'pace',
    question: 'How do you like to learn new topics?',
    emoji: '🧭',
    options: [
      { id: 'deep', label: 'Go deep first', emoji: '🔬' },
      { id: 'broad', label: 'Big picture first', emoji: '🗺️' },
      { id: 'examples', label: 'Examples first', emoji: '💡' },
      { id: 'practice', label: 'Practice first', emoji: '🏋️' },
    ],
  },
  {
    id: 'vibe',
    question: 'Pick your study vibe',
    emoji: '🎧',
    options: [
      { id: 'coffee', label: 'Coffee shop', emoji: '☕' },
      { id: 'library', label: 'Quiet library', emoji: '📚' },
      { id: 'home', label: 'Cozy home', emoji: '🛋️' },
      { id: 'outdoors', label: 'Outdoors', emoji: '🌳' },
    ],
  },
  {
    id: 'superpower',
    question: 'Your learning superpower?',
    emoji: '⚡',
    options: [
      { id: 'memory', label: 'Photographic memory', emoji: '🧠' },
      { id: 'focus', label: 'Laser focus', emoji: '🎯' },
      { id: 'creative', label: 'Creative thinking', emoji: '🎨' },
      { id: 'speed', label: 'Lightning speed', emoji: '⚡' },
    ],
  },
  {
    id: 'motivation',
    question: 'What keeps you going?',
    emoji: '🔥',
    options: [
      { id: 'grades', label: 'Top grades', emoji: '🏆' },
      { id: 'curiosity', label: 'Curiosity', emoji: '🔍' },
      { id: 'career', label: 'Career goals', emoji: '🚀' },
      { id: 'praise', label: 'Praise & wins', emoji: '🎉' },
    ],
  },
]

function Step5Personality({
  data,
  update,
  onFinish,
  onBack,
}: {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
  onFinish: () => void
  onBack: () => void
}) {
  const answeredCount = Object.keys(data.personality).length
  const allAnswered = answeredCount === QUIZ.length

  return (
    <StepShell
      title="Quick personality quiz ✨"
      subtitle="5 fun questions to tailor Summa AI's personality to yours."
      footer={
        <>
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button onClick={onFinish} disabled={!allAnswered} className="gap-2">
            Finish <PartyPopper className="size-4" />
          </Button>
        </>
      }
    >
      <p className="-mt-2 text-xs text-muted-foreground italic">
        Why we ask: small preferences — study time, pace, motivation — help us adjust tone, example style, and encouragement frequency. You'll barely notice it, but it makes Summa AI feel more human.
      </p>
      <div className="space-y-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {answeredCount} / {QUIZ.length} answered
          </span>
          <span>{Math.round((answeredCount / QUIZ.length) * 100)}%</span>
        </div>

        <ol className="space-y-5">
          {QUIZ.map((q, i) => {
            const selected = data.personality[q.id]
            return (
              <li key={q.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <p className="font-medium">
                    {q.emoji} {q.question}
                  </p>
                  {selected && (
                    <Check className="ml-auto size-4 text-green-500" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {q.options.map((o) => {
                    const active = selected === o.id
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() =>
                          update({ personality: { ...data.personality, [q.id]: o.id } })
                        }
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all hover:scale-[1.03]',
                          active
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                            : 'border-border hover:border-primary/40',
                        )}
                      >
                        <span className="text-2xl">{o.emoji}</span>
                        <span className="text-xs font-medium">{o.label}</span>
                      </button>
                    )
                  })}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </StepShell>
  )
}

/* ------------------------------------------------------------------ */
/* Completion screen                                                   */
/* ------------------------------------------------------------------ */

function CompletionScreen({
  data,
  onGoToDashboard,
}: {
  data: OnboardingData
  onGoToDashboard: () => void
}) {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto inline-flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/20"
      >
        <PartyPopper className="size-10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          You're all set, {data.name.split(' ')[0] || 'friend'}! 🎉
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">
          Summa AI now knows your level, your goals, and your learning style. Your personalized
          companion is ready to go.
        </p>
      </motion.div>

      {/* Summary chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-2"
      >
        {data.degree && <Chip icon={<GraduationCap className="size-3.5" />}>{data.degree}</Chip>}
        {data.field && <Chip icon={<BookOpen className="size-3.5" />}>{data.field}</Chip>}
        {data.year && <Chip icon={<CalendarIcon className="size-3.5" />}>{data.year}</Chip>}
        {data.learningStyle && (
          <Chip icon={<Sparkles className="size-3.5" />}>
            {data.learningStyle[0].toUpperCase() + data.learningStyle.slice(1)} learner
          </Chip>
        )}
        {data.exams.length > 0 && (
          <Chip icon={<Target className="size-3.5" />}>{data.exams.length} exam(s)</Chip>
        )}
      </motion.div>

      {/* Dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-auto max-w-md rounded-2xl border bg-card p-4 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex size-1.5 rounded-full bg-green-500" />
          Your dashboard preview
        </div>
        <div className="grid grid-cols-3 gap-2">
          <PreviewCard icon={<Brain className="size-4" />} label="Knowledge" value="0 topics" />
          <PreviewCard icon={<Trophy className="size-4" />} label="Streak" value="Day 1" />
          <PreviewCard icon={<Rocket className="size-4" />} label="Goals" value={data.exams.length ? `${data.exams.length} plan${data.exams.length > 1 ? 's' : ''}` : 'Ready'} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button onClick={onGoToDashboard} size="lg" className="gap-2">
          Go to Dashboard <ArrowRight className="size-4" />
        </Button>
      </motion.div>
    </div>
  )
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-xs font-medium">
      <span className="text-primary">{icon}</span>
      {children}
    </span>
  )
}

function PreviewCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border bg-background p-2.5 text-left">
      <div className="mb-1 inline-flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  )
}

export default OnboardingFlow
