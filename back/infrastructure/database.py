from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)

from core.config import database_url

engine = create_async_engine(
    url=database_url, connect_args={"server_settings": {"timezone": "utc"}}
)
async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
