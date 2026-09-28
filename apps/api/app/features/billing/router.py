from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.deps import get_db, get_user_id
from app.features.billing.gateway import BillingGateway
from app.features.billing.service import BillingService
from app.features.roles.policy import RolePolicy
from app.features.tenancy.service import TenancyService

router = APIRouter(prefix="/workspaces/{workspace_id}/billing", tags=["billing"])

class BillingOut(BaseModel):
    plan: str
    seats: int
    checkout_url: str

@router.get("", response_model=BillingOut)
def show(workspace_id: str, user_id: str = Depends(get_user_id), db: Session = Depends(get_db)):
    member = TenancyService(db).require_member(user_id, workspace_id)
    RolePolicy().allow_manage_billing(member.role)
    workspace = TenancyService(db).get(workspace_id)
    snap = BillingService(db).snapshot(workspace)
    url = BillingGateway().checkout_url(workspace_id, snap["plan"])
    return BillingOut(plan=snap["plan"], seats=snap["seats"], checkout_url=url)
