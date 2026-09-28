from sqlalchemy import select
from sqlalchemy.orm import Session
from app.kernel.ids import new_id
from app.models import AuditRow

class AuditService:
    def __init__(self, db: Session):
        self.db = db
    def record(self, workspace_id: str, actor_id: str, action: str, detail: str) -> None:
        self.db.add(AuditRow(id=new_id(), workspace_id=workspace_id, actor_id=actor_id, action=action, detail=detail))
        self.db.commit()
    def list_for(self, workspace_id: str):
        return list(self.db.scalars(select(AuditRow).where(AuditRow.workspace_id == workspace_id).order_by(AuditRow.created_at.desc())))
