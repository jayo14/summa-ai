'use client'

import * as React from 'react'
import { v4 as uuid } from 'uuid'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from '@/components/prompt-kit/prompt-input'
import { PromptSuggestion } from '@/components/prompt-kit/prompt-suggestion'
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from '@/components/prompt-kit/message'
import {
  ChatContainerRoot,
  ChatContainerContent,
} from '@/components/prompt-kit/chat-container'
import { Loader } from '@/components/prompt-kit/loader'
import { TextShimmer } from '@/components/prompt-kit/text-shimmer'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/prompt-kit/reasoning'
import { FileUpload, FileUploadTrigger, FileUploadContent } from '@/components/prompt-kit/file-upload'
import { ChartRadarDefault } from '@/components/prompt-kit/chart-radar-default'
import { OnboardingFlow, type OnboardingData } from '@/components/prompt-kit/onboarding-flow'
import { LandingPage } from '@/components/landing-page'
import { SettingsDialog } from '@/components/prompt-kit/settings-dialog'
import { SummaLogo } from '@/components/prompt-kit/summa-logo'
import {
  detectIntent,
  SAMPLE_COMPONENTS,
  COMPONENT_TRIGGERS,
  type ChatComponentType,
} from '@/components/prompt-kit/chat-components'
import { ResourcesView } from '@/components/prompt-kit/resources-view'
import { AnalyticsView } from '@/components/prompt-kit/analytics-view'
import { KnowledgeBaseView } from '@/components/prompt-kit/knowledge-base-view'
import { CanvasPanel } from '@/components/prompt-kit/canvas-panel'
import { useCanvasStore } from '@/hooks/use-canvas'
import { WorkspacePanel } from '@/components/prompt-kit/workspace-panel'
import { useWorkspaceStore, useRecentArtifacts, usePinnedArtifacts, type ArtifactSource } from '@/hooks/use-workspace'
import { TimelineView } from '@/components/prompt-kit/timeline-view'

import { useChat, type UseChatMessage } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'
import {
  ArrowUp,
  Square,
  Paperclip,
  Plus,
  Sparkles,
  Brain,
  Lightbulb,
  Calendar,
  BookOpen,
  Sun,
  Moon,
  Github,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  MessageSquare,
  Network,
  MoreVertical,
  User as UserIcon,
  Settings,
  LogOut,
  Palette,
  HelpCircle,
  LogIn,
  PanelLeft,
  Library,
  BarChart3,
  Database,
  PanelRight,
  X,
  Clock,
  Pin,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface AttachmentItem {
  id: string
  name: string
  size?: number
  type?: string
  url?: string
}

interface ChatListItem {
  id: string
  title: string
  snippet?: string
  updatedAt?: number
}

interface UserProfile {
  name: string
  email: string
  avatar?: string
}

/* ------------------------------------------------------------------ */
/* Suggestions                                                         */
/* ------------------------------------------------------------------ */

const STARTER_PROMPTS: { icon: React.ReactNode; label: string; prompt: string }[] = [
  {
    icon: <Brain className="size-3.5" />,
    label: 'Explain transformers',
    prompt:
      "I'm a master's student new to NLP. Can you explain how Transformers work, and tell me what prerequisites I should already know?",
  },
  {
    icon: <Lightbulb className="size-3.5" />,
    label: 'Find my knowledge gaps',
    prompt:
      "Based on what I know about linear algebra, what concepts am I likely missing before I tackle graph neural networks?",
  },
  {
    icon: <Calendar className="size-3.5" />,
    label: 'Plan exam prep',
    prompt:
      "My NLP final is in 6 weeks and I've only studied up to word embeddings. Build me a 6-week study plan that fills my gaps in time.",
  },
  {
    icon: <BookOpen className="size-3.5" />,
    label: 'Quiz me',
    prompt:
      "Quiz me on the difference between LSTM and GRU. Start with 3 short questions and wait for my answers before explaining.",
  },
]

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

function useThemeToggle() {
  const [isDark, setIsDark] = React.useState(false)
  React.useEffect(() => {
    const stored = localStorage.getItem('summa-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored ? stored === 'dark' : prefersDark
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])
  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('summa-theme', next ? 'dark' : 'light')
  }
  return { isDark, toggle }
}

/* ------------------------------------------------------------------ */
/* Auth (mock)                                                         */
/* ------------------------------------------------------------------ */

const DEMO_USER: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex@summa.ai',
}

