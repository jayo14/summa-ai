"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/use-supabase-auth"
import { BarChart3, BookOpen, Calendar, FolderOpen, Layers, LogOut, Moon, Plus, Settings, Sparkles, Sun, Trophy, Workflow } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { Loader } from "@/components/prompt-kit/loader"
import { SettingsDialog } from "@/components/prompt-kit/settings-dialog"
import { ErrorBoundary } from "@/components/error-boundary"
import { isOnboarded } from "@/lib/onboarding"

type DashboardPageShellProps = {
  title: string
  description: string
  activePath: string
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/saved-materials", label: "Saved materials", icon: FolderOpen },
  { href: "/concept-map", label: "Concept map", icon: Workflow },
  { href: "/study-timeline", label: "Study timeline", icon: Calendar },
  { href: "/study-plan", label: "Study plan", icon: Calendar },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/exams", label: "Exams", icon: Trophy },
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

export function DashboardPageShell({ title, description, activePath, children }: DashboardPageShellProps) {
  const router = useRouter()
  const { session, status, signOut } = useAuth()
  const { isDark, toggleTheme } = useThemeMode()
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  React.useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/sign-in")
      return
    }
    const userId = session?.user?.id || session?.user?.email || ""
    if (userId && !isOnboarded(userId)) {
      router.replace("/onboarding")
    }
  }, [router, session?.user?.email, session?.user?.id, status])

  if (status === "loading" || !session?.user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader variant="dots" text="Loading dashboard" />
      </div>
    )
  }

  const currentUser = session.user

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="offcanvas" className="border-r border-border/40">
        <SidebarHeader className="border-b border-border/30 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-summa-accent to-summa-accent/80 text-white shadow-md">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight font-serif">Summa AI</div>
              <div className="text-[11px] text-muted-foreground">Your learning workspace</div>
            </div>
          </div>
          <Button className="mt-4 w-full justify-start gap-2 rounded-[10px] h-9 text-sm font-medium" onClick={() => router.push("/chat")}>
            <Plus className="size-4" />
            New chat
          </Button>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 px-2">
              Learning pages
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = activePath === item.href
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => router.push(item.href)}
                        tooltip={item.label}
                        className="rounded-[10px] text-sm h-9 data-[active=true]:bg-summa-accent/10 data-[active=true]:text-summa-accent data-[active=true]:font-medium"
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/30 p-4">
          <div className="flex items-center gap-3 rounded-[10px] border border-border/30 bg-muted/20 p-3">
            <Avatar className="size-9 ring-2 ring-border/30">
              <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name ?? currentUser.email ?? "User"} />
              <AvatarFallback className="text-xs font-medium">{initials(currentUser.name, currentUser.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{currentUser.name ?? currentUser.email}</div>
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
            <Button variant="ghost" size="sm" className="gap-2 rounded-[8px] h-8 text-xs" onClick={() => void signOut({ callbackUrl: "/home" })} aria-label="Sign out">

              <LogOut className="size-3.5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex min-h-dvh flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:text-sm">
          Skip to main content
        </a>
        <header className="flex items-center gap-3 border-b border-border/30 bg-background/80 backdrop-blur-sm px-4 py-3">
          <SidebarTrigger className="size-8 rounded-[8px] text-muted-foreground" aria-label="Toggle sidebar" />
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight font-serif">{title}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-[8px] border border-border/30 bg-muted/30 px-3 py-1 text-xs text-muted-foreground md:inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500"></span>
              Study mode
            </span>
            <Button variant="ghost" size="icon" className="rounded-[8px]" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        <main id="main-content" className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 w-full flex-1 flex-col px-4 py-4 md:px-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </SidebarInset>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={{
          name: currentUser.name ?? currentUser.email ?? "Learner",
          email: currentUser.email ?? "",
          avatar: currentUser.image ?? undefined,
        }}
        onLogout={() => void signOut({ callbackUrl: "/home" })}

      />
    </SidebarProvider>
  )
}
