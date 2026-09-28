from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_admin, get_current_operator
from app.models.camera import Camera
from app.models.camera_audit_log import CameraAuditLog
from app.schemas.camera import AuditLogOut, CameraCreate, CameraOut, CameraUpdate

router = APIRouter(
    prefix="/api/cameras",
    tags=["cameras"],
    dependencies=[Depends(get_current_operator)],
)


def _get_camera_or_404(camera_id: str, db: Session) -> Camera:
    cam = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return cam


def _write_audit(db: Session, camera_id: str, action: str, detail: str = None):
    db.add(CameraAuditLog(camera_id=camera_id, action=action, detail=detail))


@router.post("/", response_model=CameraOut, status_code=201, dependencies=[Depends(get_current_admin)])
def create_camera(payload: CameraCreate, db: Session = Depends(get_db)):
    if db.query(Camera).filter(Camera.camera_id == payload.camera_id).first():
        raise HTTPException(status_code=409, detail="camera_id already exists")
    cam = Camera(**payload.model_dump())
    db.add(cam)
    _write_audit(db, payload.camera_id, "created")
    db.commit()
    db.refresh(cam)
    return cam


@router.get("/", response_model=list[CameraOut])
def list_cameras(
    department: Optional[str] = None,
    status: Optional[str] = None,
    zone: Optional[str] = None,
    search: Optional[str] = None,
    include_disabled: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    q = db.query(Camera)
    if not include_disabled:
        q = q.filter(Camera.is_disabled == False)  # noqa: E712
    if department:
        q = q.filter(Camera.department == department)
    if status:
        q = q.filter(Camera.status == status)
    if zone:
        q = q.filter(Camera.zone == zone)
    if search:
        q = q.filter(
            Camera.name.ilike(f"%{search}%") | Camera.camera_id.ilike(f"%{search}%")
        )
    return q.all()


@router.get("/{camera_id}/audit", response_model=list[AuditLogOut])
def get_audit(camera_id: str, db: Session = Depends(get_db)):
    _get_camera_or_404(camera_id, db)
    return (
        db.query(CameraAuditLog)
        .filter(CameraAuditLog.camera_id == camera_id)
        .order_by(CameraAuditLog.timestamp.desc())
        .all()
    )


@router.get("/{camera_id}", response_model=CameraOut)
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    return _get_camera_or_404(camera_id, db)


@router.put("/{camera_id}", response_model=CameraOut, dependencies=[Depends(get_current_admin)])
def update_camera(camera_id: str, payload: CameraUpdate, db: Session = Depends(get_db)):
    cam = _get_camera_or_404(camera_id, db)
    changes = []
    for field, value in payload.model_dump(exclude_unset=True).items():
        if getattr(cam, field) != value:
            changes.append(f"{field}: {getattr(cam, field)!r} -> {value!r}")
            setattr(cam, field, value)
    cam.updated_at = datetime.utcnow()
    if changes:
        _write_audit(db, camera_id, "updated", "; ".join(changes))
    db.commit()
    db.refresh(cam)
    return cam


@router.patch("/{camera_id}/disable", response_model=CameraOut, dependencies=[Depends(get_current_admin)])
def disable_camera(camera_id: str, db: Session = Depends(get_db)):
    cam = _get_camera_or_404(camera_id, db)
    cam.is_disabled = True
    cam.updated_at = datetime.utcnow()
    _write_audit(db, camera_id, "disabled")
    db.commit()
    db.refresh(cam)
    return cam
