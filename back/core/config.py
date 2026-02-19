from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    SECRET_KEY: str
    ALGORITHM: str
    BOT_TOKEN: str
    TELEGRAM_MAX_AGE_SECONDS: int = 86400
    REFRESH_EXPIRES_DAYS: int = 30
    ACCESS_EXPIRES_MINUTES: int = 10
    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env")


settings = Settings()

database_url = (
    f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}@"
    f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)


def get_auth_data():
    return {"secret_key": settings.SECRET_KEY, "algorithm": settings.ALGORITHM}
