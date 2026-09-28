from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import watchlist, alerts
from fastapi import WebSocket, WebSocketDisconnect
from app.core.ws_manager import manager
from app.core.db import Base, engine
import app.models  # noqa: F401 — registers Camera and CameraAuditLog with Base
from app.routers.cameras import router as cameras_router
from app.routers import dashboard
from app.routers import trace
from app.routers import events
Base.metadata.create_all(bind=engine)

app = FastAPI(title="okDriver CCTV Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cameras_router)
app.include_router(watchlist.router)
app.include_router(alerts.router)
app.include_router(events.router)
app.include_router(dashboard.router)
app.include_router(trace.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keeps connection alive, ignores incoming pings
    except WebSocketDisconnect:
        manager.disconnect(websocket)

