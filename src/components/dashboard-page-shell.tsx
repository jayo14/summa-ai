"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { BarChart3, BookOpen, Calendar, FolderOpen, LogOut, Moon, Plus, Settings, Sparkles, Sun, Workflow } from "lucide-react"

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
import { isOnboarded } from "@/lib/onboarding"
import { cn } from "@/lib/utils"

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
  const { data: session, status } = useSession()
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
      <Sidebar collapsible="offcanvas" className="border-r border-border/70">
        <SidebarHeader className="border-b border-border/70 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Summa AI</div>
              <div className="text-xs text-muted-foreground">Your learning workspace</div>
            </div>
          </div>
          <Button className="mt-4 w-full justify-start gap-2" onClick={() => router.push("/chat")}>
            <Plus className="size-4" />
            New chat
          </Button>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupLabel>Learning pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const active = activePath === item.href
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => router.push(item.href)}
                        tooltip={item.label}
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

        <SidebarFooter className="border-t border-border/70 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/40 p-3">
            <Avatar className="size-9">
              <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name ?? currentUser.email ?? "User"} />
              <AvatarFallback>{initials(currentUser.name, currentUser.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{currentUser.name ?? currentUser.email}</div>
              <div className="truncate text-xs text-muted-foreground">{currentUser.email}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1 justify-start gap-2" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="flex-1 justify-start gap-2" onClick={toggleTheme}>
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {isDark ? "Light" : "Dark"}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => void signOut({ callbackUrl: "/home" })}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex min-h-dvh flex-col">
        <header className="flex items-center gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur">
          <SidebarTrigger className="size-8" />
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">{title}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={cn("hidden rounded-full border border-border/70 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground md:inline-flex")}>
              Study mode
            </span>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.08),_transparent_35%)]">
          <div className="flex min-h-0 w-full flex-1 flex-col px-4 py-4 md:px-6">{children}</div>
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

