"""Seed script: inserts initial cameras if they don't already exist."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.db import Base, SessionLocal, engine  # noqa: E402
import app.models  # noqa: F401, E402

Base.metadata.create_all(bind=engine)

CAMERAS = [
    {
        "camera_id": "C001",
        "name": "Ahmedabad Traffic Junction",
        "department": "Traffic Police",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "camera_type": "traffic_junction",
        "source_protocol": "RTSP",
        "status": "online",
        "zone": "Zone A",
    },
    {
        "camera_id": "C002",
        "name": "RTO Checkpoint Gandhinagar",
        "department": "RTO",
        "latitude": 23.2156,
        "longitude": 72.6369,
        "camera_type": "rto_checkpoint",
        "source_protocol": "ONVIF",
        "status": "online",
        "zone": "Zone B",
    },
]


def seed():
    from app.models.camera import Camera

    db = SessionLocal()
    try:
        for data in CAMERAS:
            exists = db.query(Camera).filter(Camera.camera_id == data["camera_id"]).first()
            if exists:
                print(f"  SKIP   {data['camera_id']} — already exists")
            else:
                db.add(Camera(**data))
                db.commit()
                print(f"  INSERT {data['camera_id']}: {data['name']}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
