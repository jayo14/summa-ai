/* Aetheris Glassmorphism reminder: this page is an airy, orb-led chat canvas inside an inset glass shell; learning tools should feel like native conversation objects, never a separate dashboard. */

import { useLocation } from "wouter";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive, ArrowUp, Bell, BookOpen, Brain, Check, ChevronDown, ChevronRight, CircleHelp,
  Clock3, FileText, FolderOpen, LayoutPanelTop, Menu, MoreHorizontal, Paperclip, PanelRight,
  Plus, Search, Send, Settings2, Sparkles, X, Mic, ImagePlus, ListChecks, Lightbulb, Sun, Moon, ArrowDownUp, Filter, Share2, Download, Trophy, CheckCircle2, LoaderCircle, Bookmark, BookmarkCheck, LogOut, Terminal, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { FlashcardReview, GuidedPractice, ProgressMoment, RecallQuiz } from "@/components/LearningInteractives";
import { SummaLogo } from "@/components/SummaLogo";
import { SettingsView } from "@/components/SettingsView";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/roles";
import { fetchApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ChatComponentRenderer, LearningActivityEnvelope } from "@/components/chat/ChatComponentRenderer";

type ViewName = "workspace" | "learning" | "progress" | "sources" | "settings";
type ConversationMessage = { id: number; role: "student" | "summa"; content: string; activity?: LearningActivityEnvelope };

const navItems: Array<{ id: ViewName; label: string; icon: typeof LayoutPanelTop }> = [
  { id: "workspace", label: "Workspace", icon: LayoutPanelTop },
  { id: "learning", label: "My learning", icon: Archive },
  { id: "progress", label: "Progress", icon: Brain },
  { id: "sources", label: "Sources", icon: FolderOpen },
];

const chatHistory = [
  { title: "Polymorphism, continued", time: "Now", active: true },
  { title: "Trace recursive calls", time: "Yesterday", active: false },
  { title: "CSC 203 exam map", time: "Tue", active: false },
  { title: "Review database keys", time: "Mon", active: false },
];

const sourceItems = [
  { title: "CSC 201 · Lecture 06", detail: "Polymorphism & inheritance", type: "Lecture", selected: true },
  { title: "Object-Oriented Programming Notes", detail: "Methods, dispatch, abstract classes", type: "Notes", selected: true },
  { title: "2025 Past Questions", detail: "Section B · Q2", type: "Past paper", selected: true },
];

const suggestedPrompts = ["Quiz me on polymorphism", "Build a study plan", "Explain this with an example", "Find my weak areas"];

type SortMode = "recent" | "oldest" | "topic";
const learningObjects = [
  { type: "RETRIEVAL SET", title: "Polymorphism recall", description: "3 prompts · weak concepts prioritized", meta: "Review due Saturday", action: "Review", accent: "coral", topic: "CSC 201", date: "2026-08-26" },
  { type: "GUIDED PRACTICE", title: "Tracing method dispatch", description: "2 attempts · 1 scaffold used", meta: "Continue the reasoning", action: "Continue", accent: "blue", topic: "CSC 201", date: "2026-08-24" },
  { type: "PRACTICE QUIZ", title: "CSC 203 · Candidate keys", description: "5 questions · post-test feedback saved", meta: "Last opened Tuesday", action: "Open", accent: "ink", topic: "CSC 203", date: "2026-08-20" },
  { type: "STUDY GUIDE", title: "Database normalization", description: "1NF, 2NF, dependencies, 3NF", meta: "Functional dependencies developing", action: "Resume", accent: "sand", topic: "CSC 203", date: "2026-08-18" },
];
const milestoneData = [
  { title: "Polymorphism foundations", detail: "Definitions + identification", objective: "Recognize one interface supporting different concrete behavior and distinguish it from overloading.", state: "complete", date: "Aug 18" },
  { title: "Runtime dispatch", detail: "Explain the runtime object", objective: "Predict which override runs by naming the runtime object, not just the reference type.", state: "current", date: "In progress" },
  { title: "Implement overriding", detail: "Write the same-signature override", objective: "Write a child-class method with the same signature and explain the behavior it replaces.", state: "next", date: "Next up" },
  { title: "Apply to unfamiliar designs", detail: "Transfer the idea to a new class", objective: "Use runtime dispatch to reason about a new class hierarchy without relying on a memorized example.", state: "next", date: "Later" },
];
const sourceCatalog = [
  { title: "CSC 201 · Lecture 06", detail: "Polymorphism & inheritance", type: "Lecture", topic: "CSC 201", date: "2026-08-25", selected: true },
  { title: "Object-Oriented Programming Notes", detail: "Methods, dispatch, abstract classes", type: "Notes", topic: "CSC 201", date: "2026-08-21", selected: true },
  { title: "2025 Past Questions", detail: "Section B · Q2", type: "Past paper", topic: "CSC 203", date: "2026-08-16", selected: true },
];

async function shareText(title: string, text: string, filename: string) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      toast("Shared successfully.");
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard", { description: "You can paste this learning note into another app." });
      return;
    }
  } catch {
    toast("Share cancelled.");
    return;
  }
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  toast("Downloaded learning note.");
}

function exportText(title: string, text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  toast(`${title} exported.`);
}

