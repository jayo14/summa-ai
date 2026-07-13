"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  ArrowUp,
  BookOpen,
  Calendar,
  Copy,
  LogOut,
  Moon,
  Plus,
  FolderOpen,
  Settings,
  Sparkles,
  Sun,
  Workflow,
  X,
  MessageSquare,
  History,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PromptInput, PromptInputActions, PromptInputTextarea } from "@/components/prompt-kit/prompt-input"
import { PromptSuggestion } from "@/components/prompt-kit/prompt-suggestion"
import { ChatContainerContent, ChatContainerRoot } from "@/components/prompt-kit/chat-container"
import { Loader } from "@/components/prompt-kit/loader"
import { Message, MessageActions, MessageAction, MessageContent } from "@/components/prompt-kit/message"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/prompt-kit/reasoning"
import { SummaLogo } from "@/components/prompt-kit/summa-logo"
import { SettingsDialog } from "@/components/prompt-kit/settings-dialog"
import { WorkspacePanel } from "@/components/prompt-kit/workspace-panel"
import { FocusRing } from "@/components/focus-ring"
import type { OnboardingData } from "@/components/prompt-kit/onboarding-flow"
import { useChat, type UseChatMessage } from "@/hooks/use-chat"
import { useWorkspaceStore } from "@/hooks/use-workspace"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { fastapiFetch, type FastapiConversation, type FastapiMessage } from "@/lib/fastapi"
import { getOnboardingData, isOnboarded, setOnboardingData } from "@/lib/onboarding"

const STARTER_PROMPTS = [
  "Explain transformers at my level.",
  "Create a 2-week study plan for my exam.",
  "Quiz me on attention mechanisms.",
]

function useThemeMode() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("summa-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const next = stored ? stored === "dark" : prefersDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setIsDark((current) => {
      const next = !current
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem("summa-theme", next ? "dark" : "light")
      return next
    })
  }, [])

  return { isDark, toggleTheme }
}

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "Learner"
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function titleFromPrompt(prompt: string) {
  const words = prompt.trim().split(/\s+/).slice(0, 6)
  return words.join(" ").replace(/[.?!]+$/, "")
}

function mapBackendMessages(messages: FastapiMessage[]): UseChatMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    reasoning: message.reasoning ?? undefined,
    components: Array.isArray(message.components) ? (message.components as UseChatMessage["components"]) : undefined,
  }))
}

function buildDefaultOnboardingData({
  name,
  email,
  avatar,
}: {
  name: string
  email: string
  avatar?: string
}): OnboardingData {
  return {
    name,
    email,
    avatar,
    degree: "",
    field: "",
    year: "",
    learningStyle: null,
    stylePrefs: { visual: 50, auditory: 50, kinesthetic: 50 },
    goals: "",
    exams: [],
    personality: {},
  }
}

