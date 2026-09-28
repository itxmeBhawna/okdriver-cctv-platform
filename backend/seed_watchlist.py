from app.core.db import SessionLocal, Base, engine
from app.models.watchlist import WatchlistEntry
import app.models  # noqa: ensures all models are registered before create_all

Base.metadata.create_all(bind=engine)

db = SessionLocal()

entries = [
    {
        "entity_type": "vehicle",
        "identifier": "GJ01XX0001",
        "category": "stolen_vehicle",
        "severity": "high",
        "description": "Reported stolen from Ahmedabad on 2026-09-01",
    },
    {
        "entity_type": "vehicle",
        "identifier": "GJ05YY9999",
        "category": "blacklisted_vehicle",
        "severity": "critical",
        "description": "Involved in hit-and-run, absconding",
    },
    {
        "entity_type": "person",
        "identifier": "MISSING-2026-0142",
        "category": "missing_person",
        "severity": "high",
        "description": "Last seen near Ahmedabad Traffic Junction",
    },
]

for e in entries:
    existing = db.query(WatchlistEntry).filter(WatchlistEntry.identifier == e["identifier"]).first()
    if existing:
        print(f"SKIP (exists): {e['identifier']}")
        continue
    entry = WatchlistEntry(**e)
    db.add(entry)
    db.commit()
    print(f"INSERT: {e['identifier']}")

db.close()