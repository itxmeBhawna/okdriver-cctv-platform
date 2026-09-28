from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request


def rate_limit(max_requests: int):
    requests_by_ip = defaultdict(deque)
    lock = Lock()

    def check_limit(request: Request):
        ip = request.client.host if request.client else "unknown"
        now = monotonic()
        with lock:
            requests = requests_by_ip[ip]
            while requests and requests[0] <= now - 60:
                requests.popleft()
            if len(requests) >= max_requests:
                raise HTTPException(status_code=429, detail="Rate limit exceeded")
            requests.append(now)

    return check_limit