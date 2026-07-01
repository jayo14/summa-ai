import { NextRequest } from "next/server"

import { fastapiUrl } from "@/lib/fastapi"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.text()

  const upstream = await fetch(fastapiUrl("/chat/stream"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
  })

  if (!upstream.body) {
    return new Response(JSON.stringify({ error: "Upstream stream unavailable" }), {
      status: 502,
      headers: {
        "content-type": "application/json",
      },
    })
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  })
}

