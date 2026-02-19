from datetime import date
from enum import Enum

from sqlalchemy import BigInteger, Enum as SQLAlchemyEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class UserRoleEnum(str, Enum):
    GUEST = "guest"
    USER = "user"
    ADMIN = "admin"


class User(Base):
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=False)
    username: Mapped[str | None]
    first_name: Mapped[str | None]
    surname: Mapped[str | None]
    middle_name: Mapped[str | None]
    role: Mapped[UserRoleEnum] = mapped_column(
        SQLAlchemyEnum(UserRoleEnum, name="user_role_enum"),
        nullable=False,
        default=UserRoleEnum.GUEST.value,
    )
    phone: Mapped[str | None]
    email: Mapped[str | None]
    birth_date: Mapped[date | None]
    gender: Mapped[str | None]

    appointments: Mapped[list["Appointment"]] = relationship(
        "Appointment", back_populates="user"
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
