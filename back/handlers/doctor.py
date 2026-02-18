from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status

from core.exceptions import (
    DoctorAlreadyExistsError,
    DoctorNotFoundError,
)
from dependencies import (
    RequireRoles,
    get_doctor_service,
)
from schemas.doctor import DoctorCreateSchema, DoctorFilterSchema, DoctorUpdateSchema
from services.doctor import DoctorService

router = APIRouter(prefix="/doctor", tags=["doctor"])


@router.post(
    "/", description="создание врача", dependencies=[Depends(RequireRoles("admin"))]
)
async def create_doctor(
    doctor_data: DoctorCreateSchema,
    doctor_service: Annotated[DoctorService, Depends(get_doctor_service)],
):
    try:
        doctor = await doctor_service.create_doctor(doctor_data)
    except DoctorAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

    return doctor


@router.patch(
    "/{doctor_id}",
    description="обновление врача",
    dependencies=[Depends(RequireRoles("admin"))],
)
async def update_doctor(
    doctor_id: int,
    doctor_data: DoctorUpdateSchema,
    doctor_service: Annotated[DoctorService, Depends(get_doctor_service)],
):
    try:
        doctor = await doctor_service.update_doctor(doctor_id, doctor_data)
    except DoctorNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

    return doctor


@router.delete(
    "/{doctor_id}",
    description="удаление врача",
    dependencies=[Depends(RequireRoles("admin"))],
)
async def delete_doctor(
    doctor_id: int,
    doctor_service: Annotated[DoctorService, Depends(get_doctor_service)],
):
    try:
        await doctor_service.delete_doctor(doctor_id)
    except DoctorNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

    return {"message": "Doctor deleted"}


@router.get(
    "/",
    description="список врачей плюс фильтры",
    dependencies=[Depends(RequireRoles("user", "admin"))],
)
async def get_doctors(
    filters: Annotated[DoctorFilterSchema, Depends()],
    doctor_service: Annotated[DoctorService, Depends(get_doctor_service)],
):
    doctors = await doctor_service.get_doctors(filters)
    return doctors


@router.get(
    "/{doctor_id}",
    description="получение врача по id",
    dependencies=[Depends(RequireRoles("admin"))],
)
async def get_doctor_by_id(
    doctor_id: int,
    doctor_service: Annotated[DoctorService, Depends(get_doctor_service)],
):
    doctor = await doctor_service.get_doctor_by_id(doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found"
        )
    return doctor
