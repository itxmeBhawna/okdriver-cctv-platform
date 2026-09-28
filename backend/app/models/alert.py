from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    camera_id = Column(String(50), nullable=False, index=True)
    watchlist_entry_id = Column(Integer, ForeignKey("watchlist_entries.id"), nullable=False)
    matched_identifier = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="new")  # new, acknowledged, resolved
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    watchlist_entry = relationship("WatchlistEntry", lazy="joined")