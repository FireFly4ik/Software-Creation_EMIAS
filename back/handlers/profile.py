from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status, Response

from dependencies import (
    RequireRoles,
    get_user_repository,
    get_appointment_service,
    get_appointment_repository,
    get_auth_service,
)
from repositories.appointment import AppointmentRepository
from repositories.user import UserRepository
from schemas.appointment import AppointmentFilterSchema
from schemas.auth import TokenUserSchema
from schemas.user import UserUpdateSchema
from services.appointment import AppointmentService
from services.auth import AuthService

router = APIRouter(prefix="/profile", tags=["profile"])


@router.patch("/", description="редачим свой профиль (поля по которым был вериф акка)")
async def update_user(
    user_update_data: UserUpdateSchema,
    user_data: Annotated[TokenUserSchema, Depends(RequireRoles("admin", "user"))],
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
):
    user = await user_repository.update_user(
        user_id=user_data.id, user_data=user_update_data
    )
    return user


@router.get("/", description="глянуть свой профиль")
async def get_me(
    user_data: Annotated[TokenUserSchema, Depends(RequireRoles("user", "admin"))],
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
):
    user = await user_repository.find_user_by_id(user_id=user_data.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.patch(
    "/appointments/{appointment_id}/cancel",
    description="отмена собственной записи",
)
async def cancel_appointment(
    appointment_id: int,
    user_data: Annotated[TokenUserSchema, Depends(RequireRoles("user", "admin"))],
    appointment_service: Annotated[
        AppointmentService, Depends(get_appointment_service)
    ],
):
    appointment = await appointment_service.cancel_appointment(
        user_id=user_data.id,
        appointment_id=appointment_id,
    )

    return appointment


@router.patch("/become-admin", description="становимся админом")
async def update_user(
    response: Response,
    user_data: Annotated[TokenUserSchema, Depends(RequireRoles("user"))],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    access_token = await auth_service.change_role_to_admin(user_id=user_data.id)

    response.set_cookie(
        key="user_access_token",
        value=access_token,
        httponly=False,
        secure=True,
        samesite="none",
        path="/",
        max_age=900
    )

    return {"msg": "ok"}


@router.patch("/stop-being-admin", description="перестаем быть админом")
async def update_user(
    response: Response,
    user_data: Annotated[TokenUserSchema, Depends(RequireRoles("admin"))],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):

    access_token = await auth_service.change_role_to_user(user_id=user_data.id)

    response.set_cookie(
        key="user_access_token",
        value=access_token,
        httponly=False,
        secure=True,
        samesite="none",
        path="/",
        max_age=900
    )

    return {"msg": "ok"}


@router.get("/appointments")
async def list_my_appointments(
    user_data: Annotated[TokenUserSchema, Depends(RequireRoles("admin", "user"))],
    appointment_repository: Annotated[
        AppointmentRepository, Depends(get_appointment_repository)
    ],
):
    appointments = await appointment_repository.find_all(
        AppointmentFilterSchema(user_id=user_data.id)
    )
    return appointments
