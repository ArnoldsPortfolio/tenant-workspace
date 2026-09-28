from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from app.db import Base
from app.deps import SessionLocal, engine, settings
from app.features.audit.router import router as audit_router
from app.features.billing.router import router as billing_router
from app.features.identity.router import router as identity_router
from app.features.projects.router import router as projects_router
from app.features.tenancy.router import router as tenancy_router
from app.kernel.errors import DomainError
from app.rate_limit import limiter
from app.seed import seed_if_empty

app = FastAPI(title="Tenant Workspace API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.origin_list(), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def rate_and_limits(request: Request, call_next):
    if request.headers.get("content-length"):
        try:
            if int(request.headers["content-length"]) > 1_000_000:
                return JSONResponse({"code": "payload_too_large"}, status_code=413)
        except ValueError:
            pass
    return await limiter(request, call_next)

@app.exception_handler(DomainError)
async def domain_error(_, exc: DomainError):
    return JSONResponse({"code": exc.code, "message": exc.message}, status_code=exc.status)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()

STATIC = Path(__file__).parent / "static"
if STATIC.exists():
    app.mount("/assets", StaticFiles(directory=STATIC), name="assets")

@app.get("/")
def home():
    return FileResponse(STATIC / "index.html")

@app.get("/ui")
def ui():
    return FileResponse(STATIC / "index.html")

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(identity_router)
app.include_router(tenancy_router)
app.include_router(projects_router)
app.include_router(billing_router)
app.include_router(audit_router)
