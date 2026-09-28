from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from app.core.db import Base


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, autoincrement=True)
    camera_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    camera_type = Column(String(100), nullable=False)
    source_protocol = Column(String(50), nullable=False)
    stream_endpoint = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="offline")
    last_heartbeat = Column(DateTime, nullable=True)
    zone = Column(String(100), nullable=True)
    is_disabled = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
