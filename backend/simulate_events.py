import requests
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api/events/detection"


def send_event(label, payload):
    payload["timestamp"] = datetime.utcnow().isoformat()
    res = requests.post(BASE_URL, json=payload)
    print(f"{label}: {res.status_code} -> {res.json()}")


print("--- Starting simulation ---\n")

send_event(
    "Event 1 (no match)",
    {
        "camera_id": "C001",
        "event_type": "anpr",
        "identifier": "GJ03ZZ1234",
        "vehicle_type": "car",
        "confidence": 0.88,
    },
)
time.sleep(2)

send_event(
    "Event 2 (MATCH - new alert)",
    {
        "camera_id": "C001",
        "event_type": "anpr",
        "identifier": "GJ01XX0001",
        "vehicle_type": "car",
        "confidence": 0.95,
    },
)
time.sleep(3)

send_event(
    "Event 3 (MATCH - should be duplicate)",
    {
        "camera_id": "C001",
        "event_type": "anpr",
        "identifier": "GJ01XX0001",
        "vehicle_type": "car",
        "confidence": 0.93,
    },
)
time.sleep(2)

send_event(
    "Event 4 (MATCH - different camera, new alert)",
    {
        "camera_id": "C002",
        "event_type": "anpr",
        "identifier": "GJ01XX0001",
        "vehicle_type": "car",
        "confidence": 0.91,
    },
)
time.sleep(2)

send_event(
    "Event 5 (MATCH - blacklisted vehicle, new alert)",
    {
        "camera_id": "C002",
        "event_type": "anpr",
        "identifier": "GJ05YY9999",
        "vehicle_type": "car",
        "confidence": 0.97,
    },
)

print("\n--- Simulation complete ---")