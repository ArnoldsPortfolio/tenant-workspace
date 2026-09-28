import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse

_hits = defaultdict(list)
LIMIT = 20
WINDOW = 60.0

async def limiter(request: Request, call_next):
    if request.url.path not in {"/auth/sign-in", "/auth/sign-up"}:
        return await call_next(request)
    key = (request.client.host if request.client else "anon") + request.url.path
    now = time.time()
    recent = [t for t in _hits[key] if now - t < WINDOW]
    if len(recent) >= LIMIT:
        return JSONResponse({"code": "rate_limited"}, status_code=429)
    recent.append(now)
    _hits[key] = recent
    return await call_next(request)
