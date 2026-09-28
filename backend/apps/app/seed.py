from sqlalchemy import select
from sqlalchemy.orm import Session
from app.features.identity.service import IdentityService
from app.features.tenancy.service import TenancyService
from app.models import UserRow
from app.settings import Settings

def seed_if_empty(db: Session) -> None:
    if db.scalar(select(UserRow).limit(1)):
        return
    user = IdentityService(db, Settings()).sign_up("owner@workspace.dev", "ChangeMe123!")
    TenancyService(db).create_workspace(user.id, "Demo Workspace")
