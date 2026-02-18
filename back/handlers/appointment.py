from typing import Annotated

from fastapi import APIRouter, Depends

from dependencies import (
    RequireRoles,
    get_appointment_service,
)
from schemas.appointment import (
    AppointmentCreateSchema,
    AppointmentUpdateSchema,
    AppointmentFilterSchema,
)
from schemas.auth import TokenUserSchema
from services.appointment import AppointmentService

router = APIRouter(prefix="/appointment", tags=["appointment"])


@router.post("/", description="создание записи")
async def create_appointment(
    appointment_data: AppointmentCreateSchema,
    user_data: Annotated[TokenUserSchema, Depends(RequireRoles("admin", "user"))],
    appointment_service: Annotated[
        AppointmentService, Depends(get_appointment_service)
    ],
):

    appointment = await appointment_service.create_appointment(
        user_id=user_data.id, appointment_data=appointment_data
    )

    return appointment


@router.patch(
    "/{appointment_id}/status",
    description="сменить статус любой записи админом",
    dependencies=[Depends(RequireRoles("admin"))],
)
async def change_appointment_status(
    appointment_id: int,
    status_data: AppointmentUpdateSchema,
    appointment_service: Annotated[
        AppointmentService, Depends(get_appointment_service)
    ],
):

    appointment = await appointment_service.change_appointment_status(
        appointment_id=appointment_id,
        status=status_data.status,
    )

    return appointment


@router.get(
    "/",
    description="список записей плюс фильтры",
    dependencies=[Depends(RequireRoles("user", "admin"))],
)
async def get_appointments(
    appointment_service: Annotated[
        AppointmentService, Depends(get_appointment_service)
    ],
    filters: AppointmentFilterSchema = Depends(),
):
    appointments = await appointment_service.get_appointments(filters)
    return appointments
