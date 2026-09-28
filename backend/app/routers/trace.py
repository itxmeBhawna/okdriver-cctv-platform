from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import get_current_operator
from app.models.detection_event import DetectionEvent
from app.models.camera import Camera

router = APIRouter(
    prefix="/api/trace",
    tags=["trace"],
    dependencies=[Depends(get_current_operator)],
)


@router.get("/{identifier}")
def get_vehicle_trace(identifier: str, db: Session = Depends(get_db)):
    events = (
        db.query(DetectionEvent)
        .filter(DetectionEvent.identifier == identifier.strip())
        .order_by(DetectionEvent.timestamp.asc())
        .all()
    )

    if not events:
        raise HTTPException(status_code=404, detail=f"No detection history found for '{identifier}'")

    trace_points = []
    for event in events:
        camera = db.query(Camera).filter(Camera.camera_id == event.camera_id).first()
        trace_points.append({
            "camera_id": event.camera_id,
            "camera_name": camera.name if camera else event.camera_id,
            "latitude": camera.latitude if camera else None,
            "longitude": camera.longitude if camera else None,
            "timestamp": event.timestamp.isoformat(),
            "confidence": event.confidence,
            "event_type": event.event_type,
        })

    return {
        "identifier": identifier,
        "total_sightings": len(trace_points),
        "trace": trace_points,
    }