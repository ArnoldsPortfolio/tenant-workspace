from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.deps import get_db, get_user_id
from app.features.audit.service import AuditService
from app.features.projects.service import ProjectService
from app.features.roles.policy import RolePolicy
from app.features.tenancy.service import TenancyService

router = APIRouter(prefix="/workspaces/{workspace_id}/projects", tags=["projects"])

class CreateProject(BaseModel):
    title: str = Field(min_length=1, max_length=200)

class ProjectOut(BaseModel):
    id: str
    title: str
    workspace_id: str

@router.post("", response_model=ProjectOut)
def create(workspace_id: str, body: CreateProject, user_id: str = Depends(get_user_id), db: Session = Depends(get_db)):
    member = TenancyService(db).require_member(user_id, workspace_id)
    RolePolicy().allow_write_projects(member.role)
    row = ProjectService(db).create(workspace_id, body.title)
    AuditService(db).record(workspace_id, user_id, "project.created", row.title)
    return ProjectOut(id=row.id, title=row.title, workspace_id=row.workspace_id)

@router.get("", response_model=list[ProjectOut])
def list_projects(workspace_id: str, user_id: str = Depends(get_user_id), db: Session = Depends(get_db)):
    TenancyService(db).require_member(user_id, workspace_id)
    rows = ProjectService(db).list_open(workspace_id)
    return [ProjectOut(id=r.id, title=r.title, workspace_id=r.workspace_id) for r in rows]
