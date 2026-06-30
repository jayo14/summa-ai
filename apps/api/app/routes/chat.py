"""Chat route — streams from Z.ai GLM + intent detection."""
import json, logging, re
from typing import AsyncGenerator
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.chat import ChatRequest, ChatResponse, ArtifactRef
from app.services.cognee_service import CogneeService

logger = logging.getLogger(__name__)
router = APIRouter()
cognee = CogneeService()

ZAI_API_BASE = "https://internal-api.z.ai/v1"
ZAI_API_KEY = "Z.ai"
ZAI_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmNjZWVlNzAtNjhhYy00NTNjLWE0NTItNDQwMmJlZjc4YzMxIiwiY2hhdF9pZCI6ImNoYXQtNGY1YmQ5ZTUtYmZiOS00ZWZjLTgwMmEtMWY5YzUxZjE5NjBmIiwicGxhdGZvcm0iOiJ6YWkifQ.pWpT01NAB2O82ch_exOjca4k6dwbRCAtfi6NSZRs-E4"
ZAI_USER_ID = "bcceee70-68ac-453c-a452-4402bef78c31"

INTENT_PATTERNS = {
    "quiz": [re.compile(r"\bquiz me\b", re.I), re.compile(r"\btest me\b", re.I)],
    "flashcards": [re.compile(r"\bflash ?cards?\b", re.I)],
    "study-plan": [re.compile(r"\bstudy plan\b", re.I), re.compile(r"\bexam prep\b", re.I)],
    "hexagon": [re.compile(r"\b(progress|hexagon|proficien)\b", re.I)],
    "graph": [re.compile(r"\b(knowledge )?graph\b", re.I)],
    "timeline": [re.compile(r"\b(schedule|timeline|calendar)\b", re.I)],
    "gap-analysis": [re.compile(r"\b(gap|missing|need to learn)\b", re.I)],
}

def detect_intent(text: str) -> str | None:
    for ct, patterns in INTENT_PATTERNS.items():
        if any(p.search(text) for p in patterns): return ct
    return None

async def _stream_zai(messages: list[dict], enable_thinking: bool = True) -> AsyncGenerator[str, None]:
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
            async with client.stream("POST", f"{ZAI_API_BASE}/chat/completions",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {ZAI_API_KEY}", "X-Z-AI-From": "Z", "X-Token": ZAI_TOKEN, "X-User-Id": ZAI_USER_ID},
                json={"model": "glm-4.5", "messages": [{"role": "system", "content": "You are Summa AI, an adaptive learning companion. Keep explanations concise, friendly, and well-structured with Markdown."}, *messages],
                      "stream": True, "thinking": {"type": "enabled" if enable_thinking else "disabled"}},
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "): continue
                    payload = line[6:].strip()
                    if not payload or payload == "[DONE]": continue
                    try:
                        chunk = json.loads(payload)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        reasoning = delta.get("reasoning_content") or delta.get("reasoning") or delta.get("thinking")
                        content = delta.get("content")
                        if reasoning: yield f"data: {json.dumps({'type': 'thinking', 'delta': reasoning})}\n\n"
                        if content: yield f"data: {json.dumps({'type': 'content', 'delta': content})}\n\n"
                    except json.JSONDecodeError: continue
        yield "data: [DONE]\n\n"
    except Exception as e:
        logger.error(f"Z.ai stream failed: {e}")
        for word in "I'd be happy to help! Could you tell me more?".split():
            yield f"data: {json.dumps({'type': 'content', 'delta': word + ' '})}\n\n"
        yield "data: [DONE]\n\n"

@router.post("/chat", response_model=ChatResponse, summary="Chat (non-streaming)", description="Process a chat message and return a response with detected intent artifacts")
async def chat(request: ChatRequest):
    intent = detect_intent(request.messages[-1].content if request.messages else "")
    artifacts = [ArtifactRef(id=f"pending-{intent}", title=intent.replace("-", " ").title(), type=intent)] if intent else []
    await cognee.recall_context(request.user_id, request.messages[-1].content if request.messages else "")
    return ChatResponse(response="(Use /chat/stream for streaming)", artifacts=artifacts, conversation_id=request.conversation_id, reasoning=f"Intent: {intent or 'none'}")

@router.post("/chat/stream", summary="Chat (streaming)", description="Stream chat response using Server-Sent Events with optional thinking blocks")
async def chat_stream(request: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    intent = detect_intent(request.messages[-1].content if request.messages else "")
    async def generate():
        if intent:
            yield f"data: {json.dumps({'type': 'artifact', 'artifact': {'id': f'pending-{intent}', 'title': intent.replace('-', ' ').title(), 'type': intent}})}\n\n"
        async for event in _stream_zai(messages, request.enable_thinking): yield event
    return StreamingResponse(generate(), media_type="text/event-stream")
