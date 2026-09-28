from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WatchlistCreate(BaseModel):
    entity_type: str
    identifier: str
    category: str
    description: Optional[str] = None
    severity: str = "medium"


class WatchlistUpdate(BaseModel):
    entity_type: Optional[str] = None
    identifier: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    is_active: Optional[bool] = None


class WatchlistOut(BaseModel):
    id: int
    entity_type: str
    identifier: str
    category: str
    description: Optional[str]
    severity: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True