from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WatchlistBrief(BaseModel):
    category: str
    severity: str
    description: Optional[str]

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    camera_id: str
    watchlist_entry_id: int
    matched_identifier: str
    confidence: float
    status: str
    detected_at: datetime
    acknowledged_at: Optional[datetime]
    resolved_at: Optional[datetime]
    acknowledged_by: Optional[str]
    watchlist_entry: Optional[WatchlistBrief] = None

    class Config:
        from_attributes = True


class AlertStatusUpdate(BaseModel):
    acknowledged_by: Optional[str] = None