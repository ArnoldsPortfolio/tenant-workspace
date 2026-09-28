from app.kernel.errors import Forbidden

class RolePolicy:
    def allow_manage_billing(self, role: str) -> None:
        if role not in {"owner", "admin", "billing"}:
            raise Forbidden("Billing is limited to owner, admin, or billing")
    def allow_write_projects(self, role: str) -> None:
        if role not in {"owner", "admin", "member"}:
            raise Forbidden("Cannot change projects")
