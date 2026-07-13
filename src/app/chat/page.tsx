import { ChatWorkspace } from "@/components/chat-workspace"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat — Summa AI",
  description: "Chat with Summa AI, your adaptive learning companion that remembers your knowledge, gaps, and goals.",
}


export const dynamic = "force-dynamic"

export default function ChatPage() {
  return <ChatWorkspace />
}
