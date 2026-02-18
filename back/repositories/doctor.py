from datetime import datetime

from sqlalchemy import select

from core.base_dao import BaseDAO
from models import Appointment
from models.appointment import AppointmentStatusEnum
from models.doctor import Doctor
from schemas.doctor import DoctorCreateSchema, DoctorFilterSchema, DoctorUpdateSchema
from schemas.user import IDFilter


class DoctorRepository(BaseDAO[Doctor]):
    model = Doctor

    async def create_doctor(self, doctor_data: DoctorCreateSchema) -> Doctor:
        return await self.add(doctor_data)

    async def find_doctor_by_id(self, doctor_id: int) -> Doctor | None:
        return await self.find_one_or_none_by_id(doctor_id)

    async def get_doctors_with_filters(
        self, filters: DoctorFilterSchema
    ) -> list[Doctor]:
        return await self.find_all(filters)

    async def update_doctor(
        self, doctor_id: int, doctor_data: DoctorUpdateSchema
    ) -> Doctor:
        return await self.update(IDFilter(id=doctor_id), doctor_data)

    async def delete_doctor(self, doctor_id: int) -> None:
        await self.delete(IDFilter(id=doctor_id))

    async def is_slot_available(
        self,
        doctor_id: int,
        date: datetime.date,
        slot_index: int,
    ) -> bool:

        query = select(Appointment.id).where(
            Appointment.doctor_id == doctor_id,
            Appointment.date == date,
            Appointment.slot_index == slot_index,
            Appointment.status == AppointmentStatusEnum.PLANNED,
        )
        result = await self.db_session.execute(query)
        return result.scalar_one_or_none() is None
