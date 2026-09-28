from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.deps import get_db, get_user_id
from app.features.audit.service import AuditService
from app.features.tenancy.service import TenancyService

router = APIRouter(prefix="/workspaces/{workspace_id}/audit", tags=["audit"])

class AuditOut(BaseModel):
    id: str
    action: str
    detail: str
    actor_id: str

@router.get("", response_model=list[AuditOut])
def list_audit(workspace_id: str, user_id: str = Depends(get_user_id), db: Session = Depends(get_db)):
    TenancyService(db).require_member(user_id, workspace_id)
    rows = AuditService(db).list_for(workspace_id)
    return [AuditOut(id=r.id, action=r.action, detail=r.detail, actor_id=r.actor_id) for r in rows]
