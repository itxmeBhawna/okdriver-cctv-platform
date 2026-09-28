from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.db import Base


class DetectionEvent(Base):
    __tablename__ = "detection_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    camera_id = Column(String(50), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    identifier = Column(String(100), nullable=False, index=True)
    vehicle_type = Column(String(50), nullable=True)
    confidence = Column(Float, nullable=False)
    bounding_box = Column(String(200), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())