"""Summa AI — FastAPI entry point."""
import logging
import time
from contextlib import asynccontextmanager
from typing import Dict
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from app.config import settings
from app.core.security import (ConnectionManager, current_user_id, reset_current_user_id,
    reset_current_jwt_token, set_current_jwt_token,
    set_current_user_id, verify_supabase_jwt)
from app.services.cognee_service import CogneeService
from app.routes import auth, chat, memory
from app.routes.data_routes import (artifacts_router, conv_router, timeline_router,
    user_router, settings_router, materials_router, concepts_router, analytics_router)

if settings.SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.1 if settings.is_production else 1.0,
    )

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)
manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    missing = []
    if settings.is_production:
        if not settings.SUPABASE_JWT_SECRET:
            missing.append("SUPABASE_JWT_SECRET")
        if not settings.COGNEE_API_KEY:
            missing.append("COGNEE_API_KEY")
        if not settings.SUPABASE_URL:
            missing.append("SUPABASE_URL")
        if not settings.SUPABASE_ANON_KEY:
            missing.append("SUPABASE_ANON_KEY")
        if not settings.DATABASE_URL or settings.DATABASE_URL == "postgresql://postgres:password@localhost:5432/postgres":
            missing.append("DATABASE_URL")
    if missing:
        raise RuntimeError(
            "Refusing to start in production without required config: "
            + ", ".join(missing)
            + ". Set these environment variables before deploying."
        )
    await CogneeService.initialize()
    logger.info("🚀 Summa AI API Started")
    yield
    logger.info("👋 Summa AI API Shutting Down")

app = FastAPI(title="Summa AI API", version="1.0.0", description="AI-Native Learning Workspace API", lifespan=lifespan)

# Simple in-memory rate limiter state
_rate_limit_store: Dict[str, list] = {}


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if not settings.is_production:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60

    requests = _rate_limit_store.get(client_ip, [])
    requests = [ts for ts in requests if now - ts < window]

    if len(requests) >= 100:
        return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)

    requests.append(now)
    _rate_limit_store[client_ip] = requests
    return await call_next(request)


PUBLIC_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc", f"{settings.API_V1_STR}/auth/login", f"{settings.API_V1_STR}/auth/signup"}


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    if request.method == "OPTIONS" or path in PUBLIC_PATHS or not path.startswith(settings.API_V1_STR):
        return await call_next(request)

    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)

    token = auth_header.split(" ", 1)[1].strip()
    user_id = verify_supabase_jwt(token)
    if not user_id:
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)

    token_state = set_current_user_id(user_id)
    jwt_state = set_current_jwt_token(token)
    request.state.user_id = user_id
    try:
        response = await call_next(request)
    finally:
        reset_current_user_id(token_state)
        reset_current_jwt_token(jwt_state)
    return response


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    import time
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "HTTP %s %s -> %d (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.add_middleware(CORSMiddleware, allow_origins=settings.get_cors_origins(), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)

for r, tag in [(auth.router,"auth"),(chat.router,"chat"),(memory.router,"memory"),(artifacts_router,"artifacts"),(conv_router,"conversations"),(timeline_router,"timeline"),(user_router,"user"),(settings_router,"settings"),(materials_router,"materials"),(concepts_router,"concepts"),(analytics_router,"analytics")]:
    app.include_router(r, prefix=settings.API_V1_STR, tags=[tag])

@app.get("/health", tags=["health"], summary="Health check", description="Returns API health status and online connection count")
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "summa-ai-api", "online_connections": manager.get_online_count()}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    token = websocket.query_params.get("token")
    if not token or not verify_supabase_jwt(token):
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_to_user(user_id, {"type": "echo", "message": f"Echo: {data}"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


@app.post("/ws/broadcast", tags=["websocket"], summary="Broadcast message", description="Send a message to all connected WebSocket clients")
async def broadcast_message(message: dict):
    if not settings.WEBSOCKET_ENABLED:
        raise HTTPException(status_code=503, detail="WebSocket disabled")
    await manager.broadcast(message)
    return {"status": "broadcasted"}

@app.get("/", tags=["root"], summary="API root", description="Redirects to Swagger UI documentation")
async def root():
    return RedirectResponse(url="/docs")