function useAuth() {
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [onboarded, setOnboarded] = React.useState<boolean>(false)
  const [onboardingData, setOnboardingData] = React.useState<OnboardingData | null>(null)
  React.useEffect(() => {
    const stored = localStorage.getItem('summa-user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        /* ignore */
      }
    }
    setOnboarded(localStorage.getItem('summa-onboarded') === 'true')
    const storedOnb = localStorage.getItem('summa-onboarding-data')
    if (storedOnb) {
      try {
        const parsed = JSON.parse(storedOnb)
        // Revive Date objects in exams
        if (parsed.exams) {
          parsed.exams = parsed.exams.map((e: any) => ({
            ...e,
            date: e.date ? new Date(e.date) : undefined,
          }))
        }
        setOnboardingData(parsed)
      } catch {
        /* ignore */
      }
    }
  }, [])
  const login = (profile: UserProfile = DEMO_USER) => {
    setUser(profile)
    localStorage.setItem('summa-user', JSON.stringify(profile))
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('summa-user')
  }
  const completeOnboarding = (data?: OnboardingData) => {
    setOnboarded(true)
    localStorage.setItem('summa-onboarded', 'true')
    if (data) {
      setOnboardingData(data)
      localStorage.setItem('summa-onboarding-data', JSON.stringify(data))
    }
  }
  const updateOnboardingData = (patch: Partial<OnboardingData>) => {
    setOnboardingData((prev) => {
      const next = { ...(prev ?? ({} as OnboardingData)), ...patch }
      localStorage.setItem('summa-onboarding-data', JSON.stringify(next))
      return next
    })
  }
  const resetOnboarding = () => {
    setOnboarded(false)
    setOnboardingData(null)
    localStorage.removeItem('summa-onboarded')
    localStorage.removeItem('summa-onboarding-data')
  }
  return {
    user,
    login,
    logout,
    onboarded,
    onboardingData,
    completeOnboarding,
    updateOnboardingData,
    resetOnboarding,
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const {
    user,
    login,
    logout,
    onboarded,
    onboardingData,
    completeOnboarding,
    updateOnboardingData,
    resetOnboarding,
  } = useAuth()
  const { isDark, toggle: toggleTheme } = useThemeToggle()

  if (!user) {
    return <RedirectToHome />
  }

  if (!onboarded) {
    return (
      <OnboardingFlow
        initialData={onboardingData ?? undefined}
        onComplete={(data) => {
          // In a real app we'd persist `data` to the backend. Here we merge
          // any updated name/avatar into the user profile.
          if (data.name) login({ ...user, name: data.name, avatar: data.avatar ?? user.avatar })
          completeOnboarding(data)
        }}
        onSkip={() => completeOnboarding(onboardingData ?? undefined)}
      />
    )
  }

  return (
    <AppShell
      user={user}
      onLogout={logout}
      onResetOnboarding={resetOnboarding}
      onboardingData={onboardingData}
      onUpdateUser={(patch) => login({ ...user, ...patch })}
      onUpdateOnboarding={updateOnboardingData}
      isDark={isDark}
      onToggleTheme={toggleTheme}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Login screen (unauthenticated state)                                */
/* ------------------------------------------------------------------ */

function LoginScreen({
  onLogin,
  isDark,
  onToggleTheme,
}: {
  onLogin: () => void
  isDark: boolean
  onToggleTheme: () => void
}) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.12), transparent 70%)',
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleTheme}
        className="absolute right-4 top-4"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <div className="relative z-10 w-full max-w-md rounded-3xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Sparkles className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to <span className="text-primary">Summa AI</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The learning companion that never forgets. Sign in to access your adaptive tutor,
            knowledge graph, and exam-prep roadmap.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={onLogin} className="w-full" size="lg">
            <LogIn className="size-4" /> Sign in to Summa AI
          </Button>
          <div className="relative py-2 text-center">
            <span className="relative z-10 bg-card px-2 text-xs text-muted-foreground">
              or continue with
            </span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onLogin}>
              <Github className="size-4" /> GitHub
            </Button>
            <Button variant="outline" onClick={onLogin}>
              <MailIcon /> Email
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* App shell (logged-in state)                                         */
/* ------------------------------------------------------------------ */

