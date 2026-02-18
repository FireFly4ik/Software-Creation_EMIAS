from pydantic import BaseModel

from models.user import UserRoleEnum


class TokenUserSchema(BaseModel):
    id: int
    username: str
    role: UserRoleEnum
