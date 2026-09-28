from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.deps import get_db
from app.features.identity.service import IdentityService
from app.settings import Settings

router = APIRouter(prefix="/auth", tags=["auth"])

class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=8)

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshBody(BaseModel):
    refresh_token: str

def _svc(db: Session = Depends(get_db)) -> IdentityService:
    return IdentityService(db, Settings())

@router.post("/sign-up", response_model=TokenPair)
def sign_up(body: Credentials, svc: IdentityService = Depends(_svc)):
    user = svc.sign_up(body.email, body.password)
    access, refresh = svc._issue(user.id)
    return TokenPair(access_token=access, refresh_token=refresh)

@router.post("/sign-in", response_model=TokenPair)
def sign_in(body: Credentials, svc: IdentityService = Depends(_svc)):
    access, refresh = svc.sign_in(body.email, body.password)
    return TokenPair(access_token=access, refresh_token=refresh)

@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshBody, svc: IdentityService = Depends(_svc)):
    access, refresh = svc.refresh(body.refresh_token)
    return TokenPair(access_token=access, refresh_token=refresh)

@router.post("/logout")
def logout(body: RefreshBody, svc: IdentityService = Depends(_svc)):
    svc.logout(body.refresh_token)
    return {"ok": True}
