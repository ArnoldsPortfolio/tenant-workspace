from datetime import timedelta
import hashlib
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.kernel.clock import Clock
from app.kernel.errors import Conflict, Unauthorized
from app.kernel.ids import new_id
from app.kernel.password import hash_password, password_matches
from app.kernel.tokens import encode_access
from app.models import RefreshRow, UserRow
from app.settings import Settings

class IdentityService:
    def __init__(self, db: Session, settings: Settings):
        self.db = db
        self.settings = settings
        self.clock = Clock()
    def sign_up(self, email: str, password: str) -> UserRow:
        email = email.lower().strip()
        if self.db.scalar(select(UserRow).where(UserRow.email == email)):
            raise Conflict("Email already registered")
        user = UserRow(id=new_id(), email=email, password_hash=hash_password(password))
        self.db.add(user)
        self.db.commit()
        return user
    def sign_in(self, email: str, password: str) -> tuple[str, str]:
        user = self.db.scalar(select(UserRow).where(UserRow.email == email.lower().strip()))
        if not user or not password_matches(password, user.password_hash):
            raise Unauthorized("Bad credentials")
        return self._issue(user.id)
    def refresh(self, raw: str) -> tuple[str, str]:
        hashed = hashlib.sha256(raw.encode()).hexdigest()
        row = self.db.scalar(select(RefreshRow).where(RefreshRow.token_hash == hashed))
        if not row or row.revoked != "no" or row.expires_at < self.clock.now():
            raise Unauthorized("Refresh rejected")
        row.revoked = "yes"
        self.db.commit()
        return self._issue(row.user_id)
    def logout(self, raw: str) -> None:
        hashed = hashlib.sha256(raw.encode()).hexdigest()
        row = self.db.scalar(select(RefreshRow).where(RefreshRow.token_hash == hashed))
        if row:
            row.revoked = "yes"
            self.db.commit()
    def _issue(self, user_id: str) -> tuple[str, str]:
        access = encode_access(self.settings.app_secret, user_id, self.settings.access_minutes)
        raw = new_id() + new_id()
        hashed = hashlib.sha256(raw.encode()).hexdigest()
        exp = self.clock.now() + timedelta(days=self.settings.refresh_days)
        self.db.add(RefreshRow(id=new_id(), user_id=user_id, token_hash=hashed, expires_at=exp))
        self.db.commit()
        return access, raw
