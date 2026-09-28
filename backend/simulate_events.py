import os
import time
from datetime import datetime
from getpass import getpass

import requests

BASE_URL = "http://localhost:8000"
EVENTS_URL = f"{BASE_URL}/api/events/detection"


def login():
    username = os.getenv("SIM_USERNAME") or input("Username: ")
    password = os.getenv("SIM_PASSWORD") or getpass("Password: ")
    res = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": username, "password": password},
    )
    if res.status_code != 200:
        raise SystemExit(f"Login failed: {res.status_code} {res.text}")
    body = res.json()
    token = body.get("access_token") or body.get("token")
    if not token:
        raise SystemExit(f"No token found in login response: {body}")
    return token


HEADERS = {"Authorization": f"Bearer {login()}"}


def send_event(label, payload):
    payload["timestamp"] = datetime.utcnow().isoformat()
    res = requests.post(EVENTS_URL, json=payload, headers=HEADERS)
    print(f"{label}: {res.status_code} -> {res.json()}")


print("--- Starting simulation ---\n")

send_event("Event 1 (no match)", {
    "camera_id": "C001", "event_type": "anpr", "identifier": "GJ03ZZ1234",
    "vehicle_type": "car", "confidence": 0.88,
})
time.sleep(2)

send_event("Event 2 (MATCH - new alert)", {
    "camera_id": "C001", "event_type": "anpr", "identifier": "GJ01XX0001",
    "vehicle_type": "car", "confidence": 0.95,
})
time.sleep(3)

send_event("Event 3 (MATCH - should be duplicate)", {
    "camera_id": "C001", "event_type": "anpr", "identifier": "GJ01XX0001",
    "vehicle_type": "car", "confidence": 0.93,
})
time.sleep(2)

send_event("Event 4 (MATCH - different camera, new alert)", {
    "camera_id": "C002", "event_type": "anpr", "identifier": "GJ01XX0001",
    "vehicle_type": "car", "confidence": 0.91,
})
time.sleep(2)

send_event("Event 5 (MATCH - blacklisted vehicle, new alert)", {
    "camera_id": "C002", "event_type": "anpr", "identifier": "GJ05YY9999",
    "vehicle_type": "car", "confidence": 0.97,
})

print("\n--- Simulation complete ---")