from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.core.db import get_db
from app.core.ws_manager import manager
from app.models.detection_event import DetectionEvent
from app.models.alert import Alert
from app.schemas.detection_event import DetectionEventCreate, DetectionEventOut
from app.services.matcher import check_watchlist_match
from app.services.dedup import is_duplicate_alert

router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("/detection")
async def ingest_detection(payload: DetectionEventCreate, db: Session = Depends(get_db)):
    event = DetectionEvent(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)

    matched_entry = check_watchlist_match(db, payload.identifier)

    if not matched_entry:
        return {
            "event_id": event.id,
            "watchlist_match": False,
            "alert_created": False,
            "alert_id": None,
            "reason": None,
        }

    if is_duplicate_alert(db, payload.camera_id, matched_entry.id):
        return {
            "event_id": event.id,
            "watchlist_match": True,
            "alert_created": False,
            "alert_id": None,
            "reason": "duplicate_suppressed",
        }

    alert = Alert(
        camera_id=payload.camera_id,
        watchlist_entry_id=matched_entry.id,
        matched_identifier=payload.identifier,
        confidence=payload.confidence,
        status="new",
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    await manager.broadcast({
        "type": "new_alert",
        "alert": {
            "id": alert.id,
            "camera_id": alert.camera_id,
            "matched_identifier": alert.matched_identifier,
            "confidence": alert.confidence,
            "status": alert.status,
            "detected_at": alert.detected_at.isoformat(),
            "category": matched_entry.category,
            "severity": matched_entry.severity,
            "description": matched_entry.description,
        },
    })

    return {
        "event_id": event.id,
        "watchlist_match": True,
        "alert_created": True,
        "alert_id": alert.id,
        "reason": None,
    }


@router.get("/detection", response_model=list[DetectionEventOut])
def list_detections(
    camera_id: Optional[str] = None,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(DetectionEvent)
    if camera_id:
        query = query.filter(DetectionEvent.camera_id == camera_id)
    if event_type:
        query = query.filter(DetectionEvent.event_type == event_type)
    return query.order_by(DetectionEvent.timestamp.desc()).limit(100).all()