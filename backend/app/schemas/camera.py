from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CameraCreate(BaseModel):
    camera_id: str
    name: str
    department: str
    latitude: float
    longitude: float
    camera_type: str
    source_protocol: str
    stream_endpoint: Optional[str] = None
    status: str = "offline"
    zone: Optional[str] = None


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    camera_type: Optional[str] = None
    source_protocol: Optional[str] = None
    stream_endpoint: Optional[str] = None
    status: Optional[str] = None
    last_heartbeat: Optional[datetime] = None
    zone: Optional[str] = None
    is_disabled: Optional[bool] = None


class CameraOut(BaseModel):
    id: int
    camera_id: str
    name: str
    department: str
    latitude: float
    longitude: float
    camera_type: str
    source_protocol: str
    stream_endpoint: Optional[str] = None
    status: str
    last_heartbeat: Optional[datetime] = None
    zone: Optional[str] = None
    is_disabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuditLogOut(BaseModel):
    id: int
    camera_id: str
    action: str
    detail: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}
