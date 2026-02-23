from datetime import date

from pydantic import BaseModel

from models.appointment import AppointmentStatusEnum


class AppointmentCreateSchema(BaseModel):
    doctor_id: int
    date: date
    slot_index: int


class AppointmentDBCreateSchema(BaseModel):
    user_id: int
    doctor_id: int
    date: date
    slot_index: int
    status: AppointmentStatusEnum = AppointmentStatusEnum.PLANNED


class AppointmentFilterSchema(BaseModel):
    id: int | None = None
    user_id: int | None = None
    doctor_id: int | None = None
    slot_ids: int | None = None
    status: AppointmentStatusEnum | None = None


class AppointmentUpdateSchema(BaseModel):
    status: AppointmentStatusEnum
