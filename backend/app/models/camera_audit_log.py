from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String
from app.core.db import Base


class CameraAuditLog(Base):
    __tablename__ = "camera_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    camera_id = Column(String(50), nullable=False, index=True)
    action = Column(String(50), nullable=False)
    detail = Column(String(500), nullable=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
