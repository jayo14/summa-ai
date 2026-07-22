'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/lib/use-supabase-auth'
import { cn } from '@/lib/utils'
import {
  User,
  Brain,
  Database,
  Shield,
  Bell,
  Key,
  X,
  Sparkles,
  Eye,
  Ear,
  Hand,
  Save,
  Trash2,
  Download,
  Upload,
  Check,
  Copy,
  Plus,
  Calendar as CalendarIcon,
  GraduationCap,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { fetchMemoryFacts, forgetMemoryTopic, forgetDataset } from '@/lib/api'
import type { OnboardingData } from './onboarding-flow'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface UserProfile {
  name: string
  email: string
  avatar?: string
}

export interface MemoryItem {
  id: string
  title: string
  category: 'exam' | 'concept' | 'event' | 'goal' | 'note'
  createdAt: string
  snippet: string
}

export interface SettingsState {
  // Profile
  name: string
  email: string
  bio: string
  degree: string
  field: string
  // Learning preferences
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | null
  stylePrefs: { visual: number; auditory: number; kinesthetic: number }
  personality: Record<string, string>
  // Notifications
  examReminders: boolean
  proactiveCheckIns: boolean
  weeklyProgress: boolean
  emailNotifications: boolean
  // Privacy
  shareProgress: boolean
  analytics: boolean
  // API keys
  cogneeApiKey: string
  openaiApiKey: string
}

/* ------------------------------------------------------------------ */
/* Sample memory data (would come from Cognee in production)           */
/* ------------------------------------------------------------------ */

const SAMPLE_MEMORIES: MemoryItem[] = [
  {
    id: 'm1',
    title: 'NLP Final Exam',
    category: 'exam',
    createdAt: '2 days ago',
    snippet: 'Scheduled for Dec 15. Covers Transformers, attention, embeddings.',
  },
  {
    id: 'm2',
    title: 'Struggling with GloVe',
    category: 'concept',
    createdAt: '5 days ago',
    snippet: 'Marked GloVe as a gap. Suggested prerequisite: word2vec.',
  },
  {
    id: 'm3',
    title: 'Mastered Linear Algebra',
    category: 'concept',
    createdAt: '1 week ago',
    snippet: 'User confirmed mastery of eigenvalues, SVD, and matrix decomposition.',
  },
  {
    id: 'm4',
    title: 'Job interview next week',
    category: 'event',
    createdAt: '1 week ago',
    snippet: 'Google ML engineer interview on Jul 10. Preparing transformers + system design.',
  },
  {
    id: 'm5',
    title: 'Goal: Master NLP by December',
    category: 'goal',
    createdAt: '2 weeks ago',
    snippet: 'Long-term goal set during onboarding. 6-week study plan generated.',
  },
]

/* ------------------------------------------------------------------ */
/* Settings dialog (large on desktop, full page on mobile)             */
/* ------------------------------------------------------------------ */

export interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile
  onboardingData?: OnboardingData
  onUpdateUser?: (patch: Partial<UserProfile>) => void
  onUpdateOnboarding?: (patch: Partial<OnboardingData>) => void
  onLogout: () => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  user,
  onboardingData,
  onUpdateUser,
  onUpdateOnboarding,
  onLogout,
}: SettingsDialogProps) {
  const [settings, setSettings] = React.useState<SettingsState>(() => ({
    name: user.name,
    email: user.email,
    bio: '',
    degree: onboardingData?.degree ?? '',
    field: onboardingData?.field ?? '',
    learningStyle: onboardingData?.learningStyle ?? null,
    stylePrefs: onboardingData?.stylePrefs ?? { visual: 50, auditory: 50, kinesthetic: 50 },
    personality: onboardingData?.personality ?? {},
    examReminders: true,
    proactiveCheckIns: true,
    weeklyProgress: true,
    emailNotifications: true,
    shareProgress: false,
    analytics: true,
    cogneeApiKey: '',
    openaiApiKey: '',
  }))

  const { session } = useAuth()
  const token = session?.accessToken
  const [memories, setMemories] = React.useState<MemoryItem[]>(SAMPLE_MEMORIES)
  const [loadingMemories, setLoadingMemories] = React.useState(true)

  React.useEffect(() => {
    if (!token) { setLoadingMemories(false); return }
    fetchMemoryFacts(token).then(facts => {
      if (facts && facts.length > 0) {
        setMemories(facts.map((f, i) => ({
          id: `mem-${i}`,
          title: f.content.length > 60 ? f.content.slice(0, 60) + '…' : f.content,
          category: (f.type === 'preference' || f.type === 'goal' ? f.type : 'note') as MemoryItem['category'],
          createdAt: f.created_at ? new Date(f.created_at).toLocaleDateString() : 'recently',
          snippet: f.content,
        })))
      }
    }).finally(() => setLoadingMemories(false))
  }, [token])

  const update = (patch: Partial<SettingsState>) =>
    setSettings((prev) => ({ ...prev, ...patch }))

  const handleSaveProfile = () => {
    onUpdateUser?.({ name: settings.name, email: settings.email })
  }

  const handleSaveLearning = () => {
    onUpdateOnboarding?.({
      degree: settings.degree,
      field: settings.field,
      learningStyle: settings.learningStyle,
      stylePrefs: settings.stylePrefs,
      personality: settings.personality,
    })
  }

  const handleForgetMemory = async (id: string) => {
    const item = memories.find(m => m.id === id)
    setMemories((prev) => prev.filter((m) => m.id !== id))
    if (token && item) {
      await forgetMemoryTopic(token, 'conversations', item.title)
    }
  }

  const handleForgetAll = async () => {
    setMemories([])
    if (token) {
      await forgetDataset(token, 'conversations')
      await forgetDataset(token, 'progress')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          gap-0 overflow-hidden p-0
          max-h-[100dvh] h-[100dvh] w-[100vw]
          sm:h-auto sm:max-h-[88vh] sm:max-w-5xl sm:rounded-2xl
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Sparkles className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold">Profile & Settings</DialogTitle>
              <DialogDescription className="hidden text-xs sm:block">
                Manage your profile, memories, privacy, and integrations.
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close settings"
            className="size-8"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Body: tabs */}
        <Tabs defaultValue="profile" className="flex min-h-0 flex-1 flex-col">
          <div className="border-b px-3 py-3 sm:flex sm:gap-1 sm:px-5 sm:py-4">
            <TabsList
              className="
                flex h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0
                sm:flex-col sm:overflow-visible sm:w-56 sm:shrink-0
              "
            >
              <SettingsTabTrigger value="profile" icon={<User className="size-4" />}>
                User Profile
              </SettingsTabTrigger>
              <SettingsTabTrigger value="learning" icon={<Brain className="size-4" />}>
                Learning Preferences
              </SettingsTabTrigger>
              <SettingsTabTrigger value="memory" icon={<Database className="size-4" />}>
                Memory Management
              </SettingsTabTrigger>
              <SettingsTabTrigger value="privacy" icon={<Shield className="size-4" />}>
                Privacy Controls
              </SettingsTabTrigger>
              <SettingsTabTrigger value="notifications" icon={<Bell className="size-4" />}>
                Notifications
              </SettingsTabTrigger>
              <SettingsTabTrigger value="apikeys" icon={<Key className="size-4" />}>
                API Keys
              </SettingsTabTrigger>
            </TabsList>
          </div>

          {/* Tab contents */}
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
            <TabsContent value="profile" className="mt-0">
              <ProfileTab
                settings={settings}
                update={update}
                user={user}
                onSave={handleSaveProfile}
              />
            </TabsContent>
            <TabsContent value="learning" className="mt-0">
              <LearningPreferencesTab
                settings={settings}
                update={update}
                onSave={handleSaveLearning}
              />
            </TabsContent>
            <TabsContent value="memory" className="mt-0">
              <MemoryManagementTab
                memories={memories}
                onForget={handleForgetMemory}
                onForgetAll={handleForgetAll}
                loading={loadingMemories}
              />
            </TabsContent>
            <TabsContent value="privacy" className="mt-0">
              <PrivacyControlsTab
                settings={settings}
                update={update}
                onForgetAll={handleForgetAll}
                onLogout={onLogout}
              />
            </TabsContent>
            <TabsContent value="notifications" className="mt-0">
              <NotificationsTab settings={settings} update={update} />
            </TabsContent>
            <TabsContent value="apikeys" className="mt-0">
              <ApiKeysTab settings={settings} update={update} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t px-5 py-3 sm:px-7">
          <p className="text-xs text-muted-foreground">
            Changes are saved automatically.
          </p>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function SettingsTabTrigger({
  value,
  icon,
  children,
}: {
  value: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium',
        'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground',
        'whitespace-nowrap',
      )}
    >
      {icon}
      {children}
    </TabsTrigger>
  )
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {icon}
      {children}
    </h3>
  )
}

