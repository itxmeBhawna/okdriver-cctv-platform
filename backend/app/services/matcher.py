from sqlalchemy.orm import Session
from app.models.watchlist import WatchlistEntry


def check_watchlist_match(db: Session, identifier: str) -> WatchlistEntry | None:
    cleaned = identifier.strip().lower()
    entries = db.query(WatchlistEntry).filter(WatchlistEntry.is_active == True).all()
    for entry in entries:
        if entry.identifier.strip().lower() == cleaned:
            return entry
    return None