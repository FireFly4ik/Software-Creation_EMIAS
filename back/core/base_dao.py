from typing import TypeVar, Type, Generic, List

from pydantic import BaseModel
from sqlalchemy import update as sqlalchemy_update, delete as sqlalchemy_delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.base import Base

T = TypeVar("T", bound=Base)


class BaseDAO(Generic[T]):
    model: Type[T] = None

    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def find_one_or_none_by_id(self, data_id: int) -> T | None:
        query = select(self.model).filter_by(id=data_id)
        res = await self.db_session.execute(query)
        return res.scalar_one_or_none()

    async def find_one_or_none(self, filters: BaseModel) -> T | None:
        filter_dict = filters.model_dump(exclude_unset=True)
        query = select(self.model).filter_by(**filter_dict)
        res = await self.db_session.execute(query)
        return res.scalar_one_or_none()

    async def find_all(self, filters: BaseModel | None = None) -> List[T] | None:
        filter_dict = (
            filters.model_dump(exclude_unset=True, exclude_none=True) if filters else {}
        )
        query = select(self.model).filter_by(**filter_dict)
        res = await self.db_session.execute(query)
        return res.scalars().all()

    async def add(self, values: BaseModel):
        values_dict = values.model_dump(exclude_unset=True)
        instance = self.model(**values_dict)
        self.db_session.add(instance)
        await self.db_session.flush()
        return instance

    async def update(self, filters: BaseModel, values: BaseModel):
        filter_dict = filters.model_dump(exclude_unset=True)
        values_dict = values.model_dump(exclude_unset=True)
        query = (
            sqlalchemy_update(self.model)
            .where(*[getattr(self.model, k) == v for k, v in filter_dict.items()])
            .values(**values_dict)
            .returning(self.model)
        )
        result = await self.db_session.execute(query)
        return result.scalars().first()

    async def delete(self, filters: BaseModel):
        filter_dict = filters.model_dump(exclude_unset=True)
        query = sqlalchemy_delete(self.model).filter_by(**filter_dict)
        await self.db_session.execute(query)
