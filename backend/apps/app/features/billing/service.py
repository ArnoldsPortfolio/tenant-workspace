from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models import MembershipRow, WorkspaceRow

class BillingService:
    def __init__(self, db: Session):
        self.db = db
    def snapshot(self, workspace: WorkspaceRow) -> dict:
        seats = self.db.scalar(select(func.count()).select_from(MembershipRow).where(MembershipRow.workspace_id == workspace.id))
        return {"plan": workspace.plan, "seats": int(seats or 0)}