function Row({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

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

/* ------------------------------------------------------------------ */
/* Profile tab                                                         */
/* ------------------------------------------------------------------ */

function ProfileTab({
  settings,
  update,
  user,
  onSave,
}: {
  settings: SettingsState
  update: (patch: Partial<SettingsState>) => void
  user: UserProfile
  onSave: () => void
}) {
  const [saved, setSaved] = React.useState(false)
  const handleSave = () => {
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle icon={<User className="size-3.5" />}>Basic Information</SectionTitle>
        <div className="space-y-6">
          <div className="flex items-center gap-5">
            <Avatar className="size-20 ring-2 ring-border">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {user.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="size-3.5" /> Change photo
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Remove
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="set-name">Name</Label>
              <Input
                id="set-name"
                value={settings.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-email">Email</Label>
              <Input
                id="set-email"
                type="email"
                value={settings.email}
                onChange={(e) => update({ email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Degree level</Label>
              <Select
                value={settings.degree}
                onValueChange={(v) => update({ degree: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Master's">Master&apos;s</SelectItem>
                  <SelectItem value="Lifelong learner">Lifelong learner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Field of study</Label>
              <Select value={settings.field} onValueChange={(v) => update({ field: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select field" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="set-bio">Bio</Label>
            <Input
              id="set-bio"
              placeholder="Tell Summa AI a bit about yourself…"
              value={settings.bio}
              onChange={(e) => update({ bio: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} className="gap-2">
              {saved ? (
                <>
                  <Check className="size-4" /> Saved
                </>
              ) : (
                <>
                  <Save className="size-4" /> Save changes
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Learning Preferences tab                                            */
/* ------------------------------------------------------------------ */

const STYLE_CARDS = [
  {
    id: 'visual' as const,
    icon: <Eye className="size-5" />,
    title: 'Visual',
    body: 'Diagrams, charts, mind maps.',
  },
  {
    id: 'auditory' as const,
    icon: <Ear className="size-5" />,
    title: 'Auditory',
    body: 'Lectures, discussions, audio.',
  },
  {
    id: 'kinesthetic' as const,
    icon: <Hand className="size-5" />,
    title: 'Kinesthetic',
    body: 'Hands-on practice, real-world.',
  },
]

const QUIZ_LABELS: Record<string, { question: string; options: Record<string, string> }> = {
  study_time: {
    question: 'When do you feel most productive?',
    options: { morning: 'Early morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Late night' },
  },
  pace: {
    question: 'How do you like to learn new topics?',
    options: { deep: 'Go deep first', broad: 'Big picture first', examples: 'Examples first', practice: 'Practice first' },
  },
  vibe: {
    question: 'Pick your study vibe',
    options: { coffee: 'Coffee shop', library: 'Quiet library', home: 'Cozy home', outdoors: 'Outdoors' },
  },
  superpower: {
    question: 'Your learning superpower?',
    options: { memory: 'Photographic memory', focus: 'Laser focus', creative: 'Creative thinking', speed: 'Lightning speed' },
  },
  motivation: {
    question: 'What keeps you going?',
    options: { grades: 'Top grades', curiosity: 'Curiosity', career: 'Career goals', praise: 'Praise & wins' },
  },
}

function LearningPreferencesTab({
  settings,
  update,
  onSave,
}: {
  settings: SettingsState
  update: (patch: Partial<SettingsState>) => void
  onSave: () => void
}) {
  const [saved, setSaved] = React.useState(false)
  const handleSave = () => {
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle icon={<Brain className="size-3.5" />}>Learning Style</SectionTitle>
        <p className="mb-4 text-sm text-muted-foreground">
          Pick your dominant style. Summa AI will tailor explanations accordingly.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STYLE_CARDS.map((c) => {
            const active = settings.learningStyle === c.id
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

        <div className="mt-6 space-y-5 rounded-2xl bg-muted/40 p-5">
          <p className="text-xs font-medium text-muted-foreground">
            Fine-tune your preferences (0 = not me, 100 = totally me)
          </p>
          {(['visual', 'auditory', 'kinesthetic'] as const).map((s) => (
            <div key={s} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 capitalize">
                  {s === 'visual' && <Eye className="size-3.5" />}
                  {s === 'auditory' && <Ear className="size-3.5" />}
                  {s === 'kinesthetic' && <Hand className="size-3.5" />}
                  {s}
                </span>
                <span className="tabular-nums text-muted-foreground">{settings.stylePrefs[s]}</span>
              </div>
              <Slider
                value={[settings.stylePrefs[s]]}
                onValueChange={(v) =>
                  update({ stylePrefs: { ...settings.stylePrefs, [s]: v[0] } })
                }
                min={0}
                max={100}
                step={5}
              />
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <SectionTitle icon={<Sparkles className="size-3.5" />}>Personality Quiz Answers</SectionTitle>
        <p className="mb-4 text-sm text-muted-foreground">
          Update your answers from the onboarding personality quiz.
        </p>
        <div className="space-y-5">
          {Object.entries(QUIZ_LABELS).map(([key, q]) => (
            <div key={key} className="space-y-2">
              <p className="text-sm font-medium">{q.question}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(q.options).map(([optId, label]) => {
                  const active = settings.personality[key] === optId
                  return (
                    <button
                      key={optId}
                      type="button"
                      onClick={() =>
                        update({ personality: { ...settings.personality, [key]: optId } })
                      }
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.02]',
                        active
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="gap-2">
          {saved ? (
            <>
              <Check className="size-4" /> Saved
            </>
          ) : (
            <>
              <Save className="size-4" /> Update preferences
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Memory Management tab                                               */
/* ------------------------------------------------------------------ */

const CATEGORY_STYLES: Record<MemoryItem['category'], { label: string; className: string }> = {
  exam: { label: 'Exam', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  concept: { label: 'Concept', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  event: { label: 'Event', className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
  goal: { label: 'Goal', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  note: { label: 'Note', className: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400' },
}

function MemoryManagementTab({
  memories,
  onForget,
  onForgetAll,
  loading,
}: {
  memories: MemoryItem[]
  onForget: (id: string) => void
  onForgetAll: () => void
  loading?: boolean
}) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <SectionTitle icon={<Database className="size-3.5" />}>Stored Memories</SectionTitle>
            <p className="-mt-4 mb-4 text-sm text-muted-foreground">
              Summa AI remembers {memories.length} {memories.length === 1 ? 'thing' : 'things'} about you.
              Forget anything you no longer want it to recall.
            </p>
          </div>
          {memories.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="size-3.5" /> Forget all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Forget all memories?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove all {memories.length} stored memories. Summa AI will
                    no longer remember your exams, mastered concepts, or goals. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onForgetAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, forget everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : memories.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
            <Database className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No memories stored</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Summa AI will store memories here as you chat and upload materials.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {memories.map((m) => {
              const cat = CATEGORY_STYLES[m.category]
              return (
                <li
                  key={m.id}
                  className="group flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{m.title}</p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                          cat.className,
                        )}
                      >
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">· {m.createdAt}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.snippet}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 gap-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" /> Forget
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Forget "{m.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Summa AI will no longer remember this. You may lose context the next time
                          this memory would have been relevant.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onForget(m.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Forget it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Privacy Controls tab                                                */
/* ------------------------------------------------------------------ */

function PrivacyControlsTab({
  settings,
  update,
  onForgetAll,
  onLogout,
}: {
  settings: SettingsState
  update: (patch: Partial<SettingsState>) => void
  onForgetAll: () => void
  onLogout: () => void
}) {
  const [exported, setExported] = React.useState(false)

  const handleExport = () => {
    // In production this would call the Cognee recall() API and download a JSON.
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), note: 'Memory export stub' }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'summa-memory-export.json'
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle icon={<Shield className="size-3.5" />}>Data Visibility</SectionTitle>
        <div className="divide-y rounded-2xl border">
          <Row
            title="Share progress with classmates"
            description="Let study group members see your study streak and progress."
          >
            <Switch
              checked={settings.shareProgress}
              onCheckedChange={(v) => update({ shareProgress: v })}
            />
          </Row>
          <Row
            title="Anonymous analytics"
            description="Help improve Summa AI by sharing anonymous usage data."
          >
            <Switch
              checked={settings.analytics}
              onCheckedChange={(v) => update({ analytics: v })}
            />
          </Row>
        </div>
      </section>

      <Separator />

      <section>
        <SectionTitle icon={<Database className="size-3.5" />}>Data Management</SectionTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Export your memory</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Download a JSON file of everything Summa AI remembers about you.
              </p>
            </div>
            <Button variant="outline" onClick={handleExport} className="gap-1.5 shrink-0">
              {exported ? (
                <>
                  <Check className="size-4" /> Exported
                </>
              ) : (
                <>
                  <Download className="size-4" /> Export
                </>
              )}
            </Button>
          </div>

          <AlertDialog>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                  <AlertTriangle className="size-4" /> Delete all data
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Permanently delete your account, memories, and chat history. This cannot be undone.
                </p>
              </div>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-1.5 shrink-0">
                  <Trash2 className="size-4" /> Delete
                </Button>
              </AlertDialogTrigger>
            </div>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all memories, all conversations, and
                  all preferences. You will be signed out and cannot recover this data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onForgetAll()
                    onLogout()
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Notifications tab                                                   */
/* ------------------------------------------------------------------ */

function NotificationsTab({
  settings,
  update,
}: {
  settings: SettingsState
  update: (patch: Partial<SettingsState>) => void
}) {
  return (
    <div className="space-y-8">
      <section>
        <SectionTitle icon={<Bell className="size-3.5" />}>Reminders</SectionTitle>
        <div className="divide-y rounded-2xl border">
          <Row
            title="Exam reminders"
            description="Get reminded about upcoming exams and deadlines. Summa AI will reach out before each exam with a study checklist."
          >
            <Switch
              checked={settings.examReminders}
              onCheckedChange={(v) => update({ examReminders: v })}
            />
          </Row>
          <Row
            title="Proactive check-ins"
            description="Summa AI will reach out the day after an exam to ask how it went, and follow up on events you mention."
          >
            <Switch
              checked={settings.proactiveCheckIns}
              onCheckedChange={(v) => update({ proactiveCheckIns: v })}
            />
          </Row>
          <Row
            title="Weekly progress digest"
            description="A weekly summary of what you studied, your gaps, and recommended next steps."
          >
            <Switch
              checked={settings.weeklyProgress}
              onCheckedChange={(v) => update({ weeklyProgress: v })}
            />
          </Row>
          <Row
            title="Email notifications"
            description="Receive important updates and summaries by email."
          >
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v) => update({ emailNotifications: v })}
            />
          </Row>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* API Keys tab                                                        */
/* ------------------------------------------------------------------ */

function ApiKeysTab({
  settings,
  update,
}: {
  settings: SettingsState
  update: (patch: Partial<SettingsState>) => void
}) {
  const [showCognee, setShowCognee] = React.useState(false)
  const [showOpenai, setShowOpenai] = React.useState(false)
  const [savedCognee, setSavedCognee] = React.useState(false)
  const [savedOpenai, setSavedOpenai] = React.useState(false)

  const maskKey = (k: string) => (k ? k.slice(0, 4) + '••••••••' + k.slice(-4) : '')

  const handleSaveCognee = () => {
    setSavedCognee(true)
    setTimeout(() => setSavedCognee(false), 1500)
  }
  const handleSaveOpenai = () => {
    setSavedOpenai(true)
    setTimeout(() => setSavedOpenai(false), 1500)
  }

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle icon={<Key className="size-3.5" />}>Connected Services</SectionTitle>
        <p className="mb-5 text-sm text-muted-foreground">
          Connect your own API keys to use Summa AI with your accounts. Keys are stored locally and
          never sent to our servers.
        </p>

        <div className="space-y-5">
          {/* Cognee */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Database className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Cognee Cloud</p>
                  <p className="text-xs text-muted-foreground">
                    Memory layer — powers remember(), recall(), forget()
                  </p>
                </div>
              </div>
              {settings.cogneeApiKey && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-medium text-green-700 dark:text-green-400">
                  <span className="size-1.5 rounded-full bg-green-500" /> Connected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type={showCognee ? 'text' : 'password'}
                placeholder="cog-..."
                value={settings.cogneeApiKey}
                onChange={(e) => update({ cogneeApiKey: e.target.value })}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCognee((v) => !v)}
                aria-label={showCognee ? 'Hide key' : 'Show key'}
              >
                <Eye className={cn('size-4', showCognee && 'text-primary')} />
              </Button>
              <Button onClick={handleSaveCognee} className="gap-1.5">
                {savedCognee ? (
                  <>
                    <Check className="size-4" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="size-4" /> Save
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Don&apos;t have one? Use code <code className="rounded bg-muted px-1 py-0.5 font-mono">COGNEE-35</code> for $35 free credit at{' '}
              <a
                href="https://app.cognee.ai"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                app.cognee.ai
              </a>
              .
            </p>
          </div>

          {/* OpenAI */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">OpenAI</p>
                  <p className="text-xs text-muted-foreground">
                    LLM provider — powers chat completions
                  </p>
                </div>
              </div>
              {settings.openaiApiKey && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-medium text-green-700 dark:text-green-400">
                  <span className="size-1.5 rounded-full bg-green-500" /> Connected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type={showOpenai ? 'text' : 'password'}
                placeholder="sk-..."
                value={settings.openaiApiKey}
                onChange={(e) => update({ openaiApiKey: e.target.value })}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowOpenai((v) => !v)}
                aria-label={showOpenai ? 'Hide key' : 'Show key'}
              >
                <Eye className={cn('size-4', showOpenai && 'text-primary')} />
              </Button>
              <Button onClick={handleSaveOpenai} className="gap-1.5">
                {savedOpenai ? (
                  <>
                    <Check className="size-4" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="size-4" /> Save
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                platform.openai.com/api-keys
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SettingsDialog
