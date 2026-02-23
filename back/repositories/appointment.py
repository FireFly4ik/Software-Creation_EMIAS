from datetime import datetime, timedelta

import sqlalchemy
from sqlalchemy import select, update as sqlalchemy_update, func

from core.base_dao import BaseDAO
from models.appointment import Appointment, AppointmentStatusEnum
from schemas.appointment import (
    AppointmentFilterSchema,
    AppointmentUpdateSchema,
    AppointmentDBCreateSchema,
)
from schemas.user import IDFilter


class AppointmentRepository(BaseDAO[Appointment]):
    model = Appointment

    async def create_appointment(
        self, appointment_data: AppointmentDBCreateSchema
    ) -> Appointment:
        return await self.add(appointment_data)

    async def find_appointment_by_id(self, appointment_id: int) -> Appointment | None:
        return await self.find_one_or_none_by_id(appointment_id)

    async def find_parallel_appointment(
        self,
        user_id: int,
        date: datetime.date,
        slot_index: int,
    ) -> Appointment | None:
        query = select(self.model).where(
            self.model.user_id == user_id,
            self.model.date == date,
            self.model.slot_index == slot_index,
            self.model.status == AppointmentStatusEnum.PLANNED,
        )

        result = await self.db_session.execute(query)
        return result.scalar_one_or_none()

    async def finish_appointments(self, current_dt: datetime) -> None:
        query = (
            sqlalchemy_update(self.model)
            .where(
                self.model.status == AppointmentStatusEnum.PLANNED,
                (
                        func.cast(self.model.date, sqlalchemy.DateTime) +
                        func.cast(
                            func.concat((self.model.slot_index + 1) * 20, ' minutes'),
                            sqlalchemy.Interval
                        )
                ) <= current_dt
            )
            .values(status=AppointmentStatusEnum.FINISHED)
        )
        await self.db_session.execute(query)

    async def get_appointments_with_filters(
        self, filters: AppointmentFilterSchema
    ) -> list[Appointment]:
        return await self.find_all(filters)


    async def update_appointment(
        self, appointment_id: int, appointment_data: AppointmentUpdateSchema
    ) -> Appointment:
        return await self.update(IDFilter(id=appointment_id), appointment_data)

    async def cancel_appointment(
        self,
        appointment_id: int,
        update_data: AppointmentUpdateSchema,
    ) -> Appointment:
        return await self.update_appointment(
            appointment_id=appointment_id,
            appointment_data=update_data,
        )

    async def delete_appointment(self, appointment_id: int) -> None:
        await self.delete(IDFilter(id=appointment_id))
