from sqlalchemy import select
from sqlalchemy.orm import Session
from app.kernel.ids import new_id
from app.models import ProjectRow

class ProjectService:
    def __init__(self, db: Session):
        self.db = db
    def create(self, workspace_id: str, title: str) -> ProjectRow:
        row = ProjectRow(id=new_id(), workspace_id=workspace_id, title=title.strip())
        self.db.add(row)
        self.db.commit()
        return row
    def list_open(self, workspace_id: str):
        return list(self.db.scalars(select(ProjectRow).where(ProjectRow.workspace_id == workspace_id, ProjectRow.archived == "no")))