export function ChatWorkspace() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { isDark, toggleTheme } = useThemeMode()
  const [conversations, setConversations] = React.useState<FastapiConversation[]>([])
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null)
  const [input, setInput] = React.useState("")
  const [loadingConversations, setLoadingConversations] = React.useState(false)
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [onboardingData, setOnboardingState] = React.useState<OnboardingData | null>(null)

  const userId = session?.user?.id || session?.user?.email || ""
  const activeConversationFromQuery = searchParams.get("id")
  const conversationIdRef = React.useRef<string | null>(null)
  const skipNextMessageLoadRef = React.useRef(false)
  const isMobile = useIsMobile()
  const workspaceOpen = useWorkspaceStore((s) => s.isOpen)
  const closeWorkspace = useWorkspaceStore((s) => s.close)

  const loadConversations = React.useCallback(async () => {
    if (!userId) return
    setLoadingConversations(true)
    try {
      const data = await fastapiFetch<FastapiConversation[]>(`/conversations?user_id=${encodeURIComponent(userId)}`)
      setConversations(data)
    } catch {
      setConversations([])
    } finally {
      setLoadingConversations(false)
    }
  }, [userId])

  const persistMessage = React.useCallback(
    async (conversationId: string, message: UseChatMessage) => {
      await fastapiFetch(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          reasoning: message.reasoning ?? null,
          components: message.components ?? null,
        }),
      })
    },
    [],
  )

  const {
    messages,
    setMessages,
    send,
    stop,
    isLoading,
  } = useChat({
    api: "/api/chat",
    userId,
    conversationId: activeConversationId ?? undefined,
    onDone: async (history) => {
      const conversationId = conversationIdRef.current
      if (!conversationId || history.length < 2) return
      const userMessage = history[history.length - 2]
      const assistantMessage = history[history.length - 1]
      if (!userMessage || !assistantMessage) return
      if (userMessage.role !== "user" || assistantMessage.role !== "assistant") return

      try {
        await persistMessage(conversationId, userMessage)
        await persistMessage(conversationId, assistantMessage)
        await loadConversations()
      } catch {
        // Persistence is best-effort so the live conversation never breaks.
      }
    },
  })

  const loadConversationMessages = React.useCallback(
    async (conversationId: string) => {
      try {
        const data = await fastapiFetch<FastapiMessage[]>(`/conversations/${conversationId}/messages`)
        setMessages(mapBackendMessages(data))
      } catch {
        setMessages([])
      }
    },
    [],
  )

  React.useEffect(() => {
    conversationIdRef.current = activeConversationId
  }, [activeConversationId])

  React.useEffect(() => {
    if (!userId) return
    setOnboardingState(getOnboardingData(userId) as OnboardingData | null)
  }, [userId])

  React.useEffect(() => {
    const nextConversationId = activeConversationFromQuery || null
    if (nextConversationId === activeConversationId) return
    setActiveConversationId(nextConversationId)
    conversationIdRef.current = nextConversationId
    if (!nextConversationId) {
      setMessages([])
    }
  }, [activeConversationFromQuery, activeConversationId, setMessages])

  React.useEffect(() => {
    if (status !== "authenticated") return
    const userId = session?.user?.id || session?.user?.email || ""
    if (userId && !isOnboarded(userId)) {
      router.replace("/onboarding")
      return
    }
    void loadConversations()
  }, [loadConversations, router, session?.user?.email, session?.user?.id, status])

  React.useEffect(() => {
    if (!activeConversationId) {
      setMessages([])
      return
    }
    if (skipNextMessageLoadRef.current) {
      skipNextMessageLoadRef.current = false
      return
    }
    void loadConversationMessages(activeConversationId)
  }, [activeConversationId, loadConversationMessages, setMessages])

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in")
    }
  }, [router, setMessages, status])

  const createConversation = React.useCallback(
    async (prompt: string) => {
      const created = await fastapiFetch<FastapiConversation>(`/conversations?user_id=${encodeURIComponent(userId)}`, {
        method: "POST",
        body: JSON.stringify({
          title: titleFromPrompt(prompt),
          snippet: prompt.slice(0, 120),
        }),
      })
      setConversations((prev) => [created, ...prev.filter((item) => item.id !== created.id)])
      skipNextMessageLoadRef.current = true
      setActiveConversationId(created.id)
      conversationIdRef.current = created.id
      router.replace(`/chat?id=${encodeURIComponent(created.id)}`)
      return created
    },
    [router, userId],
  )

  const handleSubmit = React.useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || !userId) return

    let conversationId = activeConversationId
    if (!conversationId) {
      try {
        const created = await createConversation(trimmed)
        conversationId = created.id
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : "Unable to create a conversation")
        return
      }
    }

    conversationIdRef.current = conversationId
    send(trimmed, undefined, conversationId)
    setInput("")
  }, [activeConversationId, createConversation, input, isLoading, send, userId])

  const handleNewChat = React.useCallback(() => {
    router.push("/chat")
    setActiveConversationId(null)
    conversationIdRef.current = null
    setMessages([])
    setInput("")
  }, [router, setMessages])

  const goTo = React.useCallback(
    (path: string) => {
      router.push(path)
    },
    [router],
  )

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader variant="dots" text="Loading session" />
      </div>
    )
  }

  const currentUser = session?.user
  if (!currentUser) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader variant="dots" text="Loading session" />
      </div>
    )
  }

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId)
  const displayName = onboardingData?.name?.trim() || currentUser.name || currentUser.email || "Learner"

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="offcanvas" className="border-r border-border/40">
        <SidebarHeader className="border-b border-border/30 px-4 py-5">
          <div className="flex items-center gap-3">
            <SummaLogo size={28} />
            <div>
              <div className="text-sm font-semibold tracking-tight font-serif">Summa AI</div>
              <div className="text-[11px] text-muted-foreground">Your learning workspace</div>
            </div>
          </div>
          <Button className="mt-4 w-full justify-start gap-2 rounded-[10px] h-9 text-sm font-medium" onClick={handleNewChat}>
            <Plus className="size-4" />
            New chat
          </Button>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 px-2">
              Study sessions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {loadingConversations ? (
                  <div className="px-2 py-3 text-xs text-muted-foreground">Loading conversations…</div>
                ) : conversations.length === 0 ? (
                  <div className="px-2 py-6 text-xs text-muted-foreground text-center">
                    <History className="size-8 mx-auto mb-2 text-muted-foreground/30" />
                    No saved conversations yet.
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton
                        isActive={conversation.id === activeConversationId}
                        onClick={() => router.push(`/chat?id=${encodeURIComponent(conversation.id)}`)}
                        tooltip={conversation.title}
                        className="rounded-[10px] text-sm h-auto py-2 data-[active=true]:bg-summa-accent/10 data-[active=true]:text-summa-accent"
                      >
                        <MessageSquare className="size-4 shrink-0" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium">{conversation.title}</span>
                          {conversation.snippet ? (
                            <span className="truncate text-xs text-muted-foreground">{conversation.snippet}</span>
                          ) : null}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 px-2">
              Learning pages
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/progress"}
                    onClick={() => goTo("/progress")}
                    tooltip="Progress"
                    className="rounded-[10px] text-sm h-9 data-[active=true]:bg-summa-accent/10 data-[active=true]:text-summa-accent"
                  >
                    <span className="flex size-4 items-center justify-center">◌</span>
                    <span>Progress</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/saved-materials"}
                    onClick={() => goTo("/saved-materials")}
                    tooltip="Saved materials"
                    className="rounded-[10px] text-sm h-9 data-[active=true]:bg-summa-accent/10 data-[active=true]:text-summa-accent"
                  >
                    <FolderOpen className="size-4" />
                    <span>Saved materials</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/concept-map"}
                    onClick={() => goTo("/concept-map")}
                    tooltip="Concept map"
                    className="rounded-[10px] text-sm h-9 data-[active=true]:bg-summa-accent/10 data-[active=true]:text-summa-accent"
                  >
                    <Workflow className="size-4" />
                    <span>Concept map</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/study-timeline"}
                    onClick={() => goTo("/study-timeline")}
                    tooltip="Study timeline"
                    className="rounded-[10px] text-sm h-9 data-[active=true]:bg-summa-accent/10 data-[active=true]:text-summa-accent"
                  >
                    <Calendar className="size-4" />
                    <span>Study timeline</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/30 p-4">
          <div className="flex items-center gap-3 rounded-[10px] border border-border/30 bg-muted/20 p-3">
            <Avatar className="size-9 ring-2 ring-border/30">
              <AvatarImage src={onboardingData?.avatar ?? currentUser.image ?? undefined} alt={displayName} />
              <AvatarFallback className="text-xs font-medium">{initials(displayName, currentUser.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{displayName}</div>
              <div className="truncate text-xs text-muted-foreground">{currentUser.email}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 rounded-[8px] h-8 text-xs" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-3.5" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 rounded-[8px] h-8 text-xs" onClick={toggleTheme}>
              {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              {isDark ? "Light" : "Dark"}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 rounded-[8px] h-8 text-xs" onClick={() => void signOut({ callbackUrl: "/home" })}>
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex min-h-dvh flex-col">
        <header className="flex items-center gap-3 border-b border-border/30 bg-background/80 backdrop-blur-sm px-4 py-3">
          <SidebarTrigger className="size-8 rounded-[8px] text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight font-serif">
              {activeConversation?.title ?? "New chat"}
            </div>
            <div className="text-xs text-muted-foreground">
              Connected as {displayName}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-[8px] border border-border/30 bg-muted/30 px-3 py-1 text-xs text-muted-foreground md:inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500"></span>
              Study mode
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Account menu">
                  <Avatar className="size-7">
                    <AvatarImage src={onboardingData?.avatar ?? currentUser.image ?? undefined} alt={displayName} />
                    <AvatarFallback className="text-[10px]">{initials(displayName, currentUser.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <Avatar className="size-9">
                    <AvatarImage src={onboardingData?.avatar ?? currentUser.image ?? undefined} alt={displayName} />
                    <AvatarFallback>{initials(displayName, currentUser.email)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{displayName}</div>
                    <div className="truncate text-xs text-muted-foreground">{currentUser.email}</div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="size-4" /> Account settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open("https://summastudy.ai", "_blank")}>
                  <BookOpen className="size-4" /> Switch to SummaStudy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs text-muted-foreground">Theme</span>
                  <Button variant="ghost" size="icon" className="size-7" onClick={toggleTheme} aria-label="Toggle theme">
                    {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                  </Button>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/home" })}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 w-full flex-1 flex-col px-4 py-4 md:px-6">
              {authError ? (
                <div className="mb-4 rounded-[10px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {authError}
                </div>
              ) : null}

              <div className="flex-1 overflow-hidden rounded-2xl border border-border/30 bg-card/60 shadow-sm">
                <ChatContainerRoot className="h-full">
                  <ChatContainerContent className="gap-5 p-4 md:p-6">
                    {messages.length === 0 ? (
                      <EmptyChatState onPick={setInput} />
                    ) : (
                      messages.map((message, index) => (
                        <ChatBubble
                          key={`${message.role}-${index}`}
                          message={message}
                          isLast={index === messages.length - 1}
                        />
                      ))
                    )}
                  </ChatContainerContent>
                </ChatContainerRoot>
              </div>

              <div className="pt-4">
                <PromptInput
                  value={input}
                  onValueChange={setInput}
                  onSubmit={() => void handleSubmit()}
                  isLoading={isLoading}
                  className="border-border/30 bg-card/95 shadow-sm rounded-[14px]"
                >
                  <PromptInputTextarea
                    placeholder="Ask Summa AI anything about your studies..."
                    disabled={isLoading}
                  />
                  <PromptInputActions className="mt-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 rounded-[8px] text-xs h-8"
                        onClick={() => {
                          setInput(STARTER_PROMPTS[0])
                        }}
                      >
                        <Sparkles className="size-3.5" />
                        Suggestion
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <Button variant="outline" size="sm" className="rounded-[8px] h-8 text-xs" onClick={stop}>
                          Stop
                        </Button>
                      ) : (
                        <Button size="sm" className="gap-2 rounded-[8px] px-4 h-8 text-xs font-medium" onClick={() => void handleSubmit()} disabled={!input.trim()}>
                          <ArrowUp className="size-3.5" />
                          Send
                        </Button>
                      )}
                    </div>
                  </PromptInputActions>
                </PromptInput>
              </div>
            </div>
          </main>

          <aside className="hidden w-[420px] shrink-0 border-l border-border/30">
            <WorkspacePanel />
          </aside>
        </div>
      </SidebarInset>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={{
          name: displayName,
          email: onboardingData?.email ?? currentUser.email ?? "",
          avatar: onboardingData?.avatar ?? currentUser.image ?? undefined,
        }}
        onboardingData={onboardingData ?? undefined}
        onUpdateUser={(patch) => {
          if (!userId) return
          const next = {
            ...(onboardingData ??
              buildDefaultOnboardingData({
                name: displayName,
                email: currentUser.email ?? "",
                avatar: currentUser.image ?? undefined,
              })),
            name: patch.name ?? onboardingData?.name ?? displayName,
            email: patch.email ?? onboardingData?.email ?? currentUser.email ?? "",
            avatar: onboardingData?.avatar ?? currentUser.image ?? undefined,
          }
          setOnboardingData(userId, next)
          setOnboardingState(next)
        }}
        onUpdateOnboarding={(patch) => {
          if (!userId) return
          const next = {
            ...(onboardingData ??
              buildDefaultOnboardingData({
                name: displayName,
                email: currentUser.email ?? "",
                avatar: currentUser.image ?? undefined,
              })),
            ...patch,
          }
          setOnboardingData(userId, next)
          setOnboardingState(next)
        }}
        onLogout={() => void signOut({ callbackUrl: "/home" })}
      />

      {isMobile && workspaceOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <WorkspacePanel onClose={closeWorkspace} />
        </div>
      )}
    </SidebarProvider>
  )
}

function ChatBubble({ message, isLast }: { message: UseChatMessage; isLast: boolean }) {
  const isUser = message.role === "user"
  const hasReasoning = Boolean(message.reasoning?.trim())

  return (
    <Message className={cn(isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="size-8 shrink-0 ring-2 ring-border/20">
        <AvatarFallback className={cn(isUser ? "bg-summa-accent text-white" : "bg-muted")}>
          {isUser ? "U" : <Sparkles className="size-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {hasReasoning ? (
          <Reasoning isStreaming={message.reasoningActive}>
            <ReasoningTrigger className="text-xs text-muted-foreground">
              {message.reasoningActive ? "Thinking" : "Reasoning"}
            </ReasoningTrigger>
            <ReasoningContent markdown>{message.reasoning ?? ""}</ReasoningContent>
          </Reasoning>
        ) : null}

        {message.streaming && !message.content ? (
          <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
            <Loader variant="dots" size="sm" />
            <span>Thinking…</span>
          </div>
        ) : null}

        {message.content ? (
          <MessageContent markdown className={cn(
            "max-w-full rounded-[10px] px-4 py-2.5",
            isUser ? "bg-summa-accent text-white" : "bg-muted/50",
          )}>
            {message.content}
          </MessageContent>
        ) : null}

        {message.error ? (
          <div className="rounded-[8px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {message.error}
          </div>
        ) : null}

        {!message.streaming && message.content && isLast ? (
          <MessageActions>
            <CopyAction text={message.content} />
          </MessageActions>
        ) : null}
      </div>
    </Message>
  )
}

function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  return (
    <MessageAction tooltip={copied ? "Copied" : "Copy"}>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
          } catch {
            setCopied(false)
          }
        }}
      >
        <Copy className="size-3.5" />
      </Button>
    </MessageAction>
  )
}

