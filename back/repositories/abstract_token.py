from datetime import datetime, timezone
from typing import Type, TypeVar

from pydantic import BaseModel

from core.base_dao import BaseDAO
from models.base import Base

T = TypeVar("T", bound=Base)


class AbstractTokenRepository(BaseDAO[T]):
    model: Type[T]
    FilterCls: Type[BaseModel]
    CreateSchema: Type[BaseModel]
    UpdateSchema: Type[BaseModel]

    async def get_by_token(self, token: str) -> T | None:
        return await self.find_one_or_none(self.FilterCls(token=token))

    async def revoke_all_for_user(self, user_id: int) -> None:
        await self.update(
            filters=self.FilterCls(user_id=user_id),
            values=self.UpdateSchema(revoked_at=datetime.now(timezone.utc)),
        )

    async def revoke_by_token(self, token: str) -> None:
        await self.update(
            filters=self.FilterCls(token=token),
            values=self.UpdateSchema(revoked_at=datetime.now(timezone.utc)),
        )

    async def create_and_revoke_all_for_user(
        self, new_token: str, user_id: int, expires_at: datetime
    ) -> None:

        await self.revoke_all_for_user(user_id)
        await self.add(
            self.CreateSchema(token=new_token, user_id=user_id, expires_at=expires_at)
        )

    async def rotate_token(
        self, old_token: str, new_token: str, user_id: int, expires_at: datetime
    ) -> None:

        await self.add(
            self.CreateSchema(token=new_token, user_id=user_id, expires_at=expires_at)
        )

        await self.update(
            filters=self.FilterCls(token=old_token),
            values=self.UpdateSchema(revoked_at=datetime.now(timezone.utc)),
        )
