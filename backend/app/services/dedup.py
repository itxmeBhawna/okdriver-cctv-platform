from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.alert import Alert


def is_duplicate_alert(db: Session, camera_id: str, watchlist_entry_id: int, window_seconds: int = 300) -> bool:
    cutoff = datetime.utcnow() - timedelta(seconds=window_seconds)
    existing = (
        db.query(Alert)
        .filter(
            Alert.camera_id == camera_id,
            Alert.watchlist_entry_id == watchlist_entry_id,
            Alert.status == "new",
            Alert.detected_at >= cutoff,
        )
        .first()
    )
    return existing is not None