function EmptyChatState({ onPick }: { onPick: (value: string) => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-4 text-center">
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center gap-1">
          <FocusRing value={15} size="sm" state="active" aria-label="Streak progress">
            <span className="text-[10px] font-bold tabular-nums text-foreground">1</span>
          </FocusRing>
          <span className="text-[10px] text-muted-foreground">Day streak</span>
        </div>
        <FocusRing size="lg" state="idle" aria-label="Hi, I'm Summa AI">
          <Sparkles className="size-6 text-summa-accent" />
        </FocusRing>
        <div className="flex flex-col items-center gap-1">
          <FocusRing value={0} size="sm" state="idle" aria-label="Topics mastered">
            <span className="text-[10px] font-bold tabular-nums text-foreground">0</span>
          </FocusRing>
          <span className="text-[10px] text-muted-foreground">Mastered</span>
        </div>
      </div>

      <motion.h1
        className="mt-6 text-3xl tracking-tight md:text-4xl font-serif font-medium"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.035 } },
        }}
      >
        {"Ask, study, and learn with Summa AI".split(" ").map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="mr-2 inline-block"
            variants={{
              hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>
      <motion.p
        className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
      >
        Keep your questions, study plans, and progress in one place as you learn.
      </motion.p>

      <div className="mt-8 grid w-full max-w-2xl gap-2 md:grid-cols-3">
        {STARTER_PROMPTS.map((prompt) => (
          <PromptSuggestion
            key={prompt}
            variant="outline"
            size="sm"
            className="justify-start rounded-[10px] px-4 py-3 text-left border-border/30 hover:border-summa-accent/30 hover:bg-summa-accent/5 transition-all"
            onClick={() => onPick(prompt)}
          >
            {prompt}
          </PromptSuggestion>
        ))}
      </div>
    </div>
  )
}
