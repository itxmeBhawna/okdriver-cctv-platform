from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.db import get_db
from app.core.security import get_current_admin, get_current_operator
from app.models.audit_log import AuditLog
from app.models.watchlist import WatchlistEntry
from app.schemas.watchlist import WatchlistCreate, WatchlistUpdate, WatchlistOut

router = APIRouter(
    prefix="/api/watchlist",
    tags=["watchlist"],
    dependencies=[Depends(get_current_operator)],
)


@router.post("/", response_model=WatchlistOut, status_code=201, dependencies=[Depends(get_current_admin)])
def create_entry(payload: WatchlistCreate, db: Session = Depends(get_db)):
    entry = WatchlistEntry(**payload.model_dump())
    db.add(entry)
    db.flush()
    db.add(AuditLog(entity_type="watchlist_entry", entity_id=str(entry.id), action="created"))
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/", response_model=list[WatchlistOut])
def list_entries(
    entity_type: Optional[str] = None,
    category: Optional[str] = None,
    is_active: bool = True,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(WatchlistEntry).filter(WatchlistEntry.is_active == is_active)
    if entity_type:
        query = query.filter(WatchlistEntry.entity_type == entity_type)
    if category:
        query = query.filter(WatchlistEntry.category == category)
    if search:
        query = query.filter(WatchlistEntry.identifier.ilike(f"%{search}%"))
    return query.order_by(WatchlistEntry.created_at.desc()).all()


@router.put("/{entry_id}", response_model=WatchlistOut, dependencies=[Depends(get_current_admin)])
def update_entry(entry_id: int, payload: WatchlistUpdate, db: Session = Depends(get_db)):
    entry = db.query(WatchlistEntry).filter(WatchlistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.add(AuditLog(entity_type="watchlist_entry", entity_id=str(entry.id), action="updated"))
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", response_model=WatchlistOut, dependencies=[Depends(get_current_admin)])
def deactivate_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(WatchlistEntry).filter(WatchlistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    entry.is_active = False
    db.add(AuditLog(entity_type="watchlist_entry", entity_id=str(entry.id), action="deactivated"))
    db.commit()
    db.refresh(entry)
    return entry