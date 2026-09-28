import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import watchlist, alerts, auth
from fastapi import HTTPException, WebSocket, WebSocketDisconnect
from app.core.ws_manager import manager
from app.core.db import Base, SessionLocal, engine
from app.core.security import get_current_operator, get_current_user
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
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(dashboard.router)
app.include_router(trace.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    try:
        token = await asyncio.wait_for(websocket.receive_text(), timeout=5)
    except asyncio.TimeoutError:
        await websocket.close(code=1008)
        return
    except WebSocketDisconnect:
        return

    db = SessionLocal()
    try:
        user = get_current_user(token=token, db=db)
        get_current_operator(user=user)
    except HTTPException:
        await websocket.close(code=1008)
        return
    finally:
        db.close()

    await manager.connect(websocket, accept=False)
    try:
        while True:
            await websocket.receive_text()  # keeps connection alive, ignores incoming pings
    except WebSocketDisconnect:
        manager.disconnect(websocket)

