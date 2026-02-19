import asyncio
from typing import Annotated, AsyncGenerator

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import ForbiddenError
from core.security import decode_token
from infrastructure.database import async_session_maker
from models.user import UserRoleEnum
from repositories.appointment import AppointmentRepository
from repositories.doctor import DoctorRepository
from repositories.refresh_token import RefreshTokenRepository
from repositories.user import UserRepository
from schemas.auth import TokenUserSchema
from services.appointment import AppointmentService
from services.auth import AuthService
from services.doctor import DoctorService

bearer = HTTPBearer()
event_loop = asyncio.get_event_loop()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_user_repository(
    db_session: Annotated[AsyncSession, Depends(get_db_session)],
) -> UserRepository:
    return UserRepository(db_session=db_session)


async def get_doctor_repository(
    db_session: Annotated[AsyncSession, Depends(get_db_session)],
) -> DoctorRepository:
    return DoctorRepository(db_session=db_session)


async def get_appointment_repository(
    db_session: Annotated[AsyncSession, Depends(get_db_session)],
) -> AppointmentRepository:
    return AppointmentRepository(db_session=db_session)


async def get_refresh_repository(
    db_session: Annotated[AsyncSession, Depends(get_db_session)],
) -> RefreshTokenRepository:
    return RefreshTokenRepository(db_session=db_session)


async def get_auth_service(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
    refresh_repository: Annotated[
        RefreshTokenRepository, Depends(get_refresh_repository)
    ],
) -> AuthService:
    return AuthService(
        user_repository=user_repository,
        refresh_repository=refresh_repository,
    )


async def get_doctor_service(
    doctor_repository: Annotated[DoctorRepository, Depends(get_doctor_repository)],
) -> DoctorService:
    return DoctorService(doctor_repository=doctor_repository)


async def get_appointment_service(
    appointment_repository: Annotated[
        AppointmentRepository, Depends(get_appointment_repository)
    ],
    doctor_repository: Annotated[DoctorRepository, Depends(get_doctor_repository)],
) -> AppointmentService:
    return AppointmentService(
        appointment_repository=appointment_repository,
        doctor_repository=doctor_repository,
    )


def get_access_token(request: Request) -> str:
    token = request.cookies.get("user_access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token not found"
        )
    return token


def get_refresh_token(request: Request) -> str:
    token = request.cookies.get("user_refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not found"
        )
    return token


async def get_current_user(
    token: Annotated[str, Depends(get_access_token)],
) -> TokenUserSchema:
    payload = decode_token(token, expected_name="access")

    return TokenUserSchema(
        id=int(payload["sub"]), username=payload["username"], role=payload["role"]
    )


class RequireRoles:
    def __init__(self, *allowed_roles: UserRoleEnum):
        self.allowed: set[UserRoleEnum] = set(allowed_roles)

    async def __call__(
        self, user: Annotated[TokenUserSchema, Depends(get_current_user)]
    ) -> TokenUserSchema:
        if user.role not in self.allowed:
            raise ForbiddenError(
                message="Insufficient role",
                extra={
                    "required_roles": list(self.allowed),
                    "user_role": user.role,
                },
            )
        return user
