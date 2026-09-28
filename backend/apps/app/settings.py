from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    app_secret: str = "dev-only-change-me-please-use-env"
    database_url: str = "sqlite:///./tenant_workspace.db"
    access_minutes: int = 15
    refresh_days: int = 7
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    def origin_list(self) -> list[str]:
        return [part.strip() for part in self.cors_origins.split(",") if part.strip()]
