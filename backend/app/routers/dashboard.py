from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.camera import Camera
from app.models.alert import Alert
from app.models.watchlist import WatchlistEntry
from app.models.detection_event import DetectionEvent
from app.schemas.alert import AlertOut
from app.schemas.detection_event import DetectionEventOut

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    cameras = db.query(Camera).filter(Camera.is_disabled == False).all()
    online_count = sum(1 for c in cameras if c.status == "online")
    offline_count = sum(1 for c in cameras if c.status == "offline")
    degraded_count = sum(1 for c in cameras if c.status == "degraded")

    active_alerts_count = db.query(Alert).filter(Alert.status == "new").count()
    active_watchlist_count = db.query(WatchlistEntry).filter(WatchlistEntry.is_active == True).count()

    recent_alerts = (
        db.query(Alert).order_by(Alert.detected_at.desc()).limit(10).all()
    )
    recent_events = (
        db.query(DetectionEvent).order_by(DetectionEvent.timestamp.desc()).limit(10).all()
    )

    return {
        "camera_stats": {
            "total": len(cameras),
            "online": online_count,
            "offline": offline_count,
            "degraded": degraded_count,
        },
        "active_alerts_count": active_alerts_count,
        "active_watchlist_count": active_watchlist_count,
        "recent_alerts": [AlertOut.model_validate(a).model_dump(mode="json") for a in recent_alerts],
        "recent_events": [DetectionEventOut.model_validate(e).model_dump(mode="json") for e in recent_events],
    }