function AppShell({
  user,
  onLogout,
  onResetOnboarding,
  onboardingData,
  onUpdateUser,
  onUpdateOnboarding,
  isDark,
  onToggleTheme,
}: {
  user: UserProfile
  onLogout: () => void
  onResetOnboarding: () => void
  onboardingData: OnboardingData | null
  onUpdateUser: (patch: Partial<UserProfile>) => void
  onUpdateOnboarding: (patch: Partial<OnboardingData>) => void
  isDark: boolean
  onToggleTheme: () => void
}) {
  const [input, setInput] = React.useState('')
  const [attachments, setAttachments] = React.useState<AttachmentItem[]>([])
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [chats, setChats] = React.useState<ChatListItem[]>([
    {
      id: 'c1',
      title: 'Transformers deep dive',
      snippet: 'How attention works…',
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 'c2',
      title: 'Calculus II review',
      snippet: 'Integration by parts…',
      updatedAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'c3',
      title: 'Guitar theory: modes',
      snippet: 'Ionian vs Dorian…',
      updatedAt: Date.now() - 5 * 86400000,
    },
  ])
  const [activeChatId, setActiveChatId] = React.useState<string | undefined>(undefined)
  const [view, setView] = React.useState<'chat' | 'graph' | 'resources' | 'analytics' | 'knowledge' | 'timeline'>('chat')

  const { messages, status, isLoading, send, stop, regenerate, reset } = useChat({
    enableThinking: true,
  })

  // Workspace store — artifacts are created here and displayed in the
  // workspace panel. Only one artifact is active at a time; previous ones
  // are automatically saved to history (Resources).
  const workspaceStore = useWorkspaceStore()
  const recentArtifacts = useRecentArtifacts(5)
  const pinnedArtifacts = usePinnedArtifacts()

  /* ---------- orchestrator ---------- */
  /**
   * The orchestrator decides what to do with the user's message.
   * Instead of always generating a component, it chooses between:
   *  - reply normally (no artifact)
   *  - generate a new artifact (opens in workspace)
   *  - update the active artifact (new version)
   *  - suggest an artifact (Open / Save for Later / Discard)
   */
  const orchestrate = (text: string): { action: 'reply' | 'generate' | 'suggest'; componentType?: ChatComponentType; message?: string } => {
    const intent = detectIntent(text)

    // If there's already an active artifact and the user says "make it harder"
    // or "turn this into flashcards", update the existing artifact.
    const updatePatterns = [
      /\b(make it|turn this|convert|change|update|harder|easier)\b/i,
      /\b(only multiple choice|add more|remove)\b/i,
    ]
    if (workspaceStore.activeArtifactId && updatePatterns.some((p) => p.test(text))) {
      // Check if the user wants to convert to a different type
      if (intent) {
        return { action: 'generate', componentType: intent, message: `Updated from ${workspaceStore.activeArtifactId ? 'previous artifact' : 'conversation'}` }
      }
      return { action: 'reply' }
    }

    // If intent is detected, generate a new artifact
    if (intent) {
      // Smart suggestion: for certain intents, suggest instead of auto-opening
      const suggestPatterns = [/\bshow\b.*\b(progress|graph|timeline|schedule)\b/i]
      if (suggestPatterns.some((p) => p.test(text))) {
        return { action: 'suggest', componentType: intent, message: `I generated a ${intent.replace('-', ' ')} based on your conversation.` }
      }
      return { action: 'generate', componentType: intent }
    }

    // Default: just reply
    return { action: 'reply' }
  }

  /* ---------- send handlers ---------- */
  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isLoading) return

    // Run the orchestrator to decide what to do
    const decision = orchestrate(text)

    if (decision.action === 'generate' && decision.componentType) {
      const trigger = COMPONENT_TRIGGERS.find((t) => t.type === decision.componentType)!
      // Create a new artifact — this replaces the active one in the workspace.
      // The previous artifact is automatically kept in history.
      workspaceStore.createArtifact({
        title: trigger.label,
        component: SAMPLE_COMPONENTS[decision.componentType],
        source: 'conversation',
        sourceLabel: 'Conversation',
        changeNote: decision.message,
      })
    } else if (decision.action === 'suggest' && decision.componentType) {
      const trigger = COMPONENT_TRIGGERS.find((t) => t.type === decision.componentType)!
      // Create the artifact but add it as a suggestion instead of opening
      const id = workspaceStore.createArtifact({
        title: trigger.label,
        component: SAMPLE_COMPONENTS[decision.componentType],
        source: 'conversation',
        sourceLabel: 'Conversation',
      })
      // Immediately create a suggestion (artifact was already created above,
      // so we just need to add the suggestion wrapper)
      workspaceStore.addSuggestion(
        workspaceStore.artifacts.find((a) => a.id === id)!,
        decision.message ?? `I generated a ${trigger.label.toLowerCase()}.`,
      )
      // Close the workspace so the suggestion is the focus
      workspaceStore.close()
    }

    send(text)
    setInput('')
    setAttachments([])
  }

  /** Trigger a specific UI component from the Generate menu — creates an artifact. */
  const handleTriggerComponent = (type: ChatComponentType) => {
    if (isLoading) return
    const trigger = COMPONENT_TRIGGERS.find((t) => t.type === type)!
    workspaceStore.createArtifact({
      title: trigger.label,
      component: SAMPLE_COMPONENTS[type],
      source: 'manual-input',
      sourceLabel: 'Manual input',
    })
  }

  const handleSuggestion = (prompt: string) => {
    if (isLoading) return
    setInput(prompt)
  }

  /* ---------- attachments ---------- */
  const addFiles = (files: File[]) => {
    const items: AttachmentItem[] = files.map((f) => ({
      id: uuid(),
      name: f.name,
      size: f.size,
      type: f.type,
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }))
    setAttachments((prev) => [...prev, ...items])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const found = prev.find((a) => a.id === id)
      if (found?.url) URL.revokeObjectURL(found.url)
      return prev.filter((a) => a.id !== id)
    })
  }

  /* ---------- chat list ---------- */
  const newChat = () => {
    reset()
    setActiveChatId(undefined)
    setView('chat')
  }
  const selectChat = (id: string) => {
    setActiveChatId(id)
    setView('chat')
  }
  const openGraph = () => setView('graph')
  const openChat = () => setView('chat')
  const openResources = () => setView('resources')
  const openAnalytics = () => setView('analytics')
  const openKnowledge = () => setView('knowledge')
  const openTimeline = () => setView('timeline')
  const openSettings = () => setSettingsOpen(true)
  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id))
    if (activeChatId === id) newChat()
  }

  const showEmpty = messages.length === 0

  return (
    <FileUpload onFilesAdded={addFiles} multiple>
      {/* Drag overlay */}
      <FileUploadContent className="bg-primary/5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full border-2 border-dashed border-primary/60 p-6">
            <Paperclip className="size-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">Drop files to attach</p>
            <p className="text-sm text-muted-foreground">
              PDFs, images, and documents are supported.
            </p>
          </div>
        </div>
      </FileUploadContent>

      <SidebarProvider defaultOpen>
        <AppSidebar
          chats={chats}
          activeChatId={activeChatId}
          view={view}
          user={user}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onNewChat={newChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
          onOpenGraph={openGraph}
          onOpenChat={openChat}
          onOpenResources={openResources}
          onOpenAnalytics={openAnalytics}
          onOpenKnowledge={openKnowledge}
          onOpenTimeline={openTimeline}
          onOpenSettings={openSettings}
          recentArtifacts={recentArtifacts}
          pinnedArtifacts={pinnedArtifacts}
          onOpenArtifact={(id) => { workspaceStore.switchToArtifact(id); setView('chat') }}
          onLogout={onLogout}
          onResetOnboarding={onResetOnboarding}
        />
        <SidebarInset className="flex min-h-dvh flex-col">
          {/* Top bar */}
          <header className="flex items-center gap-3 border-b bg-background/80 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3">
            <SidebarTrigger className="size-8" />
            <div className="flex items-center gap-2">
              <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Sparkles className="size-4" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Summa AI</p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  The learning companion that never forgets
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={newChat} className="gap-1">
                <Plus className="size-3.5" /> New chat
              </Button>
              {/* Workspace toggle — only visible in chat view */}
              {view === 'chat' && (
                <Button
                  variant={workspaceStore.isOpen ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => workspaceStore.toggle()}
                  aria-label="Toggle workspace"
                  title="Toggle workspace"
                >
                  <PanelRight className="size-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                aria-label="Open settings"
              >
                <Settings className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Button asChild variant="ghost" size="icon" aria-label="GitHub">
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Github className="size-4" />
                </a>
              </Button>
            </div>
          </header>

          {view === 'graph' ? (
            <GraphView />
          ) : view === 'resources' ? (
            <ResourcesView />
          ) : view === 'analytics' ? (
            <AnalyticsView />
          ) : view === 'knowledge' ? (
            <KnowledgeBaseView />
          ) : view === 'timeline' ? (
            <TimelineView />
          ) : (
            /* Chat view with optional Workspace split panel */
            <div className="flex min-h-0 flex-1">
              {/* Chat column */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Conversation area */}
                {showEmpty ? (
                  <div className="relative flex-1 overflow-y-auto thin-scroll">
                    <EmptyState onPick={handleSuggestion} disabled={isLoading} />
                  </div>
                ) : (
                  <div className="relative flex-1">
                    <ChatContainerRoot className="h-full">
                      <ChatContainerContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-6">
                        {messages.map((m, i) => (
                          <ChatMessageBubble
                            key={i}
                            message={m}
                            isLast={i === messages.length - 1}
                            onRegenerate={m.role === 'assistant' ? regenerate : undefined}
                          />
                        ))}
                      </ChatContainerContent>
                    </ChatContainerRoot>
                  </div>
                )}

                {/* Composer */}
                <div className="border-t bg-background/80 px-3 pb-4 pt-3 backdrop-blur">
                  <div className="mx-auto w-full max-w-3xl">
                    {/* Attachments preview */}
                    {attachments.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {attachments.map((a) => (
                          <div
                            key={a.id}
                            className="group flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-xs"
                          >
                            <Paperclip className="size-3 text-muted-foreground" />
                            <span className="max-w-[180px] truncate">{a.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(a.id)}
                              className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                              aria-label={`Remove ${a.name}`}
                            >
                              <Plus className="size-3 rotate-45" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <PromptInput
                      value={input}
                      onValueChange={setInput}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                      className="rounded-3xl"
                    >
                      <PromptInputTextarea
                        placeholder={
                          isLoading ? 'Summa AI is responding…' : 'Ask Summa AI anything…'
                        }
                        disabled={isLoading}
                      />
                      <PromptInputActions className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <PromptInputAction tooltip="Attach file">
                            <FileUploadTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-full"
                                aria-label="Attach file"
                              >
                                <Paperclip className="size-4" />
                              </Button>
                            </FileUploadTrigger>
                          </PromptInputAction>
                          <PromptInputAction tooltip="Clear input">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full"
                              onClick={() => {
                                setInput('')
                                setAttachments([])
                              }}
                              disabled={!input && attachments.length === 0}
                              aria-label="Clear"
                            >
                              <Plus className="size-4 rotate-45" />
                            </Button>
                          </PromptInputAction>
                          {/* Generate menu — trigger any dynamic UI component (renders in Canvas) */}
                          <DropdownMenu>
                            <PromptInputAction tooltip="Generate component">
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-full"
                                  disabled={isLoading}
                                  aria-label="Generate component"
                                >
                                  <Sparkles className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </PromptInputAction>
                            <DropdownMenuContent align="start" side="top" className="w-72">
                              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Sparkles className="size-3.5" /> Generate to Workspace
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {COMPONENT_TRIGGERS.map((t) => (
                                <DropdownMenuItem
                                  key={t.type}
                                  onClick={() => handleTriggerComponent(t.type)}
                                  className="flex items-start gap-2.5 py-2"
                                >
                                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    {t.icon}
                                  </span>
                                  <span className="flex flex-col">
                                    <span className="text-sm font-medium">{t.label}</span>
                                    <span className="text-xs text-muted-foreground">{t.description}</span>
                                  </span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="hidden text-xs text-muted-foreground sm:inline">
                            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">Enter</kbd>{' '}
                            to send ·{' '}
                            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">
                              Shift+Enter
                            </kbd>{' '}
                            newline
                          </span>
                          {isLoading ? (
                            <Button
                              size="icon"
                              className="size-8 rounded-full"
                              onClick={stop}
                              aria-label="Stop"
                            >
                              <Square className="size-3.5 fill-current" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              className="size-8 rounded-full"
                              onClick={handleSubmit}
                              disabled={!input.trim()}
                              aria-label="Send"
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                          )}
                        </div>
                      </PromptInputActions>
                    </PromptInput>

                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      AI can make mistakes. Check important info. · Summa AI remembers your context
                      within this conversation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Workspace column — split panel on desktop (xl+), hidden on smaller screens */}
              {workspaceStore.isOpen && (
                <div className="hidden w-[480px] shrink-0 border-l xl:block 2xl:w-[560px]">
                  <WorkspacePanel />
                </div>
              )}
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>

      {/* Settings dialog — large on desktop, full page on mobile */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
        onboardingData={onboardingData ?? undefined}
        onUpdateUser={onUpdateUser}
        onUpdateOnboarding={onUpdateOnboarding}
        onLogout={onLogout}
      />

      {/* Mobile canvas — full-screen dialog on small screens only.
          On desktop (xl+), the canvas is a split panel in the main layout instead. */}
      <MobileWorkspaceDialog />
    </FileUpload>
  )
}

/* ------------------------------------------------------------------ */
/* Sidebar (shadcn, collapsible=offcanvas)                             */
/* ------------------------------------------------------------------ */

function AppSidebar({
  chats,
  activeChatId,
  view,
  user,
  isDark,
  onToggleTheme,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenGraph,
  onOpenChat,
  onOpenResources,
  onOpenAnalytics,
  onOpenKnowledge,
  onOpenTimeline,
  onOpenSettings,
  recentArtifacts,
  pinnedArtifacts,
  onOpenArtifact,
  onLogout,
  onResetOnboarding,
}: {
  chats: ChatListItem[]
  activeChatId?: string
  view: 'chat' | 'graph' | 'resources' | 'analytics' | 'knowledge' | 'timeline'
  user: UserProfile
  isDark: boolean
  onToggleTheme: () => void
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onOpenGraph: () => void
  onOpenChat: () => void
  onOpenResources: () => void
  onOpenAnalytics: () => void
  onOpenKnowledge: () => void
  onOpenTimeline: () => void
  onOpenSettings: () => void
  recentArtifacts: import('@/hooks/use-workspace').Artifact[]
  pinnedArtifacts: import('@/hooks/use-workspace').Artifact[]
  onOpenArtifact: (id: string) => void
  onLogout: () => void
  onResetOnboarding: () => void
}) {
  return (
    <Sidebar collapsible="offcanvas" className="bg-sidebar/60">
      <SidebarHeader className="px-4 pb-3 pt-5">
        {/* Brand row */}
        <div className="mb-4 flex items-center gap-2.5 px-1">
          <SummaLogo size={28} />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Summa AI</p>
            <p className="text-[11px] text-muted-foreground">Learning companion</p>
          </div>
        </div>
        <Button onClick={onNewChat} className="w-full justify-start">
          <Plus className="size-4" /> New chat
        </Button>
        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={view === 'graph'}
              onClick={onOpenGraph}
              tooltip="Graph"
            >
              <Network className="size-4" />
              <span>Graph</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Conversation history</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length === 0 ? (
                <li className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No conversations yet.
                </li>
              ) : (
                chats.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton
                      isActive={activeChatId === c.id && view === 'chat'}
                      onClick={() => onSelectChat(c.id)}
                      tooltip={c.title}
                    >
                      <MessageSquare className="size-4" />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{c.title}</span>
                        {c.snippet && (
                          <span className="truncate text-xs text-muted-foreground">
                            {c.snippet}
                          </span>
                        )}
                      </span>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(c.id)
                      }}
                      showOnHover
                      aria-label={`Delete ${c.title}`}
                    >
                      <Trash2 className="size-4" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dedicated pages navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === 'resources'}
                  onClick={onOpenResources}
                  tooltip="Resources"
                >
                  <Library className="size-4" />
                  <span>Resources</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === 'timeline'}
                  onClick={onOpenTimeline}
                  tooltip="Timeline"
                >
                  <Clock className="size-4" />
                  <span>Timeline</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === 'analytics'}
                  onClick={onOpenAnalytics}
                  tooltip="Analytics"
                >
                  <BarChart3 className="size-4" />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={view === 'knowledge'}
                  onClick={onOpenKnowledge}
                  tooltip="Knowledge Base"
                >
                  <Database className="size-4" />
                  <span>Knowledge Base</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onOpenSettings}
                  tooltip="Settings"
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pinned artifacts */}
        {pinnedArtifacts.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Pinned</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pinnedArtifacts.map((a) => (
                  <SidebarMenuItem key={a.id}>
                    <SidebarMenuButton onClick={() => onOpenArtifact(a.id)} tooltip={a.title}>
                      <Pin className="size-4 text-primary" />
                      <span className="truncate">{a.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Recent artifacts */}
        {recentArtifacts.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Recent Artifacts</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentArtifacts.map((a) => (
                  <SidebarMenuItem key={a.id}>
                    <SidebarMenuButton onClick={() => onOpenArtifact(a.id)} tooltip={a.title}>
                      <Sparkles className="size-4 text-muted-foreground" />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{a.title}</span>
                        <span className="truncate text-[10px] text-muted-foreground">
                          {a.type.replace('-', ' ')} · v{a.currentVersion}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                      {user.name
                        .split(' ')
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <MoreVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="flex flex-col gap-0.5 p-2 font-normal">
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenChat}>
                  <UserIcon className="size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleTheme}>
                  {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  {isDark ? 'Light mode' : 'Dark mode'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenSettings}>
                  <Palette className="size-4" /> Appearance & settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onResetOnboarding}>
                  <RefreshCw className="size-4" /> Redo onboarding
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="size-4" /> Help & support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

/* ------------------------------------------------------------------ */
/* Redirect to /home (landing page)                                    */
/* ------------------------------------------------------------------ */

function RedirectToHome() {
  React.useEffect(() => {
    window.location.href = '/home'
  }, [])
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="animate-spin rounded-full border-2 border-foreground border-t-transparent size-8" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile workspace dialog — only renders on screens < xl              */
/* ------------------------------------------------------------------ */

function MobileWorkspaceDialog() {
  const { isOpen, close } = useWorkspaceStore()
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // On desktop (xl+), the workspace is a split panel — don't render the dialog.
  if (!isMobile) return null

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent className="h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none gap-0 overflow-hidden p-0 sm:rounded-none">
        <DialogTitle className="sr-only">Workspace</DialogTitle>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Workspace</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Close workspace"
              className="size-8"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="thin-scroll flex-1 overflow-y-auto">
            <WorkspacePanel />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Chat message bubble                                                 */
/* ------------------------------------------------------------------ */

function ChatMessageBubble({
  message,
  isLast,
  onRegenerate,
}: {
  message: UseChatMessage
  isLast: boolean
  onRegenerate?: () => void
}) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <Message className="flex-row-reverse">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-secondary text-xs">You</AvatarFallback>
        </Avatar>
        <MessageContent className="bg-primary text-primary-foreground max-w-[78%]">
          {message.content}
        </MessageContent>
      </Message>
    )
  }

  const hasReasoning = !!message.reasoning && message.reasoning.trim().length > 0
  const empty = !message.content && !message.streaming && !hasReasoning

  return (
    <Message className="group">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary ring-1 ring-primary/20">
          <Sparkles className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Reasoning panel */}
        {hasReasoning && (
          <Reasoning isStreaming={message.reasoningActive} className="w-full">
            <ReasoningTrigger className="text-xs">
              {message.reasoningActive ? (
                <TextShimmer className="font-medium">Reasoning</TextShimmer>
              ) : (
                <span className="text-muted-foreground">Reasoning</span>
              )}
            </ReasoningTrigger>
            <ReasoningContent markdown>{message.reasoning || ''}</ReasoningContent>
          </Reasoning>
        )}

        {/* Thinking-only state: show loader before first content token */}
        {message.streaming && !message.content && !hasReasoning && (
          <div className="flex items-center gap-3 py-1">
            <Loader variant="text-shimmer" text="Thinking" size="sm" />
          </div>
        )}

        {/* Main content */}
        {message.content ? (
          <MessageContent markdown className="bg-secondary max-w-full">
            {message.content}
          </MessageContent>
        ) : message.streaming ? (
          <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
            <Loader variant="dots" size="sm" />
            <span>Generating response…</span>
          </div>
        ) : null}

        {/* Note: dynamic UI components (hexagon, quiz, flashcards, etc.) are
            now rendered in the Canvas panel, not inline in the chat. This keeps
            the chat flow clean and lets users interact with components while
            continuing the conversation. */}

        {empty && <p className="text-sm italic text-muted-foreground">No response.</p>}

        {/* Actions under the latest completed assistant turn */}
        {!message.streaming && message.content && isLast && (
          <div className="flex items-center gap-2">
            <MessageActions>
              <CopyAction text={message.content} />
              {onRegenerate && (
                <MessageAction tooltip="Regenerate response">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={onRegenerate}
                    aria-label="Regenerate response"
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                </MessageAction>
              )}
              <MessageAction tooltip="Good response">
                <Button variant="ghost" size="icon" className="size-7" aria-label="Good response">
                  <ThumbsUp className="size-3.5" />
                </Button>
              </MessageAction>
              <MessageAction tooltip="Bad response">
                <Button variant="ghost" size="icon" className="size-7" aria-label="Bad response">
                  <ThumbsDown className="size-3.5" />
                </Button>
              </MessageAction>
            </MessageActions>
          </div>
        )}
      </div>
    </Message>
  )
}

function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <MessageAction tooltip={copied ? 'Copied' : 'Copy'}>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label="Copy message"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          } catch {
            /* ignore */
          }
        }}
      >
        {copied ? (
          <Check className="size-3.5 text-green-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </MessageAction>
  )
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

function EmptyState({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void
  disabled?: boolean
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <Sparkles className="size-7" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Hi, I&apos;m <span className="text-primary">Summa AI</span>
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
        Your adaptive learning companion. Ask me to explain a concept, plan your exam prep,
        quiz you, or just remember what you&apos;ve learned.
      </p>

      <div className="mt-8 w-full max-w-2xl space-y-3 text-left">
        <p className="text-xs font-medium text-muted-foreground">Try one of these to get started</p>
        <div className="flex flex-col gap-1.5">
          {STARTER_PROMPTS.map((s) => (
            <PromptSuggestion
              key={s.label}
              variant="ghost"
              size="sm"
              highlight={s.label}
              className="justify-start rounded-xl"
              disabled={disabled}
              onClick={() => onPick(s.prompt)}
            >
              <span className="flex items-center gap-2">
                <span className="text-primary">{s.icon}</span>
                <span>{s.label}</span>
              </span>
            </PromptSuggestion>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Graph view                                                          */
/* ------------------------------------------------------------------ */

interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  mastery: 'mastered' | 'learning' | 'struggling' | 'gap'
}

interface GraphEdge {
  from: string
  to: string
}

const GRAPH_NODES: GraphNode[] = [
  { id: 'la', label: 'Linear Algebra', x: 180, y: 100, mastery: 'mastered' },
  { id: 'prob', label: 'Probability', x: 80, y: 220, mastery: 'mastered' },
  { id: 'calc', label: 'Calculus', x: 320, y: 60, mastery: 'mastered' },
  { id: 'ml', label: 'ML Fundamentals', x: 280, y: 240, mastery: 'learning' },
  { id: 'embed', label: 'Word Embeddings', x: 420, y: 200, mastery: 'learning' },
  { id: 'attn', label: 'Attention', x: 500, y: 320, mastery: 'struggling' },
  { id: 'tf', label: 'Transformers', x: 620, y: 260, mastery: 'gap' },
  { id: 'rnn', label: 'RNN / LSTM', x: 200, y: 380, mastery: 'learning' },
  { id: 'gnn', label: 'Graph Neural Nets', x: 540, y: 460, mastery: 'gap' },
]

const GRAPH_EDGES: GraphEdge[] = [
  { from: 'la', to: 'ml' },
  { from: 'prob', to: 'ml' },
  { from: 'calc', to: 'ml' },
  { from: 'ml', to: 'embed' },
  { from: 'ml', to: 'rnn' },
  { from: 'embed', to: 'attn' },
  { from: 'rnn', to: 'attn' },
  { from: 'attn', to: 'tf' },
  { from: 'embed', to: 'gnn' },
]

const MASTERY_STYLES: Record<
  GraphNode['mastery'],
  { fill: string; stroke: string; text: string; label: string; dot: string }
> = {
  mastered: {
    fill: 'bg-green-500/15 text-green-700 dark:text-green-400',
    stroke: 'border-green-500/40',
    text: 'text-green-600 dark:text-green-400',
    label: 'Mastered',
    dot: 'bg-green-500',
  },
  learning: {
    fill: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    stroke: 'border-yellow-500/40',
    text: 'text-yellow-600 dark:text-yellow-400',
    label: 'Learning',
    dot: 'bg-yellow-500',
  },
  struggling: {
    fill: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
    stroke: 'border-orange-500/40',
    text: 'text-orange-600 dark:text-orange-400',
    label: 'Struggling',
    dot: 'bg-orange-500',
  },
  gap: {
    fill: 'bg-red-500/15 text-red-700 dark:text-red-400',
    stroke: 'border-red-500/40',
    text: 'text-red-600 dark:text-red-400',
    label: 'Gap',
    dot: 'bg-red-500',
  },
}

function GraphView() {
  const [selected, setSelected] = React.useState<GraphNode | null>(null)
  const W = 760
  const H = 540

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:p-6">
      {/* Graph canvas */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-primary" />
            <p className="text-sm font-medium">Knowledge Graph</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {(['mastered', 'learning', 'struggling', 'gap'] as const).map((m) => (
              <span key={m} className="flex items-center gap-1.5">
                <span className={cn('inline-block size-2.5 rounded-full', MASTERY_STYLES[m].dot)} />
                <span className="text-muted-foreground">{MASTERY_STYLES[m].label}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="relative" style={{ minHeight: H }}>
          {/* Edges (SVG layer) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {GRAPH_EDGES.map((e, i) => {
              const a = GRAPH_NODES.find((n) => n.id === e.from)!
              const b = GRAPH_NODES.find((n) => n.id === e.to)!
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="stroke-border"
                  strokeWidth={1.5}
                  strokeDasharray={
                    a.mastery === 'gap' || b.mastery === 'gap' ? '4 3' : undefined
                  }
                />
              )
            })}
          </svg>
          {/* Nodes */}
          {GRAPH_NODES.map((n) => {
            const s = MASTERY_STYLES[n.mastery]
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected(n)}
                style={{
                  left: `${(n.x / W) * 100}%`,
                  top: `${(n.y / H) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={cn(
                  'absolute flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 hover:shadow-md',
                  s.fill,
                  s.stroke,
                  selected?.id === n.id && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                )}
              >
                {n.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right column: node inspector + proficiency radar */}
      <div className="flex w-full shrink-0 flex-col gap-4 md:w-80">
        {/* Proficiency radar chart */}
        <ChartRadarDefault />

        {/* Node inspector */}
        <aside className="rounded-2xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Node details</p>
          {selected ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{selected.label}</p>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    MASTERY_STYLES[selected.mastery].fill,
                  )}
                >
                  {MASTERY_STYLES[selected.mastery].label}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-muted-foreground">Prerequisites</p>
                <ul className="space-y-1">
                  {GRAPH_EDGES.filter((e) => e.to === selected.id).map((e, i) => {
                    const pre = GRAPH_NODES.find((n) => n.id === e.from)!
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-2 rounded-md bg-secondary px-2 py-1"
                      >
                        <span
                          className={cn(
                            'inline-block size-2 rounded-full',
                            MASTERY_STYLES[pre.mastery].dot,
                          )}
                        />
                        <span>{pre.label}</span>
                      </li>
                    )
                  })}
                  {GRAPH_EDGES.filter((e) => e.to === selected.id).length === 0 && (
                    <li className="text-muted-foreground">No prerequisites</li>
                  )}
                </ul>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-muted-foreground">Leads to</p>
                <ul className="space-y-1">
                  {GRAPH_EDGES.filter((e) => e.from === selected.id).map((e, i) => {
                    const nxt = GRAPH_NODES.find((n) => n.id === e.to)!
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-2 rounded-md bg-secondary px-2 py-1"
                      >
                        <span
                          className={cn(
                            'inline-block size-2 rounded-full',
                            MASTERY_STYLES[nxt.mastery].dot,
                          )}
                        />
                        <span>{nxt.label}</span>
                      </li>
                    )
                  })}
                  {GRAPH_EDGES.filter((e) => e.from === selected.id).length === 0 && (
                    <li className="text-muted-foreground">No advanced topics</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Click any node in the graph to inspect its prerequisites and what it leads to.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
