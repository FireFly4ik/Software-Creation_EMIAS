from datetime import date

from pydantic import (
    BaseModel,
    EmailStr,
)

from models.user import UserRoleEnum


class UserCreateSchema(BaseModel):
    id: int
    username: str


class UserVerifySchema(BaseModel):
    first_name: str
    surname: str
    middle_name: str
    phone: str
    email: EmailStr
    birth_date: date
    gender: str


class UserVerifyWithRoleSchema(UserVerifySchema):
    role: UserRoleEnum = UserRoleEnum.USER


class UserChangeRoleSchema(BaseModel):
    role: str


class UserUpdateSchema(BaseModel):
    first_name: str | None = None
    surname: str | None = None
    middle_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    birth_date: date | None = None
    gender: str | None = None


class EmailFilter(BaseModel):
    email: str


class IDFilter(BaseModel):
    id: int
