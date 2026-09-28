from sqlalchemy import select
from sqlalchemy.orm import Session
from app.kernel.errors import Forbidden, NotFound
from app.kernel.ids import new_id
from app.models import MembershipRow, WorkspaceRow

class TenancyService:
    def __init__(self, db: Session):
        self.db = db
    def create_workspace(self, user_id: str, name: str) -> WorkspaceRow:
        workspace = WorkspaceRow(id=new_id(), name=name.strip())
        member = MembershipRow(id=new_id(), workspace_id=workspace.id, user_id=user_id, role="owner")
        self.db.add_all([workspace, member])
        self.db.commit()
        return workspace
    def list_for_user(self, user_id: str):
        rows = self.db.execute(select(WorkspaceRow, MembershipRow.role).join(MembershipRow, MembershipRow.workspace_id == WorkspaceRow.id).where(MembershipRow.user_id == user_id)).all()
        return [(ws, role) for ws, role in rows]
    def require_member(self, user_id: str, workspace_id: str) -> MembershipRow:
        row = self.db.scalar(select(MembershipRow).where(MembershipRow.user_id == user_id, MembershipRow.workspace_id == workspace_id))
        if not row:
            raise Forbidden("Not a member of this workspace")
        return row
    def get(self, workspace_id: str) -> WorkspaceRow:
        row = self.db.get(WorkspaceRow, workspace_id)
        if not row:
            raise NotFound("Workspace not found")
        return row
