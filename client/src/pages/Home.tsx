/* Aetheris Glassmorphism reminder: this page is an airy, orb-led chat canvas inside an inset glass shell; learning tools should feel like native conversation objects, never a separate dashboard. */

import { useLocation } from "wouter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive, ArrowUp, Bell, BookOpen, Brain, Check, ChevronDown, ChevronRight, CircleHelp,
  Clock3, FileText, FolderOpen, LayoutPanelTop, Menu, MoreHorizontal, MoreVertical, Paperclip, PanelRight,
  Plus, Search, Send, Settings2, Sparkles, X, Mic, ImagePlus, ListChecks, Lightbulb, Sun, Moon, ArrowDownUp, Filter, Share2, Download, Trophy, CheckCircle2, LoaderCircle, Bookmark, BookmarkCheck, LogOut, Terminal, Shield,
  Flame, MessageSquare, Code2, Calculator, Atom, PenTool, Book, Target, TrendingUp, BarChart3, Activity, Trash2, FolderPlus, Edit2, FolderMinus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ChatComponentRenderer, LearningActivityEnvelope } from "@/components/chat/ChatComponentRenderer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type ViewName = "workspace" | "learning" | "progress" | "sources" | "settings";
type ConversationMessage = {
  id: number;
  role: "student" | "summa";
  content: string;
  thinking?: string;
  error?: boolean;
  activity?: LearningActivityEnvelope;
};

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

  const [isSidebarFolderDialogOpen, setIsSidebarFolderDialogOpen] = useState(false);
  const [sidebarFolderName, setSidebarFolderName] = useState("");

  const [renameChatTarget, setRenameChatTarget] = useState<{ id: string; title: string } | null>(null);
  const [renameChatTitle, setRenameChatTitle] = useState("");

  const [dbConversations, setDbConversations] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const [dbMaterials, setDbMaterials] = useState<Array<{ id: string; title: string; type: string; description?: string }>>([]);
  const [dbActivities, setDbActivities] = useState<Array<any>>([]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const selectConversation = async (cid: string) => {
    setActiveConversationId(cid);
    setSessionStarted(true);
    setLocation(`/c/${cid}`);
    setSidebarOpen(false);
    try {
      const data = await fetchApi<{ messages: Array<{ id: string; role: string; content: string }> }>(`/conversations/${cid}`);
      if (data && Array.isArray(data.messages)) {
        setMessages(
          data.messages.map((m, idx) => ({
            id: Number(m.id) || Date.now() + idx,
            role: m.role === "user" || m.role === "student" ? "student" : "summa",
            content: m.content,
          }))
        );
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.debug("Error loading conversation messages:", err);
    }
  };

  const deleteConversationHandler = async (cid: string) => {
    try {
      await fetchApi(`/conversations/${cid}`, { method: "DELETE" });
      setDbConversations((prev) => prev.filter((c) => c.id !== cid));
      if (activeConversationId === cid) {
        setActiveConversationId(null);
        setMessages([]);
        setSessionStarted(false);
      }
      toast.success("Conversation deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete conversation");
    }
  };

  const renameConversationHandler = async (cid: string, newTitle: string) => {
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return;
    try {
      await fetchApi(`/conversations/${cid}`, {
        method: "PATCH",
        body: JSON.stringify({ title: cleanTitle }),
      });
      setDbConversations((prev) =>
        prev.map((c) => (c.id === cid ? { ...c, title: cleanTitle } : c))
      );
      toast.success("Chat renamed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to rename conversation");
    }
  };

  const assignChatToFolder = (cid: string, folderName: string) => {
    setDbConversations((prev) =>
      prev.map((c) => (c.id === cid ? { ...c, folder: folderName } : c))
    );
    toast.success(`Chat added to folder "${folderName}"`);
  };

  const removeChatFromFolder = (cid: string) => {
    setDbConversations((prev) =>
      prev.map((c) => (c.id === cid ? { ...c, folder: undefined } : c))
    );
    toast.success("Chat removed from folder");
  };

  const loadConversations = useCallback(() => {
    fetchApi<{ conversations: Array<{ id: string; title: string; created_at: string }> }>("/conversations")
      .then((data) => {
        if (data && Array.isArray(data.conversations)) {
          setDbConversations(data.conversations);
        } else if (Array.isArray(data)) {
          setDbConversations(data as any);
        }
      })
      .catch((err) => console.debug("Fetch conversations error:", err));
  }, []);

  useEffect(() => {
    loadConversations();

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
  }, [loadConversations]);

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

    let activeCid = activeConversationId;
    if (!activeCid || activeCid === "default-session" || activeCid.startsWith("f2b37d07")) {
      try {
        const newConv = await fetchApi<{ id: string; title?: string }>("/conversations", {
          method: "POST",
          body: JSON.stringify({ title: clean.slice(0, 35) }),
        });
        if (newConv && newConv.id) {
          activeCid = newConv.id;
          setActiveConversationId(newConv.id);
          setLocation(`/c/${newConv.id}`);
          const newTitle = newConv.title || clean.slice(0, 35);
          setDbConversations((prev) => {
            if (prev.some((c) => c.id === newConv.id)) return prev;
            return [{ id: newConv.id, title: newTitle, created_at: new Date().toISOString() }, ...prev];
          });
        }
      } catch (err) {
        console.debug("Conversation creation error:", err);
      }
    }

    // NOTE: do NOT POST the user message to /conversations/{cid}/messages here.
    // chat_stream() on the backend already calls ds.add_message() for both the
    // user turn and the assistant turn — posting here would create duplicates.

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
          if (response.status === 401 || response.status === 403) {
            // Don't auto-logout on a chat stream 401 — the JWKS cache may have
            // been cold. Show an inline error instead so the user can retry.
            throw new Error(`Authentication error (${response.status}) — please try again`);
          }
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
              } else if (parsed.type === "thinking" && parsed.delta) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === summaMsgId
                      ? { ...msg, thinking: (msg.thinking || "") + parsed.delta }
                      : msg
                  )
                );
              } else if (parsed.type === "artifact") {
                const act = parsed.artifact || parsed;
                if (act && (act.data || act.type)) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === summaMsgId
                        ? { ...msg, activity: { id: act.id, title: act.title, type: act.type, data: act.data } }
                        : msg
                    )
                  );
                }
              } else if (parsed.type === "error") {
                toast.error(parsed.message || "AI response error");
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === summaMsgId
                      ? { ...msg, error: true, content: msg.content || "Summa couldn't complete the response." }
                      : msg
                  )
                );
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
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === summaMsgId
              ? { ...msg, error: true, content: msg.content || "Summa couldn't respond." }
              : msg
          )
        );
      })
      .finally(() => {
        setIsResponding(false);
        registerEvent("practice", "New learning intent captured");
        // NOTE: do NOT POST the assistant message here — chat_stream() already
        // persists it via ds.add_message() once the stream completes.
      });
  }
  const [location, setLocation] = useLocation();

  useEffect(() => {
    loadConversations();
    if (location.startsWith("/c/")) {
      const urlCid = location.replace("/c/", "").trim();
      if (urlCid && urlCid !== activeConversationIdRef.current) {
        activeConversationIdRef.current = urlCid;
        setActiveConversationId(urlCid);
        setSessionStarted(true);
        fetchApi<{ messages: Array<{ id: string; role: string; content: string }> }>(`/conversations/${urlCid}`)
          .then((data) => {
            if (data && Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages(
                data.messages.map((m, idx) => ({
                  id: Number(m.id) || Date.now() + idx,
                  role: m.role === "user" || m.role === "student" ? "student" : "summa",
                  content: m.content,
                }))
              );
            }
          })
          .catch((err) => console.debug("Error loading route conversation messages:", err));
      }
    }
  }, [location, loadConversations]);

  const activeView: ViewName = useMemo(() => {
    if (location === "/learning" || location === "/activities") return "learning";
    if (location === "/progress") return "progress";
    if (location === "/sources") return "sources";
    if (location === "/settings") return "settings";
    return "workspace";
  }, [location]);

  function startNewSession() {
    setActiveConversationId(null); setLocation("/"); setSessionStarted(false); setMessages([]); setComposerValue(""); setSidebarOpen(false);
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
        <nav className="primary-nav" aria-label="Learning areas"><span className="nav-caption">LEARNING SPACE</span>{navItems.map((item) => { const Icon = item.icon; return <button type="button" className={`nav-item ${activeView === item.id ? "active" : ""}`} onClick={() => selectView(item.id)} key={item.id}><Icon size={16} /><span>{item.label}</span>{item.id === "learning" && <small>{dbActivities.length}</small>}</button>; })}</nav>
        <div className="flex-1 overflow-y-auto min-h-0 my-2 pr-1 space-y-4">
          <section className="history-section" aria-labelledby="folders-label">
            <div className="section-title-row">
              <span id="folders-label" className="nav-caption">FOLDERS</span>
              <button
                type="button"
                aria-label="Create folder"
                onClick={() => setIsSidebarFolderDialogOpen(true)}
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="folder-list">
              {customFolders.length > 0 ? (
                customFolders.map((folderName) => (
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
                            className={`history-item ${activeConversationId === chat.id ? "active" : ""}`}
                            key={chat.id}
                            onClick={() => selectConversation(chat.id)}
                          >
                            <span>{chat.title}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-[#6D7E78] dark:text-[#8FA29B] px-3 py-1 block">No folders created</span>
              )}
            </div>
          </section>

          {/* Dedicated CHATS Section */}
          <section className="history-section mt-4" aria-labelledby="chats-label">
            <div className="section-title-row mb-1">
              <span id="chats-label" className="nav-caption">CHATS</span>
              <button
                type="button"
                aria-label="New chat"
                onClick={startNewSession}
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="history-list">
              {dbConversations.length > 0 ? (
                dbConversations.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative flex items-center justify-between gap-1 w-full rounded-lg text-left text-xs transition-colors ${
                      activeConversationId === chat.id
                        ? "bg-[#DDE8DF] dark:bg-[#2A3838] text-[#003F3F] dark:text-[#B8FF4D] font-bold"
                        : "text-[#6D7E78] dark:text-[#8FA29B] hover:bg-[#DDE8DF]/50 dark:hover:bg-[#232D2D] hover:text-[#102B2B] dark:hover:text-[#FBFAF6]"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-between gap-2 px-2.5 py-1.5 min-w-0 text-left cursor-pointer"
                      onClick={() => selectConversation(chat.id)}
                    >
                      <span className="truncate">{chat.title}</span>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 mr-1 rounded-md hover:bg-[#DDE8DF] dark:hover:bg-[#2A3838] text-[#6D7E78] hover:text-[#102B2B] dark:text-[#8FA29B] dark:hover:text-[#FBFAF6] transition-opacity cursor-pointer shrink-0"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Chat options"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        sideOffset={4}
                        className="w-48 p-1 shadow-lg border border-[#DDE8DF] dark:border-[#2A3838] bg-[#FBFAF6] dark:bg-[#1C2323] text-[#102B2B] dark:text-[#FBFAF6] rounded-xl z-[999]"
                      >
                        {chat.folder && (
                          <>
                            <DropdownMenuItem
                              onClick={() => removeChatFromFolder(chat.id)}
                              className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[#102B2B] dark:text-[#FBFAF6] hover:bg-[#DDE8DF] dark:hover:bg-[#232D2D]"
                            >
                              <FolderMinus size={14} className="text-amber-600 dark:text-amber-400" />
                              <span>Remove from folder</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-[#DDE8DF] dark:border-[#2A3838]" />
                          </>
                        )}
                        {customFolders.length > 0 && (
                          <>
                            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-[#6D7E78] dark:text-[#8FA29B] uppercase tracking-wider">
                              Add to folder
                            </DropdownMenuLabel>
                            {customFolders.map((folder) => (
                              <DropdownMenuItem
                                key={folder}
                                onClick={() => assignChatToFolder(chat.id, folder)}
                                className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[#102B2B] dark:text-[#FBFAF6] hover:bg-[#DDE8DF] dark:hover:bg-[#232D2D]"
                              >
                                <FolderPlus size={14} className="text-[#005A57] dark:text-[#B8FF4D]" />
                                <span className="truncate">{folder}</span>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="my-1 border-[#DDE8DF] dark:border-[#2A3838]" />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setRenameChatTarget({ id: chat.id, title: chat.title });
                            setRenameChatTitle(chat.title);
                          }}
                          className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[#102B2B] dark:text-[#FBFAF6] hover:bg-[#DDE8DF] dark:hover:bg-[#232D2D]"
                        >
                          <Edit2 size={14} className="text-[#005A57] dark:text-[#B8FF4D]" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteConversationHandler(chat.id)}
                          className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-[#6D7E78] dark:text-[#8FA29B] px-3 py-1.5 block">No learning sessions yet</span>
              )}
            </div>
          </section>
        </div>
        <div className="sidebar-bottom">
          <button type="button" className={`nav-item ${activeView === "settings" ? "active" : ""}`} onClick={() => selectView("settings")}><Settings2 size={16} /><span>Settings</span></button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="student-badge w-full text-left cursor-pointer hover:bg-[#DDE8DF]/50 dark:hover:bg-[#232D2D] transition-colors border-0">
                <div className="student-avatar overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || "User Avatar"} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : "U"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-[#102B2B] dark:text-[#FBFAF6] font-semibold">{user?.name || "Student User"}</strong>
                  <span className="block truncate text-xs text-[#6D7E78] dark:text-[#8FA29B]">{user?.email || ""}</span>
                </div>
                <ChevronDown size={14} className="text-[#6D7E78] dark:text-[#8FA29B] flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-56 p-1.5 shadow-2xl border border-[#DDE8DF] dark:border-[#2A3838] bg-[#FBFAF6] dark:bg-[#1C2323] text-[#102B2B] dark:text-[#FBFAF6] rounded-xl z-[999]"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-[#6D7E78] dark:text-[#8FA29B] flex items-center justify-between">
                <span>Account Overview</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DDE8DF] dark:bg-[#2A3838] text-[#003F3F] dark:text-[#B8FF4D] uppercase font-mono">
                  {user?.role || UserRole.USER}
                </span>
              </DropdownMenuLabel>
              {user?.role === UserRole.ADMIN && (
                <DropdownMenuItem
                  onClick={() => window.location.href = "/admin"}
                  className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#005A57] dark:text-[#B8FF4D] hover:bg-[#DDE8DF] dark:hover:bg-[#232D2D]"
                >
                  <Shield size={14} />
                  <span>Admin Infrastructure</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => selectView("settings")}
                className="cursor-pointer flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[#102B2B] dark:text-[#FBFAF6] hover:bg-[#DDE8DF] dark:hover:bg-[#232D2D]"
              >
                <Settings2 size={14} />
                <span>Account & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-[#DDE8DF] dark:border-[#2A3838]" />
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
        <header className="app-header"><div className="header-left"><button type="button" className="header-icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="header-crumbs"><span>Summa AI</span><ChevronRight size={13} /><strong>{activeView === "workspace" ? "Summa AI Chat" : activeView === "learning" ? "My learning" : activeView === "progress" ? "Learning progress" : activeView === "sources" ? "Academic sources" : "Learning settings"}</strong><ChevronDown size={12} /></div></div><div className="header-actions"><button type="button" className="theme-toggle" onClick={() => setTheme((value) => value === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}<span>{theme === "light" ? "Dark" : "Light"}</span></button><button type="button" className="header-icon-button" onClick={() => toast("No new learning reminders.")} aria-label="Open notifications"><Bell size={17} /></button><button type="button" className="header-icon-button" onClick={() => toast("Need a hand? Summa can help you choose the next learning action.")} aria-label="Open help"><CircleHelp size={17} /></button></div></header>
        <main className="product-stage">
          {activeView === "workspace" && <WorkspaceView sessionStarted={sessionStarted} onStart={() => setSessionStarted(true)} composerValue={composerValue} setComposerValue={setComposerValue} sendMessage={sendMessage} messages={messages} isResponding={isResponding} mastery={mastery} updateMastery={updateMastery} registerEvent={registerEvent} setSourceTrayOpen={setSourceTrayOpen} dbConversations={dbConversations} />}
          {activeView === "learning" && (
            <LearningLibrary
              onResume={() => {
                selectView("workspace");
                setSessionStarted(true);
              }}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              favoriteFolders={favoriteFolders}
              onAssignFolder={assignFavoriteFolder}
              onSelectProgress={() => selectView("progress")}
              customFolders={customFolders}
              onCreateFolder={(name) => {
                setCustomFolders((prev) => Array.from(new Set([...prev, name])));
              }}
            />
          )}
          {activeView === "progress" && <ProgressView mastery={mastery} onContinue={() => { selectView("workspace"); setSessionStarted(true); }} />}
          {activeView === "sources" && <SourcesView onUseSource={() => { selectView("workspace"); setSessionStarted(true); setSourceTrayOpen(true); }} />}
          {activeView === "settings" && <SettingsView memoryEnabled={memoryEnabled} setMemoryEnabled={setMemoryEnabled} />}
        </main>
      </section>
      {sourceTrayOpen && <SourceTray onClose={() => setSourceTrayOpen(false)} onConfirm={() => { setSourceTrayOpen(false); toast(`${contextSummary} are grounding this learning session.`); }} />}

      {/* Sidebar Folder Creation Dialog Component */}
      <Dialog open={isSidebarFolderDialogOpen} onOpenChange={setIsSidebarFolderDialogOpen}>
        <DialogContent showCloseButton className="sm:max-w-md bg-[#FBFAF6] dark:bg-slate-900 border-[#DDE8DF] dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B2B] dark:text-white flex items-center gap-2">
              <FolderOpen className="size-4 text-[#005A57] dark:text-[#B8FF4D]" />
              <span>Create Course Folder</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6D7E78] dark:text-slate-400">
              Create a new folder to organize your chat sessions and study contexts.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (sidebarFolderName.trim()) {
                setCustomFolders((prev) => Array.from(new Set([...prev, sidebarFolderName.trim()])));
                toast.success(`Folder "${sidebarFolderName.trim()}" created.`);
                setSidebarFolderName("");
                setIsSidebarFolderDialogOpen(false);
              }
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-xs font-bold text-[#102B2B] dark:text-slate-200 mb-1.5">
                Folder Name
              </label>
              <input
                type="text"
                value={sidebarFolderName}
                onChange={(e) => setSidebarFolderName(e.target.value)}
                placeholder="e.g. CSC 301 · Algorithms"
                autoFocus
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-[#DDE8DF] dark:border-slate-700 rounded-xl text-xs text-[#102B2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005A57]/30"
              />
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSidebarFolderDialogOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] border border-[#005A57] font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Create folder
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Chat Dialog Component */}
      <Dialog open={Boolean(renameChatTarget)} onOpenChange={(open) => { if (!open) setRenameChatTarget(null); }}>
        <DialogContent showCloseButton className="sm:max-w-md bg-[#FBFAF6] dark:bg-slate-900 border-[#DDE8DF] dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B2B] dark:text-white flex items-center gap-2">
              <Edit2 className="size-4 text-[#005A57] dark:text-[#B8FF4D]" />
              <span>Rename Chat</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6D7E78] dark:text-slate-400">
              Enter a new name for this learning conversation.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (renameChatTarget && renameChatTitle.trim()) {
                renameConversationHandler(renameChatTarget.id, renameChatTitle.trim());
                setRenameChatTarget(null);
              }
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-xs font-bold text-[#102B2B] dark:text-slate-200 mb-1.5">
                Chat Title
              </label>
              <input
                type="text"
                value={renameChatTitle}
                onChange={(e) => setRenameChatTitle(e.target.value)}
                placeholder="e.g. Dynamic Programming & Memoization"
                autoFocus
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-[#DDE8DF] dark:border-slate-700 rounded-xl text-xs text-[#102B2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005A57]/30"
              />
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRenameChatTarget(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] border border-[#005A57] font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Save title
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
            <ConversationTurn
              message={message}
              key={message.id}
              onRetry={
                message.error && message.role === "summa"
                  ? () => {
                      // Find the preceding student message and resend it
                      const idx = props.messages.findIndex((m) => m.id === message.id);
                      const preceding = idx > 0 ? props.messages[idx - 1] : null;
                      if (preceding && preceding.role === "student") {
                        props.sendMessage(preceding.content);
                      }
                    }
                  : undefined
              }
            />
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
          <button type="button" key={label} onClick={() => props.sendMessage(label)}>
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
    <div className="markdown-body text-xs sm:text-sm leading-relaxed space-y-2 text-[#102B2B] dark:text-[#DDE8DF]">
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
                  <h3 key={lineIdx} className="text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6] mt-3 mb-1">
                    {parseInlineMarkdown(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={lineIdx} className="text-base font-bold text-[#102B2B] dark:text-[#FBFAF6] mt-3.5 mb-1">
                    {parseInlineMarkdown(trimmed.slice(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={lineIdx} className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6] mt-4 mb-1.5">
                    {parseInlineMarkdown(trimmed.slice(2))}
                  </h1>
                );
              }

              // Lists
              if (trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. ") || trimmed.startsWith("4. ") || trimmed.startsWith("5. ")) {
                const num = trimmed.slice(0, 3);
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-bold text-[#005A57] dark:text-[#B8FF4D] text-xs shrink-0">{num}</span>
                    <span>{parseInlineMarkdown(trimmed.slice(3))}</span>
                  </div>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-[#005A57] dark:text-[#B8FF4D] font-bold shrink-0">•</span>
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
      return <strong key={idx} className="font-bold text-[#102B2B] dark:text-[#FBFAF6]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return <code key={idx} className="px-1 py-0.5 bg-[#DDE8DF]/60 dark:bg-[#232D2D] text-[#005A57] dark:text-[#B8FF4D] font-mono text-[11px] rounded">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function ConversationTurn({ message, onRetry }: { message: ConversationMessage; onRetry?: () => void }) {
  const isStudent = message.role === "student";
  const { user } = useAuth();
  const initials = (user?.name || user?.email || "Student").split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  // Extract reasoning steps if present in assistant response
  let reasoningText: string | undefined = message.thinking;
  let cleanContent = message.content;
  if (!isStudent && message.content.includes("<think>")) {
    const thinkStart = message.content.indexOf("<think>");
    const thinkEnd = message.content.indexOf("</think>");
    if (thinkEnd > thinkStart) {
      reasoningText = (reasoningText ? reasoningText + "\n" : "") + message.content.slice(thinkStart + 7, thinkEnd).trim();
      cleanContent = (message.content.slice(0, thinkStart) + message.content.slice(thinkEnd + 8)).trim();
    }
  }

  return (
    <div className={`message-block ${isStudent ? "student-message" : "summa-message dynamic-message"}`}>
      {isStudent && (
        <div className="student-message-avatar bg-gradient-to-tr from-[#005A57] to-[#003F3F] text-[#B8FF4D] font-bold text-xs flex items-center justify-center rounded-xl size-7 shadow-sm overflow-hidden shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name || "Student Avatar"} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      )}
      <div className="message-content">
        {!isStudent && reasoningText && (
          <ChainOfThought reasoningText={reasoningText} defaultExpanded={true} />
        )}
        {isStudent ? (
          <p>{cleanContent}</p>
        ) : cleanContent ? (
          <MarkdownRenderer content={cleanContent} />
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#6D7E78] dark:text-[#8FA29B] italic py-1">
            <span className="inline-block size-2 rounded-full bg-[#005A57] dark:bg-[#B8FF4D] animate-ping" />
            <span>Thinking and rendering explanation...</span>
          </div>
        )}
        {message.error && (
          <div className="mt-2 flex items-center gap-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            <span>Summa couldn't complete this response.</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-2.5 py-1 rounded-lg bg-red-600 text-white dark:bg-red-500 hover:bg-red-700 text-[11px] font-semibold transition-colors shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        )}
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

function LearningLibrary({
  onResume,
  favorites,
  onToggleFavorite,
  favoriteFolders,
  onAssignFolder,
  onSelectProgress,
  customFolders = [],
  onCreateFolder = () => {},
}: {
  onResume: () => void;
  favorites: string[];
  onToggleFavorite: (title: string) => void;
  favoriteFolders: Record<string, string>;
  onAssignFolder: (title: string, folder: string) => void;
  onSelectProgress?: () => void;
  customFolders?: string[];
  onCreateFolder?: (name: string) => void;
}) {
  const [filterState, setFilterState] = useState<"all" | "active" | "onhold" | "completed">("all");
  const [sortMode, setSortMode] = useState<"recent" | "mastery" | "title">("recent");
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [dbFolders, setDbFolders] = useState<Array<any>>([]);

  useEffect(() => {
    fetchApi<Array<any>>("/activities")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbFolders(
            data.map((item, idx) => ({
              id: item.id || `folder-${idx}`,
              title: item.title || "Study Module",
              chatsCount: item.chats_count || item.estimated_minutes || (128 - idx * 25),
              createdDate: item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 10, 2026",
              mastery: item.mastery || Math.max(0, 68 - idx * 15),
              lastActivity: item.purpose || item.topic || "Discussed concepts · 2h ago",
              status: idx === 0 || idx === 1 || idx === 2 ? "active" : idx === 3 ? "onhold" : "completed",
              iconType: idx % 5 === 0 ? "code" : idx % 5 === 1 ? "math" : idx % 5 === 2 ? "physics" : idx % 5 === 3 ? "writing" : "book",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const defaultFolders = [
    {
      id: "f1",
      title: "Object-Oriented Programming",
      chatsCount: 128,
      createdDate: "Jan 10, 2026",
      mastery: 68,
      lastActivity: "Discussed polymorphism · 2h ago",
      status: "active",
      iconType: "code",
    },
    {
      id: "f2",
      title: "Linear Algebra",
      chatsCount: 86,
      createdDate: "Jan 6, 2026",
      mastery: 54,
      lastActivity: "Matrix operations · Yesterday",
      status: "active",
      iconType: "math",
    },
    {
      id: "f3",
      title: "Physics – Mechanics",
      chatsCount: 74,
      createdDate: "Jan 2, 2026",
      mastery: 33,
      lastActivity: "Newton's laws · 2 days ago",
      status: "active",
      iconType: "physics",
    },
    {
      id: "f4",
      title: "Technical Writing",
      chatsCount: 41,
      createdDate: "Dec 28, 2025",
      mastery: 18,
      lastActivity: "Essay structure · 4 days ago",
      status: "onhold",
      iconType: "writing",
    },
    {
      id: "f5",
      title: "Discrete Mathematics",
      chatsCount: 0,
      createdDate: "Dec 12, 2025",
      mastery: 0,
      lastActivity: "Start learning",
      status: "completed",
      iconType: "book",
    },
  ];

  const customFoldersMapped = (customFolders || []).map((name, idx) => ({
    id: `custom-folder-${idx}`,
    title: name,
    chatsCount: 0,
    createdDate: "Just now",
    mastery: 0,
    lastActivity: "No activity yet",
    status: "active" as const,
    iconType: idx % 5 === 0 ? "code" : idx % 5 === 1 ? "math" : idx % 5 === 2 ? "physics" : idx % 5 === 3 ? "writing" : "book",
  }));

  const foldersList = [...customFoldersMapped, ...(dbFolders.length > 0 ? dbFolders : defaultFolders)];

  const filteredFolders = foldersList
    .filter((f) => filterState === "all" || f.status === filterState)
    .sort((a, b) => {
      if (sortMode === "mastery") return b.mastery - a.mastery;
      if (sortMode === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    toast.success(`Folder "${newFolderName.trim()}" created.`);
    setNewFolderName("");
    setIsFolderDialogOpen(false);
  };

  const getFolderIcon = (type: string) => {
    switch (type) {
      case "code":
        return (
          <div className="size-11 rounded-2xl bg-[#005A57]/10 dark:bg-[#005A57]/30 text-[#005A57] dark:text-[#B8FF4D] flex items-center justify-center font-mono font-bold text-sm shrink-0">
            &lt;/&gt;
          </div>
        );
      case "math":
        return (
          <div className="size-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-serif font-bold italic text-base shrink-0">
            f(x)
          </div>
        );
      case "physics":
        return (
          <div className="size-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Atom className="size-5" />
          </div>
        );
      case "writing":
        return (
          <div className="size-11 rounded-2xl bg-[#DDE8DF] dark:bg-slate-800 text-[#003F3F] dark:text-[#B8FF4D] flex items-center justify-center shrink-0">
            <PenTool className="size-5" />
          </div>
        );
      default:
        return (
          <div className="size-11 rounded-2xl bg-[#F5F3EC] dark:bg-slate-800 text-[#6D7E78] dark:text-slate-300 flex items-center justify-center shrink-0">
            <Book className="size-5" />
          </div>
        );
    }
  };

  const getFolderProgressColor = (mastery: number) => {
    if (mastery >= 60) return "bg-[#005A57] dark:bg-[#B8FF4D]";
    if (mastery >= 40) return "bg-emerald-600 dark:bg-emerald-400";
    if (mastery >= 20) return "bg-amber-500 dark:bg-amber-400";
    if (mastery > 0) return "bg-[#6D7E78] dark:bg-slate-400";
    return "bg-slate-300 dark:bg-slate-700";
  };

  return (
    <div className="secondary-page library-page w-full p-4 sm:p-6 lg:p-8 space-y-6 text-slate-900 dark:text-[#FBFAF6]">
      {/* Intro Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#102B2B] dark:text-[#FBFAF6]">
          My learning
        </h1>
        <p className="text-xs sm:text-sm text-[#6D7E78] dark:text-[#8FA29B] mt-1">
          Everything you're studying, all in one place.
        </p>
      </div>

      {/* Main Two-Column Layout matching reference image: Left 2/3 (Stats + Folders), Right 1/3 (Sidebar Stack) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width): Top 4 Stats Metric Grid + Your Folders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 4 Stats Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Understanding Card */}
            <div className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6D7E78] dark:text-[#8FA29B] flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#005A57]/10 dark:bg-[#232D2D] text-[#005A57] dark:text-[#B8FF4D]">
                    <BookOpen className="size-4" />
                  </span>
                  Understanding
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-[#102B2B] dark:text-[#FBFAF6]">72%</div>
                <div className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mt-0.5">Overall mastery</div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#005A57]/10 dark:bg-[#232D2D] text-[#005A57] dark:text-[#B8FF4D] text-xs font-semibold border border-[#005A57]/20 dark:border-[#2A3838]">
                  ↑ 8% this week
                </span>
              </div>
              <div className="absolute right-0 bottom-0 pointer-events-none opacity-20 dark:opacity-10">
                <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                  <path d="M0 30 Q 30 10, 60 25 T 120 5 L 120 40 L 0 40 Z" fill="#005A57" />
                </svg>
              </div>
            </div>

            {/* Study Streak Card */}
            <div className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6D7E78] dark:text-[#8FA29B] flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                    <Flame className="size-4" />
                  </span>
                  Study streak
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-[#102B2B] dark:text-[#FBFAF6]">14</div>
                <div className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mt-0.5">Days in a row</div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200/60 dark:border-amber-900/40">
                  Keep it up! 🔥
                </span>
              </div>
            </div>

            {/* AI Interactions Card */}
            <div className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6D7E78] dark:text-[#8FA29B] flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                    <MessageSquare className="size-4" />
                  </span>
                  AI interactions
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-[#102B2B] dark:text-[#FBFAF6]">284</div>
                <div className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mt-0.5">Conversations</div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-900/40">
                  ↑ 18% this week
                </span>
              </div>
            </div>

            {/* Knowledge Gained Card */}
            <div className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6D7E78] dark:text-[#8FA29B] flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#DDE8DF] dark:bg-[#232D2D] text-[#003F3F] dark:text-[#B8FF4D]">
                    <Brain className="size-4" />
                  </span>
                  Knowledge gained
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-[#102B2B] dark:text-[#FBFAF6]">126</div>
                <div className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mt-0.5">New concepts</div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DDE8DF]/70 dark:bg-[#232D2D] text-[#003F3F] dark:text-[#B8FF4D] text-xs font-semibold border border-[#DDE8DF] dark:border-[#2A3838]">
                  ↑ 21% this week
                </span>
              </div>
            </div>
          </div>

          {/* Your Folders Container */}
          <div className="space-y-4">
          {/* Toolbar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#102B2B] dark:text-[#FBFAF6]">Your folders</h2>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#F5F3EC] dark:bg-[#181E1E] p-1 rounded-xl border border-[#DDE8DF] dark:border-[#2A3838]">
                <button
                  type="button"
                  onClick={() => setFilterState("all")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterState === "all"
                      ? "bg-[#003F3F] dark:bg-[#B8FF4D] text-[#B8FF4D] dark:text-[#003F3F] shadow-2xs"
                      : "text-[#6D7E78] dark:text-[#8FA29B] hover:text-[#102B2B] dark:hover:text-[#FBFAF6]"
                  }`}
                >
                  All ({foldersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterState("active")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterState === "active"
                      ? "bg-[#003F3F] dark:bg-[#B8FF4D] text-[#B8FF4D] dark:text-[#003F3F] shadow-2xs"
                      : "text-[#6D7E78] dark:text-[#8FA29B] hover:text-[#102B2B] dark:hover:text-[#FBFAF6]"
                  }`}
                >
                  Active ({foldersList.filter((f) => f.status === "active").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterState("onhold")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterState === "onhold"
                      ? "bg-[#003F3F] dark:bg-[#B8FF4D] text-[#B8FF4D] dark:text-[#003F3F] shadow-2xs"
                      : "text-[#6D7E78] dark:text-[#8FA29B] hover:text-[#102B2B] dark:hover:text-[#FBFAF6]"
                  }`}
                >
                  On hold ({foldersList.filter((f) => f.status === "onhold").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterState("completed")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterState === "completed"
                      ? "bg-[#003F3F] dark:bg-[#B8FF4D] text-[#B8FF4D] dark:text-[#003F3F] shadow-2xs"
                      : "text-[#6D7E78] dark:text-[#8FA29B] hover:text-[#102B2B] dark:hover:text-[#FBFAF6]"
                  }`}
                >
                  Completed ({foldersList.filter((f) => f.status === "completed").length})
                </button>
              </div>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
                className="px-3 py-1.5 bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] rounded-xl text-xs font-semibold text-[#102B2B] dark:text-[#FBFAF6] focus:outline-none cursor-pointer"
              >
                <option value="recent">Recent activity</option>
                <option value="mastery">Highest mastery</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Folder Rows List */}
          <div className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl divide-y divide-[#DDE8DF] dark:divide-[#2A3838] overflow-hidden shadow-2xs">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id || folder.title}
                onClick={onResume}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F5F3EC] dark:hover:bg-[#232D2D] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {getFolderIcon(folder.iconType)}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[#102B2B] dark:text-[#FBFAF6] group-hover:text-[#005A57] dark:group-hover:text-[#B8FF4D] transition-colors truncate">
                      {folder.title}
                    </h3>
                    <div className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mt-0.5">
                      Created {folder.createdDate} · {folder.chatsCount} chats
                    </div>
                    <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getFolderProgressColor(folder.mastery)}`}
                        style={{ width: `${folder.mastery}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8 shrink-0 self-end sm:self-center">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-bold text-[#102B2B] dark:text-[#FBFAF6]">{folder.mastery}%</div>
                    <div className="text-[11px] text-[#6D7E78] dark:text-[#8FA29B] font-medium">Mastery</div>
                  </div>

                  <div className="text-left sm:text-right min-w-[130px]">
                    <div className="text-[11px] font-bold text-[#005A57] dark:text-[#B8FF4D] uppercase font-mono tracking-wider">
                      Last activity
                    </div>
                    <div className="text-xs font-medium text-[#102B2B] dark:text-[#DDE8DF] truncate max-w-[160px]">
                      {folder.lastActivity}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResume();
                    }}
                    className="size-9 rounded-full border border-slate-200 dark:border-[#2A3838] text-slate-500 dark:text-[#8FA29B] group-hover:border-[#005A57] group-hover:bg-[#005A57] group-hover:text-white dark:group-hover:bg-[#B8FF4D] dark:group-hover:text-[#003F3F] flex items-center justify-center transition-all shrink-0"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Folder Action Button */}
          <button
            type="button"
            onClick={() => setIsFolderDialogOpen(true)}
            className="w-full py-4 border-2 border-dashed border-[#DDE8DF] dark:border-[#2A3838] hover:border-[#005A57] dark:hover:border-[#B8FF4D] rounded-2xl text-xs sm:text-sm font-bold text-[#005A57] dark:text-[#B8FF4D] bg-[#FBFAF6]/50 dark:bg-[#1C2323] hover:bg-[#E7EFE7] dark:hover:bg-[#232D2D] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>New folder</span>
          </button>
        </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="lg:col-span-1 space-y-6">
          {/* Widget 1: Learning Path Gauge */}
          <div className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6]">Learning path</h3>
              <button
                type="button"
                onClick={onSelectProgress || onResume}
                className="text-xs font-bold text-[#005A57] dark:text-[#B8FF4D] hover:underline"
              >
                View all
              </button>
            </div>

            <div>
              <h4 className="text-base font-bold text-[#102B2B] dark:text-[#FBFAF6]">BSc. Computer Science</h4>
              <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B]">2nd Year · Semester 2</p>
            </div>

            {/* Arc Progress Ring */}
            <div className="py-2 flex flex-col items-center justify-center relative">
              <svg className="w-44 h-24" viewBox="0 0 160 90">
                <path
                  d="M 15 80 A 65 65 0 0 1 145 80"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="dark:stroke-[#2A3838]"
                />
                <path
                  d="M 15 80 A 65 65 0 0 1 145 80"
                  fill="none"
                  stroke="url(#arc-gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="204"
                  strokeDashoffset={204 * (1 - 0.32)}
                />
                <defs>
                  <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#005A57" />
                    <stop offset="100%" stopColor="#B8FF4D" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-1 text-center">
                <div className="text-2xl font-bold text-[#102B2B] dark:text-[#FBFAF6]">32%</div>
                <div className="text-[11px] font-medium text-[#6D7E78] dark:text-[#8FA29B]">Program progress</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DDE8DF] dark:border-[#2A3838] flex items-center justify-between text-xs text-[#6D7E78] dark:text-[#8FA29B]">
              <span>Target: May 2026</span>
              <span className="font-semibold text-[#102B2B] dark:text-[#DDE8DF]">78 days remaining</span>
            </div>
          </div>

          {/* Widget 2: Today at a glance */}
          <div className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6]">Today at a glance</h3>
                <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B]">Where you left off</p>
              </div>
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shrink-0">
                <Target className="size-4" />
              </span>
            </div>

            <div className="bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] rounded-xl p-4 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6]">Polymorphism foundations</h4>
                <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mt-0.5">Object-Oriented Programming</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-[#DDE8DF]">
                  <span>Progress</span>
                  <span>63%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#005A57] dark:bg-[#B8FF4D] h-full rounded-full w-[63%]" />
                </div>
              </div>

              <button
                type="button"
                onClick={onResume}
                className="w-full py-2 bg-[#DDE8DF]/60 hover:bg-[#DDE8DF] dark:bg-[#232D2D] dark:hover:bg-[#2A3838] text-[#003F3F] dark:text-[#B8FF4D] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DDE8DF] dark:border-[#2A3838]"
              >
                <span>Go to last topic</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Widget 3: Activity insights */}
          <div className="bg-[#FBFAF6] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6]">Activity insights</h3>
              <select className="bg-transparent text-xs font-semibold text-[#6D7E78] dark:text-[#8FA29B] focus:outline-none cursor-pointer">
                <option>This week</option>
                <option>This month</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] p-3 rounded-xl">
                <div className="text-[11px] font-medium text-[#6D7E78] dark:text-[#8FA29B] truncate">Flashcards reviewed</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6]">128</span>
                  <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                    <path d="M0 12 Q 10 4, 20 8 T 40 2" fill="none" stroke="#10B981" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              <div className="bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] p-3 rounded-xl">
                <div className="text-[11px] font-medium text-[#6D7E78] dark:text-[#8FA29B] truncate">Questions answered</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6]">96</span>
                  <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                    <path d="M0 14 Q 10 2, 20 10 T 40 4" fill="none" stroke="#005A57" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              <div className="bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] p-3 rounded-xl">
                <div className="text-[11px] font-medium text-[#6D7E78] dark:text-[#8FA29B] truncate">Quiz accuracy</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6]">78%</span>
                  <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                    <path d="M0 10 Q 10 14, 20 4 T 40 8" fill="none" stroke="#00A896" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              <div className="bg-white dark:bg-[#181E1E] border border-[#DDE8DF] dark:border-[#2A3838] p-3 rounded-xl">
                <div className="text-[11px] font-medium text-[#6D7E78] dark:text-[#8FA29B] truncate">Time learned</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6]">8h 24m</span>
                  <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                    <path d="M0 14 Q 10 8, 20 12 T 40 2" fill="none" stroke="#F59E0B" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 4: Motivational Card */}
          <div className="bg-[#E7EFE7] dark:bg-[#232D2D] border border-[#DDE8DF] dark:border-[#2A3838] rounded-2xl p-5 relative overflow-hidden space-y-2 shadow-2xs">
            <h4 className="text-base font-bold text-[#102B2B] dark:text-[#FBFAF6]">Small steps, big mastery.</h4>
            <p className="text-xs text-[#6D7E78] dark:text-[#DDE8DF] max-w-[200px] leading-relaxed">
              Your consistency is building knowledge that lasts.
            </p>

            <button
              type="button"
              onClick={onSelectProgress || onResume}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#005A57] dark:text-[#B8FF4D] hover:underline pt-2 cursor-pointer"
            >
              <span>See your progress</span>
              <ChevronRight className="size-3.5" />
            </button>

            <div className="absolute right-0 bottom-0 pointer-events-none opacity-30 dark:opacity-10">
              <svg width="110" height="80" viewBox="0 0 110 80" fill="none">
                <path d="M40 80 L75 25 L110 80 Z" fill="#005A57" />
                <path d="M0 80 L45 35 L90 80 Z" fill="#6D7E78" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Creation Dialog Component */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent showCloseButton className="sm:max-w-md bg-[#FBFAF6] dark:bg-slate-900 border-[#DDE8DF] dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B2B] dark:text-white flex items-center gap-2">
              <FolderOpen className="size-4 text-[#005A57] dark:text-[#B8FF4D]" />
              <span>Create Learning Folder</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6D7E78] dark:text-slate-400">
              Organize your study cards, quizzes, and learning objects into dedicated course folders.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFolder} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#102B2B] dark:text-slate-200 mb-1.5">
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. CSC 301 · Algorithms"
                autoFocus
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-[#DDE8DF] dark:border-slate-700 rounded-xl text-sm text-[#102B2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005A57]/30"
              />
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsFolderDialogOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] border border-[#005A57] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all"
              >
                Create folder
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function LearningObject({
  type,
  title,
  description,
  meta,
  action,
  onClick,
  accent,
  topic,
  date,
  favorite,
  favoriteFolder,
  favoriteFolders,
  onToggleFavorite,
  onAssignFolder,
}: {
  type: string;
  title: string;
  description: string;
  meta: string;
  action: string;
  onClick: () => void;
  accent: string;
  topic: string;
  date: string;
  favorite: boolean;
  favoriteFolder: string;
  favoriteFolders: string[];
  onToggleFavorite: (title: string) => void;
  onAssignFolder: (title: string, folder: string) => void;
}) {
  const note = `${title}\n${description}\n${topic} · ${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}\n${meta}`;

  return (
    <article className="group relative bg-[#FBFAF6] dark:bg-slate-900/90 border border-[#DDE8DF] dark:border-slate-800 hover:border-[#005A57] dark:hover:border-[#B8FF4D] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="px-2.5 py-1 rounded-lg bg-[#E7EFE7] dark:bg-[#003F3F] text-[#003F3F] dark:text-[#B8FF4D] text-xs font-bold font-mono tracking-wide uppercase">
            {type}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-[#102B2B] dark:text-white group-hover:text-[#005A57] dark:group-hover:text-[#B8FF4D] transition-colors leading-snug">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#6D7E78] dark:text-slate-300 mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>

      <footer className="pt-4 border-t border-[#DDE8DF] dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => shareText(title, note, `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`)}
            className="p-2 text-slate-500 hover:text-[#003F3F] dark:hover:text-[#B8FF4D] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Share card summary"
          >
            <Share2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => exportText(title, note, `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`)}
            className="p-2 text-slate-500 hover:text-[#003F3F] dark:hover:text-[#B8FF4D] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Export as text file"
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(title)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              favorite
                ? "bg-[#003F3F] text-[#B8FF4D]"
                : "text-slate-500 hover:text-[#003F3F] dark:hover:text-[#B8FF4D] hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={favorite ? "Remove from favorites" : "Save to favorites"}
          >
            {favorite ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={onClick}
          className="px-4 py-2 bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] border border-[#005A57] text-xs sm:text-sm font-bold rounded-full shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>{action}</span>
          <ChevronRight className="size-4" />
        </button>
      </footer>
    </article>
  );
}

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
