from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.deps import get_db, get_user_id
from app.features.audit.service import AuditService
from app.features.tenancy.service import TenancyService

router = APIRouter(prefix="/workspaces", tags=["tenancy"])

class CreateWorkspace(BaseModel):
    name: str = Field(min_length=2, max_length=120)

class WorkspaceOut(BaseModel):
    id: str
    name: str
    plan: str
    role: str | None = None

@router.post("", response_model=WorkspaceOut)
def create(body: CreateWorkspace, user_id: str = Depends(get_user_id), db: Session = Depends(get_db)):
    ws = TenancyService(db).create_workspace(user_id, body.name)
    AuditService(db).record(ws.id, user_id, "workspace.created", ws.name)
    return WorkspaceOut(id=ws.id, name=ws.name, plan=ws.plan, role="owner")

@router.get("", response_model=list[WorkspaceOut])
def list_mine(user_id: str = Depends(get_user_id), db: Session = Depends(get_db)):
    return [WorkspaceOut(id=ws.id, name=ws.name, plan=ws.plan, role=role) for ws, role in TenancyService(db).list_for_user(user_id)]
