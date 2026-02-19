from core.base_dao import BaseDAO
from models.user import User
from schemas.user import (
    UserCreateSchema,
    IDFilter,
    UserUpdateSchema,
)


class UserRepository(BaseDAO[User]):
    model = User

    async def create_user(self, user_data: UserCreateSchema) -> User:
        return await self.add(user_data)

    async def find_user_by_id(self, user_id: int) -> User | None:
        return await self.find_one_or_none_by_id(user_id)

    async def update_user(self, user_id: int, user_data: UserUpdateSchema) -> User:
        return await self.update(IDFilter(id=user_id), user_data)