function getTutorResponse(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes("weak")) return "Your strongest evidence is on identifying polymorphism. The weaker signal is tracing which implementation runs at runtime, so I would practise two short prediction questions next.";
  if (lower.includes("plan") || lower.includes("prepare")) return "For CSC 201, I would begin with runtime polymorphism because it is active but not yet stable. We can spend 15 minutes on prediction and explanation, then return to class design practice.";
  if (lower.includes("quiz")) return "Good choice. I’ll keep this diagnostic: first recall the distinction, then explain how the runtime object selects an override. Your result will update the objective estimate—not mark the topic complete.";
  return "Let’s use your CSC 201 materials and start from what you can already explain. I’ll ask for a prediction before adding another explanation, so we can identify the most useful next step.";
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [composerValue, setComposerValue] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [mastery, setMastery] = useState(() => {
    const saved = window.localStorage.getItem("summa-mastery-runtime-dispatch");
    return saved ? Number(saved) : 61;
  });
  const [events, setEvents] = useState<string[]>(["Session resumed", "3 approved sources in scope", "Last review: yesterday"]);
  const [memoryEnabled, setMemoryEnabled] = useState(() => window.localStorage.getItem("summa-memory-enabled") !== "false");
  const [sourceTrayOpen, setSourceTrayOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => window.localStorage.getItem("summa-theme") === "dark" ? "dark" : "light");
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(window.localStorage.getItem("summa-favorites") || "[]"));
  const [favoriteFolders, setFavoriteFolders] = useState<Record<string, string>>(() => JSON.parse(window.localStorage.getItem("summa-favorite-folders") || "{}"));

  const [customFolders, setCustomFolders] = useState<string[]>(() => {
    const saved = window.localStorage.getItem("summa-custom-folders");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((f) => f !== "CSC 201 · OOP" && f !== "CSC 203 · Databases");
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    window.localStorage.setItem("summa-custom-folders", JSON.stringify(customFolders));
  }, [customFolders]);

  const [dbConversations, setDbConversations] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const [dbMaterials, setDbMaterials] = useState<Array<{ id: string; title: string; type: string; description?: string }>>([]);
  const [dbActivities, setDbActivities] = useState<Array<any>>([]);

  useEffect(() => {
    fetchApi<{ conversations: Array<{ id: string; title: string; created_at: string }> }>("/conversations")
      .then((data) => {
        if (data && Array.isArray(data.conversations)) {
          setDbConversations(data.conversations);
        } else if (Array.isArray(data)) {
          setDbConversations(data as any);
        }
      })
      .catch((err) => console.debug("Fetch conversations error:", err));

    fetchApi<{ materials: Array<{ id: string; title: string; type: string; description?: string }> }>("/materials")
      .then((data) => {
        if (data && Array.isArray(data.materials)) {
          setDbMaterials(data.materials);
        } else if (Array.isArray(data)) {
          setDbMaterials(data as any);
        }
      })
      .catch((err) => console.debug(err));

    fetchApi<Array<any>>("/activities")
      .then((data) => {
        if (Array.isArray(data)) setDbActivities(data);
      })
      .catch((err) => console.debug(err));
  }, []);

  useEffect(() => { window.localStorage.setItem("summa-mastery-runtime-dispatch", String(mastery)); }, [mastery]);
  useEffect(() => { window.localStorage.setItem("summa-memory-enabled", String(memoryEnabled)); }, [memoryEnabled]);
  useEffect(() => {
    window.localStorage.setItem("summa-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  useEffect(() => { window.localStorage.setItem("summa-favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { window.localStorage.setItem("summa-favorite-folders", JSON.stringify(favoriteFolders)); }, [favoriteFolders]);
  function assignFavoriteFolder(title: string, folder: string) { setFavoriteFolders((items) => ({ ...items, [title]: folder })); }
  function toggleFavorite(title: string) { setFavorites((items) => items.includes(title) ? items.filter((item) => item !== title) : [...items, title]); }
  const contextSummary = useMemo(() => `${dbMaterials.length} approved resources`, [dbMaterials.length]);

  function updateMastery(amount: number) { setMastery((value) => Math.min(91, value + amount)); }
  function registerEvent(kind: string, detail: string) {
    const label = `${kind === "retrieval" ? "Retrieval" : kind === "confidence" ? "Review" : kind === "hint" ? "Scaffold" : "Practice"}: ${detail}`;
    setEvents((current) => [label, ...current].slice(0, 4));
  }
  const activeSources = useMemo(() => dbMaterials.map((m) => m.title), [dbMaterials]);

  async function sendMessage(message = composerValue) {
    const clean = message.trim();
    if (!clean || isResponding) return;
    const studentMsgId = Date.now();
    const summaMsgId = studentMsgId + 1;
    setSessionStarted(true);
    const updatedMessages = [...messages, { id: studentMsgId, role: "student" as const, content: clean }];
    setMessages(updatedMessages);
    setComposerValue("");
    setIsResponding(true);

    let activeCid = dbConversations.length > 0 ? dbConversations[0].id : null;
    try {
      if (!activeCid || activeCid === "default-session" || activeCid.startsWith("f2b37d07")) {
        const newConv = await fetchApi<{ id: string }>("/conversations", {
          method: "POST",
          body: JSON.stringify({ title: clean.slice(0, 35) }),
        });
        if (newConv && newConv.id) {
          activeCid = newConv.id;
          setDbConversations((prev) => [{ id: newConv.id, title: clean.slice(0, 35), created_at: new Date().toISOString() }, ...prev]);
        }
      }
      if (activeCid) {
        fetchApi(`/conversations/${activeCid}/messages`, {
          method: "POST",
          body: JSON.stringify({ role: "user", content: clean }),
        }).catch(() => {});
      }
    } catch (err) {
      console.debug("Conversation sync skipped:", err);
    }

    const historyForBackend = updatedMessages.map((m) => ({
      role: m.role === "student" ? "user" : "assistant",
      content: m.content,
    }));

    setMessages((prev) => [...prev, { id: summaMsgId, role: "summa" as const, content: "" }]);

    const token = localStorage.getItem("summa_access_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let fullAiResponse = "";

    fetch("/api/v1/chat/stream", {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: historyForBackend,
        conversation_id: activeCid,
        enable_thinking: true,
        subject: user?.bio || "General Learning",
        degree: "Undergraduate",
        field_of_study: "General",
        learning_style: "Examples before abstractions",
        proficiency_level: `${mastery}% mastery`,
        selected_sources: activeSources,
      }),
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === "content" && parsed.delta) {
                fullAiResponse += parsed.delta;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === summaMsgId
                      ? { ...msg, content: msg.content + parsed.delta }
                      : msg
                  )
                );
              } else if (parsed.type === "artifact" && parsed.data) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === summaMsgId
                      ? { ...msg, activity: { id: parsed.id, title: parsed.title, type: parsed.type, data: parsed.data } }
                      : msg
                  )
                );
              } else if (parsed.type === "error") {
                toast.error(parsed.message || "AI response error");
              }
            } catch (err) {
              // ignore json parse errors for partial lines
            }
          }
        }
      })
      .catch((err) => {
        console.error("Live SSE stream error:", err);
        toast.error("Failed to connect to Summa AI backend.");
        setMessages((prev) => prev.filter((msg) => msg.id !== summaMsgId));
      })
      .finally(() => {
        setIsResponding(false);
        registerEvent("practice", "New learning intent captured");
        if (fullAiResponse && activeCid !== "default-session") {
          fetchApi(`/conversations/${activeCid}/messages`, {
            method: "POST",
            body: JSON.stringify({ role: "assistant", content: fullAiResponse }),
          }).catch(() => {});
        }
      });
  }
  const [location, setLocation] = useLocation();

  const activeView: ViewName = useMemo(() => {
    if (location === "/learning" || location === "/activities") return "learning";
    if (location === "/progress") return "progress";
    if (location === "/sources") return "sources";
    if (location === "/settings") return "settings";
    return "workspace";
  }, [location]);

  function startNewSession() {
    setLocation("/"); setSessionStarted(false); setMessages([]); setComposerValue(""); setSidebarOpen(false);
    toast("New learning space ready", { description: "Tell Summa what you want to understand." });
  }

  function selectView(view: ViewName) {
    const routeMap: Record<ViewName, string> = {
      workspace: "/",
      learning: "/learning",
      progress: "/progress",
      sources: "/sources",
      settings: "/settings",
    };
    setLocation(routeMap[view] || "/");
    setSidebarOpen(false);
  }

  const { user, logout } = useAuth();

  return (
    <div className={`summa-app ${contextOpen && sessionStarted && activeView === "workspace" ? "context-is-open" : "context-is-closed"} ${theme === "dark" ? "dark-mode" : ""}`}>
      <aside className={`app-sidebar ${sidebarOpen ? "is-open" : ""}`} aria-label="Primary navigation">
        <div className="sidebar-topline"><SummaLogo /><button className="mobile-close-button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>
        <button type="button" className="new-session-button" onClick={startNewSession}><Plus size={16} /> New learning</button>
        <nav className="primary-nav" aria-label="Learning areas"><span className="nav-caption">LEARNING SPACE</span>{navItems.map((item) => { const Icon = item.icon; return <button type="button" className={`nav-item ${activeView === item.id ? "active" : ""}`} onClick={() => selectView(item.id)} key={item.id}><Icon size={16} /><span>{item.label}</span>{item.id === "learning" && <small>8</small>}</button>; })}</nav>
        <section className="history-section" aria-labelledby="folders-label">
          <div className="section-title-row">
            <span id="folders-label" className="nav-caption">FOLDERS</span>
            <button
              type="button"
              aria-label="Create folder"
              onClick={() => {
                const folderName = window.prompt("Enter new folder name (e.g. CSC 301 · Algorithms):");
                if (folderName?.trim()) {
                  setCustomFolders((prev) => Array.from(new Set([...prev, folderName.trim()])));
                  toast.success(`Folder "${folderName.trim()}" created.`);
                }
              }}
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="folder-list">
            {customFolders.length > 0 ? (
              customFolders.map((folderName, idx) => (
                <div className="folder-group" key={folderName}>
                  <button type="button" className="folder-heading">
                    <FolderOpen size={14} />
                    <span>{folderName}</span>
                  </button>
                  <div className="history-list">
                    {dbConversations
                      .filter((c: any) => c.folder === folderName)
                      .map((chat) => (
                        <button
                          type="button"
                          className="history-item"
                          key={chat.id}
                          onClick={() => {
                            selectView("workspace");
                            setSessionStarted(true);
                            setSidebarOpen(false);
                          }}
                        >
                          <span>{chat.title}</span>
                          <small>Live</small>
                        </button>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="history-list">
                {dbConversations.length > 0 ? (
                  dbConversations.map((chat) => (
                    <button
                      type="button"
                      className="history-item"
                      key={chat.id}
                      onClick={() => {
                        selectView("workspace");
                        setSessionStarted(true);
                        setSidebarOpen(false);
                      }}
                    >
                      <span>{chat.title}</span>
                      <small>Live</small>
                    </button>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 px-3 py-1.5 block">No learning sessions yet</span>
                )}
              </div>
            )}
          </div>
        </section>
        <div className="sidebar-bottom">
          <button type="button" className={`nav-item ${activeView === "settings" ? "active" : ""}`} onClick={() => selectView("settings")}><Settings2 size={16} /><span>Settings</span></button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="student-badge w-full text-left cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors border-0">
                <div className="student-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate">{user?.name || "Student User"}</strong>
                  <span className="block truncate text-xs text-slate-500">{user?.email || "student@summa.ai"}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-56 p-1.5 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl z-[999]"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Account Overview</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 uppercase font-mono">
                  {user?.role || UserRole.USER}
                </span>
              </DropdownMenuLabel>
              {user?.role === UserRole.ADMIN && (
                <DropdownMenuItem
                  onClick={() => window.location.href = "/admin"}
                  className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                >
                  <Shield size={14} />
                  <span>Admin Infrastructure</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => selectView("settings")}
                className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <Settings2 size={14} />
                <span>Account & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  toast.success("Signed out successfully");
                }}
                className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <section className="main-area">
        <header className="app-header"><div className="header-left"><button type="button" className="header-icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="header-crumbs"><span>Summa AI</span><ChevronRight size={13} /><strong>{activeView === "workspace" ? "Summa AI Chat" : activeView === "learning" ? "My learning" : activeView === "progress" ? "Learning progress" : activeView === "sources" ? "Academic sources" : "Learning settings"}</strong><ChevronDown size={12} /></div></div><div className="header-actions">{activeView === "workspace" && sessionStarted && <button type="button" className="context-toggle" onClick={() => setContextOpen((value) => !value)}><PanelRight size={16} /><span>{contextOpen ? "Hide context" : "Context"}</span></button>}<button type="button" className="theme-toggle" onClick={() => setTheme((value) => value === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}<span>{theme === "light" ? "Dark" : "Light"}</span></button><button type="button" className="header-icon-button" onClick={() => toast("No new learning reminders.")} aria-label="Open notifications"><Bell size={17} /></button><button type="button" className="header-icon-button" onClick={() => toast("Need a hand? Summa can help you choose the next learning action.")} aria-label="Open help"><CircleHelp size={17} /></button></div></header>
        <main className="product-stage">
          {activeView === "workspace" && <WorkspaceView sessionStarted={sessionStarted} onStart={() => setSessionStarted(true)} composerValue={composerValue} setComposerValue={setComposerValue} sendMessage={sendMessage} messages={messages} isResponding={isResponding} mastery={mastery} updateMastery={updateMastery} registerEvent={registerEvent} setSourceTrayOpen={setSourceTrayOpen} dbConversations={dbConversations} />}
          {activeView === "learning" && <LearningLibrary onResume={() => { selectView("workspace"); setSessionStarted(true); }} favorites={favorites} onToggleFavorite={toggleFavorite} favoriteFolders={favoriteFolders} onAssignFolder={assignFavoriteFolder} />}
          {activeView === "progress" && <ProgressView mastery={mastery} onContinue={() => { selectView("workspace"); setSessionStarted(true); }} />}
          {activeView === "sources" && <SourcesView onUseSource={() => { selectView("workspace"); setSessionStarted(true); setSourceTrayOpen(true); }} />}
          {activeView === "settings" && <SettingsView memoryEnabled={memoryEnabled} setMemoryEnabled={setMemoryEnabled} />}
        </main>
      </section>
      {activeView === "workspace" && contextOpen && sessionStarted && <ContextRail mastery={mastery} events={events} onJumpToSources={() => setSourceTrayOpen(true)} />}
      {sourceTrayOpen && <SourceTray onClose={() => setSourceTrayOpen(false)} onConfirm={() => { setSourceTrayOpen(false); toast(`${contextSummary} are grounding this learning session.`); }} />}
    </div>
  );
}

type WorkspaceProps = { sessionStarted: boolean; onStart: () => void; composerValue: string; setComposerValue: (value: string) => void; sendMessage: (message?: string) => void; messages: ConversationMessage[]; isResponding: boolean; mastery: number; updateMastery: (amount: number) => void; registerEvent: (kind: string, detail: string) => void; setSourceTrayOpen: (value: boolean) => void; dbConversations?: Array<{ id: string; title: string; created_at: string }> };

import {
  PromptInput,
  ThinkingBar,
  ChainOfThought,
  CodeBlock,
  ToolCall,
  ScrollButton,
  SourceCard,
} from "@/components/prompt-kit";

function WorkspaceView(props: WorkspaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 120);
  };

  useEffect(() => {
    if (props.messages.length || props.isResponding) {
      scrollToBottom();
    }
  }, [props.messages.length, props.isResponding]);

  if (!props.sessionStarted) return <EmptyWorkspace {...props} dbConversations={props.dbConversations} />;
  return (
    <div className="workspace-view active-workspace relative">
      <div className="conversation-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
        <div className="conversation-column">

          {props.messages.map((message) => (
            <ConversationTurn message={message} key={message.id} />
          ))}
          {props.isResponding && (
            <div className="my-3 space-y-2">
              <ThinkingBar label="Summa is retrieving concept hierarchy & analyzing code..." />
            </div>
          )}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>
      {showScrollButton && <ScrollButton onClick={scrollToBottom} />}
      <ComposerPanel {...props} active />
    </div>
  );
}

function EmptyWorkspace(props: WorkspaceProps & { dbConversations?: Array<{ id: string; title: string; created_at: string }> }) {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(" ")[0] : "Student";
  const emptyActions = [{ label: "Quiz me", icon: ListChecks }, { label: "Build a study plan", icon: BookOpen }, { label: "Explain a concept", icon: Lightbulb }, { label: "Find weak areas", icon: Sparkles }];
  const recentItems = props.dbConversations && props.dbConversations.length > 0 ? props.dbConversations.slice(0, 3) : [];
  return (
    <div className="empty-workspace">
      <div className="empty-hero">
        <div className="hero-orb"><span /></div>
        <h1>Good day, {userName}</h1>
        <p>What would you like to learn today?</p>
      </div>
      <ComposerPanel {...props} />
      <div className="empty-actions" aria-label="Learning shortcuts">
        {emptyActions.map(({ label, icon: Icon }) => (
          <button type="button" key={label} onClick={() => { props.setComposerValue(label); props.onStart(); }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <section className="recent-learning">
        <div className="recent-heading">
          <span>Your recent chats</span>
          <button type="button" onClick={() => toast("All learning conversations are in the sidebar.")}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="recent-grid">
          {recentItems.length > 0 ? (
            recentItems.map((chat) => (
              <button type="button" className="recent-card" key={chat.id} onClick={() => props.onStart()}>
                <strong>{chat.title}</strong>
                <p>Interactive study session</p>
                <small>{new Date(chat.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</small>
              </button>
            ))
          ) : (
            <div className="col-span-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No recent learning chats yet. Start a new session above!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ComposerPanel(props: WorkspaceProps & { active?: boolean }) {
  const [upload, setUpload] = useState<{ name: string; url: string } | null>(null);

  const handleVoice = () => {
    toast("Listening… simulated voice input active.");
    window.setTimeout(() => {
      props.setComposerValue(`${props.composerValue}${props.composerValue ? " " : ""}Explain this concept with a concrete example.`);
      toast("Transcript added to composer.");
    }, 900);
  };

  const handleAttach = () => {
    props.setSourceTrayOpen(true);
  };

  return (
    <div className={`composer-shell ${props.active ? "active-composer-shell" : "empty-composer-shell"}`}>
      <PromptInput
        value={props.composerValue}
        onChange={(e) => props.setComposerValue(e.target.value)}
        onSubmit={() => props.sendMessage()}
        isResponding={props.isResponding}
        placeholder="Ask Summa to explain, test, or map a concept..."
        onAttach={handleAttach}
        onVoice={handleVoice}
        attachedFile={upload}
        onRemoveAttach={() => setUpload(null)}
      />
      {props.active && (
        <p className="composer-note">Enter sends · Shift+Enter adds a line · Summa uses selected course resources first.</p>
      )}
    </div>
  );
}

function FormattedMarkdown({ content }: { content: string }) {
  if (!content) return null;

  // Split into code blocks vs text blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="markdown-body text-xs sm:text-sm leading-relaxed space-y-2 text-slate-800 dark:text-slate-200">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const firstLineEnd = part.indexOf("\n");
          const lang = part.slice(3, firstLineEnd > 3 ? firstLineEnd : 3).trim();
          const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3).trim() : part.slice(3, -3).trim();
          return <CodeBlock key={index} language={lang || "code"} code={code} />;
        }

        // Process line-by-line for headings, lists, bold
        const lines = part.split("\n");
        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-1" />;

              // Headings
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={lineIdx} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1">
                    {parseInlineMarkdown(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={lineIdx} className="text-base font-bold text-slate-900 dark:text-white mt-3.5 mb-1">
                    {parseInlineMarkdown(trimmed.slice(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={lineIdx} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-1.5">
                    {parseInlineMarkdown(trimmed.slice(2))}
                  </h1>
                );
              }

              // Lists
              if (trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. ") || trimmed.startsWith("4. ") || trimmed.startsWith("5. ")) {
                const num = trimmed.slice(0, 3);
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-xs shrink-0">{num}</span>
                    <span>{parseInlineMarkdown(trimmed.slice(3))}</span>
                  </div>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-purple-500 font-bold shrink-0">•</span>
                    <span>{parseInlineMarkdown(trimmed.slice(2))}</span>
                  </div>
                );
              }

              return <p key={lineIdx}>{parseInlineMarkdown(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return <strong key={idx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return <code key={idx} className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-300 font-mono text-[11px] rounded">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function ConversationTurn({ message }: { message: ConversationMessage }) {
  const isStudent = message.role === "student";
  const { user } = useAuth();
  const initials = (user?.name || user?.email || "Student").split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  // Extract reasoning steps if present in assistant response
  let reasoningText: string | undefined;
  let cleanContent = message.content;
  if (!isStudent && message.content.includes("<think>")) {
    const thinkStart = message.content.indexOf("<think>");
    const thinkEnd = message.content.indexOf("</think>");
    if (thinkEnd > thinkStart) {
      reasoningText = message.content.slice(thinkStart + 7, thinkEnd).trim();
      cleanContent = (message.content.slice(0, thinkStart) + message.content.slice(thinkEnd + 8)).trim();
    }
  }

  return (
    <div className={`message-block ${isStudent ? "student-message" : "summa-message dynamic-message"}`}>
      {isStudent ? (
        <div className="student-message-avatar bg-gradient-to-tr from-[#005A57] to-[#003F3F] text-[#B8FF4D] font-bold text-xs flex items-center justify-center rounded-xl size-7 shadow-sm">
          {initials}
        </div>
      ) : (
        <div className="message-sender">
          <div className="summa-message-mark">
            <span className="mini-orb" />
          </div>
          <strong>Summa AI</strong>
        </div>
      )}
      <div className="message-content">
        {!isStudent && reasoningText && (
          <ChainOfThought reasoningText={reasoningText} defaultExpanded={false} />
        )}
        {isStudent ? <p>{cleanContent}</p> : <FormattedMarkdown content={cleanContent} />}
        {message.activity && (
          <div className="mt-3">
            <ChatComponentRenderer activity={message.activity} />
          </div>
        )}
      </div>
    </div>
  );
}

function ContextRail({ mastery, events, onJumpToSources }: { mastery: number; events: string[]; onJumpToSources: () => void }) {
  const [nextAction, setNextAction] = useState<{ action: string; target_concept: string; reason: string; estimated_minutes: number } | null>(null);
  const [learnerContext, setLearnerContext] = useState<{
    sources_count: number;
    capabilities: Array<{ label: string; value: number; tone: "strong" | "developing" }>;
    memory: { preference: string; recurring_gap: string; next_review: string };
    signals: string[];
  } | null>(null);

  useEffect(() => {
    fetchApi<{ action: string; target_concept: string; reason: string; estimated_minutes: number }>("/student/next-action")
      .then((res) => { if (res && res.action) setNextAction(res); })
      .catch(() => {});

    fetchApi<{
      sources_count: number;
      capabilities: Array<{ label: string; value: number; tone: "strong" | "developing" }>;
      memory: { preference: string; recurring_gap: string; next_review: string };
      signals: string[];
    }>("/student/learner-context")
      .then((res) => { if (res && res.capabilities) setLearnerContext(res); })
      .catch(() => {});
  }, []);

  const capabilities = learnerContext?.capabilities || [
    { label: "Definitions", value: 91, tone: "strong" as const },
    { label: "Identification", value: 82, tone: "strong" as const },
    { label: "Runtime behaviour", value: mastery, tone: "developing" as const },
    { label: "Implementation", value: 48, tone: "developing" as const },
  ];

  const signals = learnerContext?.signals || events;

  return (
    <aside className="context-rail" aria-label="Learning context">
      <div className="rail-heading">
        <div><span className="eyebrow">YOUR LEARNING CONTEXT</span><h2>In the margins</h2></div>
        <button type="button" aria-label="Context options"><MoreHorizontal size={19} /></button>
      </div>
      <section className="focus-card">
        <div className="focus-card-top">
          <span className="eyebrow">NEXT BEST ACTION ({nextAction?.action || "EXPLAIN"})</span>
          <span className="time-chip"><Clock3 size={12} /> {nextAction?.estimated_minutes || 12} min</span>
        </div>
        <h3>{nextAction?.target_concept ? `Mastery Focus: ${nextAction.target_concept}` : "Explain how dynamic dispatch chooses an override."}</h3>
        <p>{nextAction?.reason || "Your last response identified the right method but skipped the runtime-object reasoning."}</p>
        <button type="button" onClick={() => document.getElementById("practice-title")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
          Practice this now <ChevronRight size={14} />
        </button>
      </section>
      <section className="mastery-ledger">
        <div className="section-heading"><div><span className="eyebrow">LEARNER MODEL</span><h3>Polymorphism</h3></div><span className="mastery-estimate">{mastery}%</span></div>
        <p className="estimate-copy">Estimated from recent retrieval and explanation evidence.</p>
        <div className="ledger-list">
          {capabilities.map((c) => (
            <LedgerRow key={c.label} label={c.label} value={c.value} tone={c.tone} />
          ))}
        </div>
      </section>
      <section className="memory-card">
        <div className="memory-head"><div><span className="eyebrow">WHAT I REMEMBER</span><h3>Useful continuity</h3></div><div className="memory-status"><span /> Active</div></div>
        <ul>
          <li><span>Preference</span><strong>{learnerContext?.memory?.preference || "Examples before abstractions"}</strong></li>
          <li><span>Recurring gap</span><strong>{learnerContext?.memory?.recurring_gap || "Overriding vs. overloading"}</strong></li>
          <li><span>Next review</span><strong>{learnerContext?.memory?.next_review || "Saturday · retrieval"}</strong></li>
        </ul>
      </section>
      <section className="source-lens">
        <div className="source-lens-copy"><span className="eyebrow">SUMMASTUDY</span><h3>{learnerContext?.sources_count || 3} sources are in scope</h3><p>Selected materials anchor this session.</p></div>
        <img src="/manus-storage/summa-learning-atlas_404e3bf5.jpg" alt="An editorial arrangement of course materials and concept cards." />
        <button type="button" onClick={onJumpToSources}>Review sources <ChevronRight size={14} /></button>
      </section>
      <section className="event-ledger">
        <span className="eyebrow">SESSION SIGNALS</span>
        {signals.map((event) => <p key={event}><span />{event}</p>)}
      </section>
    </aside>
  );
}

function LedgerRow({ label, value, tone }: { label: string; value: number; tone: "strong" | "developing" }) { const activeCount = Math.max(1, Math.round(value / 10)); return <div className="ledger-row"><div><span className={`ledger-status ${tone}`} /><span>{label}</span></div><strong>{value}%</strong><div className="evidence-marks" aria-label={`${value}% evidence estimate`}>{Array.from({ length: 10 }, (_, index) => <i key={index} className={index < activeCount ? "is-active" : ""} />)}</div></div>; }

function LearningLibrary({ onResume, favorites, onToggleFavorite, favoriteFolders, onAssignFolder }: { onResume: () => void; favorites: string[]; onToggleFavorite: (title: string) => void; favoriteFolders: Record<string, string>; onAssignFolder: (title: string, folder: string) => void }) {
  const [topic, setTopic] = useState("All topics");
  const [sort, setSort] = useState<SortMode>("recent");
  const [isFiltering, setIsFiltering] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("All folders");

  const [dbObjects, setDbObjects] = useState<Array<any>>([]);

  useEffect(() => {
    fetchApi<Array<any>>("/activities")
      .then((data) => {
        if (Array.isArray(data)) {
          setDbObjects(data.map((item) => ({
            type: (item.type || "ACTIVITY").toUpperCase(),
            title: item.title || "Untitled Activity",
            description: item.purpose || item.change_note || "Learning activity",
            meta: item.estimated_minutes ? `${item.estimated_minutes} min estimated` : "Active object",
            action: "Open",
            accent: item.type === "quiz" ? "coral" : item.type === "practice" ? "blue" : "ink",
            topic: item.topic || "CSC 201",
            date: item.created_at || new Date().toISOString(),
          })));
        }
      })
      .catch(() => setDbObjects([]));
  }, []);

  const folders = ["All folders", "Unsorted", ...Array.from(new Set(Object.values(favoriteFolders).filter(Boolean)))];
  useEffect(() => { const timer = window.setTimeout(() => setIsFiltering(false), 360); return () => window.clearTimeout(timer); }, [topic, sort, favoritesOnly, query, folder]);
  const topics = ["All topics", ...Array.from(new Set(dbObjects.map((item) => item.topic)))];
  const visible = dbObjects.filter((item) => { const haystack = `${item.title} ${item.description} ${item.meta} ${item.topic}`.toLowerCase(); const itemFolder = favoriteFolders[item.title] || "Unsorted"; return (topic === "All topics" || item.topic === topic) && (!favoritesOnly || favorites.includes(item.title)) && (!query || haystack.includes(query.toLowerCase())) && (folder === "All folders" || itemFolder === folder); }).sort((a, b) => sort === "topic" ? a.topic.localeCompare(b.topic) : sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));

  return <div className="secondary-page library-page"><section className="secondary-intro library-intro"><div><span className="eyebrow">MY LEARNING</span><h1>Objects that keep learning with you.</h1><p>Your retrieval sets, practice, and quizzes are organized by course and adjust as your evidence changes.</p></div><img src="/assets/my-learning-desk-cards.jpg" alt="Study notes and index cards arranged on a desk." className="rounded-2xl border border-[#DDE8DF] dark:border-[#005A57] shadow-md object-cover" /></section><div className="discover-toolbar"><div className="filter-label"><Filter size={14} /> <span>Filter learning</span></div><label className="learning-search"><Search size={13} /><span className="sr-only">Search saved learning</span><input value={query} onChange={(event) => { setQuery(event.target.value); setIsFiltering(true); }} placeholder="Search saved learning…" /></label><label><span className="sr-only">Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((item) => <option key={item}>{item}</option>)}</select></label><label><ArrowDownUp size={13} /><span className="sr-only">Sort learning</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="recent">Newest first</option><option value="oldest">Oldest first</option><option value="topic">By topic</option></select></label><button type="button" className={`favorites-filter ${favoritesOnly ? "active" : ""}`} onClick={() => { setFavoritesOnly((value) => !value); setIsFiltering(true); }}><BookmarkCheck size={13} /> Favorites {favorites.length}</button><label><span className="sr-only">Favorite folder</span><select value={folder} onChange={(event) => { setFolder(event.target.value); setIsFiltering(true); }}>{folders.map((item) => <option key={item}>{item}</option>)}</select></label><button type="button" className="folder-create-button" onClick={() => { const next = window.prompt("Name this favorite folder"); if (next?.trim()) { const title = favorites[0]; if (title) onAssignFolder(title, next.trim()); toast(`${next.trim()} folder created for your first favorite.`); } }}><Plus size={12} /> New folder</button><span className="result-count">{visible.length} objects</span></div>{isFiltering ? <FilterSkeletonGrid count={4} /> : <><div className="library-grid">{visible.map((item) => <LearningObject key={item.title} {...item} favorite={favorites.includes(item.title)} favoriteFolder={favoriteFolders[item.title] || "Unsorted"} favoriteFolders={folders.slice(1)} onToggleFavorite={onToggleFavorite} onAssignFolder={onAssignFolder} onClick={onResume} />)}</div>{visible.length === 0 && <div className="empty-filter-state">No learning objects match this topic yet.</div>}</>}</div>;
}
function LearningObject({ type, title, description, meta, action, onClick, accent, topic, date, favorite, favoriteFolder, favoriteFolders, onToggleFavorite, onAssignFolder }: { type: string; title: string; description: string; meta: string; action: string; onClick: () => void; accent: string; topic: string; date: string; favorite: boolean; favoriteFolder: string; favoriteFolders: string[]; onToggleFavorite: (title: string) => void; onAssignFolder: (title: string, folder: string) => void }) { const note = `${title}\n${description}\n${topic} · ${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}\n${meta}`; return <article className={`learning-object object-${accent}`}><span className="object-tab">{type}</span><div><h2>{title}</h2><p>{description}</p></div><footer><span>{topic} · {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span><div className="object-actions"><button type="button" className="card-share has-tooltip" data-tooltip="Share learning card" onClick={() => shareText(title, note, `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`)} aria-label={`Share ${title}`}><Share2 size={12} /></button><button type="button" className="card-share has-tooltip" data-tooltip="Export as text file" onClick={() => exportText(title, note, `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`)} aria-label={`Export ${title}`}><Download size={12} /></button><button type="button" className={`card-share favorite-button has-tooltip ${favorite ? "is-favorite" : ""}`} data-tooltip={favorite ? "Remove from favorites" : "Save to favorites"} onClick={() => onToggleFavorite(title)} aria-label={favorite ? `Remove ${title} from favorites` : `Save ${title} to favorites`}>{favorite ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}</button>{favorite && <label className="card-folder-select has-tooltip" data-tooltip="Organize this favorite"><FolderOpen size={11} /><span className="sr-only">Favorite folder for {title}</span><select value={favoriteFolder} onChange={(event) => onAssignFolder(title, event.target.value)}>{favoriteFolders.map((item) => <option key={item}>{item}</option>)}</select></label>}<button type="button" onClick={onClick}>{action} <ChevronRight size={14} /></button></div></footer></article>; }

function ProgressView({ mastery, onContinue }: { mastery: number; onContinue: () => void }) {
  const [completedTitles, setCompletedTitles] = useState<string[]>(() => JSON.parse(window.localStorage.getItem("summa-completed-milestones") || '["Polymorphism foundations"]'));
  const [celebrating, setCelebrating] = useState(false);
  const [dbConcepts, setDbConcepts] = useState<Array<{ name: string; mastery: string }>>([]);

  useEffect(() => {
    fetchApi<Array<{ name: string; mastery: string }>>("/concepts")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbConcepts(data);
        }
      })
      .catch(() => {});
  }, []);

  function completeMilestone(title: string) { if (completedTitles.includes(title)) return; setCompletedTitles((items) => [...items, title]); window.localStorage.setItem("summa-completed-milestones", JSON.stringify([...completedTitles, title])); setCelebrating(true); window.setTimeout(() => setCelebrating(false), 1800); }
  return <div className="secondary-page progress-page"><section className="secondary-intro progress-intro"><div><span className="eyebrow">LEARNING PROGRESS</span><h1>See the evidence. Choose the next move.</h1><p>Mastery is an estimate from your answers, explanations, practice, and delayed review—not a completion badge.</p><button type="button" onClick={onContinue}>Continue learning <ChevronRight size={14} /></button></div><figure><div className="progress-orb"><span /></div><figcaption>Learning memory makes the next recommendation specific.</figcaption></figure></section><MilestoneTracker mastery={mastery} completedTitles={completedTitles} onComplete={completeMilestone} celebrating={celebrating} /><section className="progress-sheet"><div className="progress-sheet-heading"><div><span className="eyebrow">CSC 201 · OBJECT-ORIENTED PROGRAMMING</span><h2>Evidence by capability</h2></div><span>Updated today</span></div><div className="capability-table">{dbConcepts.length > 0 ? dbConcepts.slice(0, 4).map((c) => <Capability key={c.name} label={c.name} evidence="Active evidence tracking" estimate={c.mastery === "mastered" ? 88 : c.mastery === "practicing" ? 62 : 40} state={c.mastery === "mastered" ? "stable" : "developing"} />) : <><Capability label="Identify polymorphism" evidence="4 retrieval answers" estimate={86} state="stable" /><Capability label="Explain runtime dispatch" evidence="1 explanation · 1 hint" estimate={mastery} state="developing" /><Capability label="Implement overriding" evidence="No recent attempt" estimate={48} state="next" /><Capability label="Apply to an unfamiliar design" evidence="No evidence yet" estimate={34} state="next" /></>}</div></section><div className="insight-strip"><Sparkles size={17} /><p><strong>Useful pattern:</strong> your answers improve when you predict first, then explain the runtime object in your own words.</p></div></div>;
}
function Capability({ label, evidence, estimate, state }: { label: string; evidence: string; estimate: number; state: "stable" | "developing" | "next" }) { const activeCount = Math.max(1, Math.round(estimate / 10)); return <div className="capability-row"><div><span className={`capability-dot ${state}`} /><strong>{label}</strong><small>{evidence}</small></div><div className="evidence-marks capability-evidence">{Array.from({ length: 10 }, (_, index) => <i key={index} className={index < activeCount ? "is-active" : ""} />)}</div><strong>{estimate}%</strong><span className={`capability-state ${state}`}>{state === "stable" ? "Stable" : state === "developing" ? "Developing" : "Next"}</span></div>; }
function MilestoneTracker({ mastery, completedTitles, onComplete, celebrating }: { mastery: number; completedTitles: string[]; onComplete: (title: string) => void; celebrating: boolean }) { const completed = completedTitles.length; const progress = Math.min(100, Math.round(((completed + (mastery / 100)) / milestoneData.length) * 100)); const nextMilestone = milestoneData.find((item) => !completedTitles.includes(item.title)); return <section className={`milestone-tracker ${celebrating ? "is-celebrating" : ""}`}><div className="milestone-heading"><div><span className="eyebrow">LEARNING MILESTONES</span><h2>Your path through CSC 201</h2><p>{completed} of {milestoneData.length} milestones complete · {progress}% journey progress</p></div><Trophy size={19} /></div>{celebrating && <div className="celebration-banner" role="status"><span className="celebration-sparkles">✦ ✧ ✦</span><strong>Milestone complete</strong><small>Your learning path just moved forward.</small></div>}<div className="milestone-track" style={{ "--milestone-progress": `${progress}%` } as React.CSSProperties}>{milestoneData.map((item) => { const isComplete = completedTitles.includes(item.title); const isCurrent = !isComplete && item.title === nextMilestone?.title; return <div className={`milestone-node ${isComplete ? "complete" : isCurrent ? "current" : "next"} has-tooltip`} data-tooltip={item.objective} tabIndex={0} role="button" aria-label={`${item.title}: ${item.objective}`} onClick={() => isCurrent && onComplete(item.title)} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && isCurrent) { event.preventDefault(); onComplete(item.title); } }} key={item.title}><div className="milestone-dot">{isComplete ? <CheckCircle2 size={14} /> : isCurrent ? <LoaderCircle size={14} /> : <span />}</div><strong>{item.title}</strong><small>{item.detail}</small><em>{isComplete ? "Complete" : isCurrent ? "Click to complete" : item.date}</em></div>; })}</div></section>; }
function FilterSkeletonGrid({ count }: { count: number }) { return <div className={`filter-skeleton-grid skeleton-count-${count}`} aria-live="polite" aria-label="Loading filtered content">{Array.from({ length: count }, (_, index) => <div className="filter-skeleton-card" key={index}><span className="skeleton-line short" /><span className="skeleton-line medium" /><span className="skeleton-line long" /><span className="skeleton-line tiny" /></div>)}</div>; }

function SourcesView({ onUseSource }: { onUseSource: () => void }) {
  const [topic, setTopic] = useState("All topics");
  const [sort, setSort] = useState<SortMode>("recent");
  const [isFiltering, setIsFiltering] = useState(true);
  const [sources, setSources] = useState<Array<any>>([]);

  useEffect(() => {
    fetchApi<Array<any>>("/materials")
      .then((data) => {
        if (Array.isArray(data)) {
          setSources(data.map((m) => ({
            title: m.title || "Learning Resource",
            detail: m.description || m.type || "Course material",
            type: m.type || "Material",
            topic: m.topic || "CSC 201",
            date: m.created_at || new Date().toISOString(),
            selected: true,
          })));
        }
      })
      .catch(() => setSources([]));
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => setIsFiltering(false), 360); return () => window.clearTimeout(timer); }, [topic, sort]);
  const topics = ["All topics", ...Array.from(new Set(sources.map((item) => item.topic)))];
  const visible = sources.filter((item) => topic === "All topics" || item.topic === topic).sort((a, b) => sort === "topic" ? a.topic.localeCompare(b.topic) : sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  return <div className="secondary-page sources-page"><section className="secondary-intro plain-intro"><div><span className="eyebrow">SUMMASTUDY CONNECTION</span><h1>Your materials are learning context.</h1><p>Summa prioritizes selected academic resources, then clearly distinguishes a general explanation when your materials do not settle a question.</p></div><div className="connect-status"><span className="status-orb" /> Connected through SummaStudy</div></section><div className="discover-toolbar source-discover-toolbar"><div className="filter-label"><Filter size={14} /> <span>Filter sources</span></div><label><span className="sr-only">Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((item) => <option key={item}>{item}</option>)}</select></label><label><ArrowDownUp size={13} /><span className="sr-only">Sort sources</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="recent">Newest first</option><option value="oldest">Oldest first</option><option value="topic">By topic</option></select></label><span className="result-count">{visible.length} sources</span></div>{isFiltering ? <FilterSkeletonGrid count={3} /> : <section className="source-catalog">{visible.map((source) => <article key={source.title}><div className="source-file-icon"><FileText size={20} /></div><div><span className="eyebrow">{source.type} · {source.topic}</span><h2>{source.title}</h2><p>{source.detail}</p></div><span className="source-in-use">{new Date(source.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span><button type="button" onClick={onUseSource}>Use to learn <ChevronRight size={14} /></button></article>)}</section>}<button type="button" className="add-source-button" onClick={() => { toast("SummaStudy picker opened — choose the materials to add."); onUseSource(); }}><Plus size={16} /> Add from SummaStudy</button></div>;
}
function SourceTray({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [items, setItems] = useState<Array<any>>([]);
  useEffect(() => {
    fetchApi<Array<any>>("/materials")
      .then((res) => {
        if (Array.isArray(res)) {
          setItems(res.map((m) => ({ title: m.title || "Resource", detail: m.description || "Course material", type: m.type || "Doc", selected: true })));
        }
      })
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="source-tray-overlay" role="dialog" aria-modal="true" aria-labelledby="source-tray-title">
      <button className="source-tray-backdrop" onClick={onClose} aria-label="Close source selector" />
      <section className="source-tray">
        <header>
          <div>
            <span className="eyebrow">SESSION CONTEXT</span>
            <h2 id="source-tray-title">Choose what grounds this learning.</h2>
            <p>Summa will prioritize these approved resources before general knowledge.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close source selector"><X size={19} /></button>
        </header>
        <div className="source-picker-list">
          {items.length > 0 ? (
            items.map((source) => (
              <label key={source.title} className="source-picker-item">
                <input type="checkbox" defaultChecked={source.selected} />
                <span className="custom-check"><Check size={13} /></span>
                <FileText size={17} />
                <span><strong>{source.title}</strong><small>{source.detail}</small></span>
                <em>{source.type}</em>
              </label>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">No connected materials yet</div>
          )}
        </div>
        <footer>
          <button type="button" className="secondary-action" onClick={() => toast("Upload control will be available after secure file storage is configured.")}>
            <Paperclip size={14} /> Upload a resource
          </button>
          <button type="button" className="interactive-primary" onClick={onConfirm}>
            Use selected sources <Send size={14} />
          </button>
        </footer>
      </section>
    </div>
  );
}
