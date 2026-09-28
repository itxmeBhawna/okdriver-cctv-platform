from pydantic import BaseModel, confloat
from typing import Optional
from datetime import datetime


class DetectionEventCreate(BaseModel):
    camera_id: str
    event_type: str
    identifier: str
    vehicle_type: Optional[str] = None
    confidence: confloat(ge=0.0, le=1.0)
    bounding_box: Optional[str] = None
    timestamp: datetime


class DetectionEventOut(BaseModel):
    id: int
    camera_id: str
    event_type: str
    identifier: str
    vehicle_type: Optional[str]
    confidence: float
    bounding_box: Optional[str]
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True