"""Summa AI — FastAPI entry point."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .core.security import ConnectionManager
from .services.cognee_service import CogneeService
from .routes import chat, memory
from .routes.data_routes import (artifacts_router, conv_router, timeline_router,
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
app.add_middleware(CORSMiddleware, allow_origins=settings.BACKEND_CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

for r, tag in [(chat.router,"chat"),(memory.router,"memory"),(artifacts_router,"artifacts"),(conv_router,"conversations"),(timeline_router,"timeline"),(user_router,"user"),(settings_router,"settings"),(materials_router,"materials"),(concepts_router,"concepts"),(analytics_router,"analytics")]:
    app.include_router(r, prefix=settings.API_V1_STR, tags=[tag])

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "summa-ai-api", "online_connections": manager.get_online_count()}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_to_user(user_id, {"type": "echo", "message": f"Echo: {data}"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.get("/", tags=["root"])
async def root():
    return {"name": "Summa AI API", "version": "1.0.0", "docs": "/docs", "health": "/health"}
