"""Summa AI — FastAPI entry point."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from app.config import settings
from app.core.security import ConnectionManager, current_user_id, reset_current_user_id, set_current_user_id, verify_access_token
from app.services.cognee_service import CogneeService
from app.routes import auth, chat, memory
from app.routes.data_routes import (artifacts_router, conv_router, timeline_router,
    user_router, settings_router, materials_router, concepts_router, analytics_router)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)
manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await CogneeService.initialize()
    logger.info("🚀 Summa AI API Started")
    yield
    logger.info("👋 Summa AI API Shutting Down")

app = FastAPI(title="Summa AI API", version="1.0.0", description="AI-Native Learning Workspace API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.get_cors_origins(), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

PUBLIC_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc", f"{settings.API_V1_STR}/auth/login"}


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    if path in PUBLIC_PATHS or not path.startswith(settings.API_V1_STR):
        return await call_next(request)

    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)

    token = auth_header.split(" ", 1)[1].strip()
    user_id = verify_access_token(token)
    if not user_id:
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)

    token_state = set_current_user_id(user_id)
    request.state.user_id = user_id
    try:
        response = await call_next(request)
    finally:
        reset_current_user_id(token_state)
    return response


for r, tag in [(auth.router,"auth"),(chat.router,"chat"),(memory.router,"memory"),(artifacts_router,"artifacts"),(conv_router,"conversations"),(timeline_router,"timeline"),(user_router,"user"),(settings_router,"settings"),(materials_router,"materials"),(concepts_router,"concepts"),(analytics_router,"analytics")]:
    app.include_router(r, prefix=settings.API_V1_STR, tags=[tag])

@app.get("/health", tags=["health"], summary="Health check", description="Returns API health status and online connection count")
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "summa-ai-api", "online_connections": manager.get_online_count()}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    token = websocket.query_params.get("token")
    if not token or not verify_access_token(token):
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_to_user(user_id, {"type": "echo", "message": f"Echo: {data}"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.get("/", tags=["root"], summary="API root", description="Redirects to Swagger UI documentation")
async def root():
    return RedirectResponse(url="/docs")
