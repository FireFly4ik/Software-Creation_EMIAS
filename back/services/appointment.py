from dataclasses import dataclass
from datetime import datetime

from core.exceptions import (
    AppointmentAlreadyExistsError,
    AppointmentNotFoundError,
    DoctorNotFoundError,
    DoctorSlotBusyError,
    AppointmentStatusTransitionError,
    AppointmentCannotBeCancelledError,
    ForbiddenError,
)
from models.appointment import Appointment, AppointmentStatusEnum
from repositories.appointment import AppointmentRepository
from repositories.doctor import DoctorRepository
from schemas.appointment import (
    AppointmentCreateSchema,
    AppointmentUpdateSchema,
    AppointmentDBCreateSchema,
    AppointmentFilterSchema,
)


@dataclass
class AppointmentService:
    appointment_repository: AppointmentRepository
    doctor_repository: DoctorRepository

    async def create_appointment(
        self,
        user_id: int,
        appointment_data: AppointmentCreateSchema,
    ) -> Appointment:

        parallel = await self.appointment_repository.find_parallel_appointment(
            user_id=user_id,
            date=appointment_data.date,
            slot_index=appointment_data.slot_index,
        )

        if parallel:
            raise AppointmentAlreadyExistsError()

        doctor = await self.doctor_repository.find_doctor_by_id(
            appointment_data.doctor_id
        )

        if doctor is None:
            raise DoctorNotFoundError()

        slot_free = await self.doctor_repository.is_slot_available(
            doctor_id=appointment_data.doctor_id,
            date=appointment_data.date,
            slot_index=appointment_data.slot_index,
        )
        if not slot_free:
            raise DoctorSlotBusyError()

        cancelled_by_user = await self.appointment_repository.find_all(
            AppointmentFilterSchema(
                user_id=user_id,
                doctor_id=appointment_data.doctor_id,
                date=appointment_data.date,
                slot_index=appointment_data.slot_index,
                status=AppointmentStatusEnum.CANCELLED
            )
        )

        if cancelled_by_user:
            return await self.appointment_repository.update_appointment(
                appointment_id=cancelled_by_user[0].id,
                appointment_data=AppointmentUpdateSchema(
                    status=AppointmentStatusEnum.PLANNED,
                )
            )

        appointment = AppointmentDBCreateSchema(
            user_id=user_id,
            **appointment_data.model_dump(),
        )

        return await self.appointment_repository.create_appointment(appointment)

    async def cancel_appointment(
        self,
        user_id: int,
        appointment_id: int,
    ) -> Appointment:

        appointment = await self.appointment_repository.find_appointment_by_id(
            appointment_id
        )

        if appointment is None:
            raise AppointmentNotFoundError()

        if appointment.user_id != user_id:
            raise ForbiddenError(
                message="You are not allowed to cancel this appointment"
            )

        if appointment.status != AppointmentStatusEnum.PLANNED:
            raise AppointmentCannotBeCancelledError()

        update_data = AppointmentUpdateSchema(status=AppointmentStatusEnum.CANCELLED)

        return await self.appointment_repository.cancel_appointment(
            appointment_id=appointment_id,
            update_data=update_data,
        )

    async def change_appointment_status(
        self,
        appointment_id: int,
        status: AppointmentStatusEnum,
    ) -> Appointment:

        appointment = await self.appointment_repository.find_appointment_by_id(
            appointment_id
        )

        if appointment is None:
            raise AppointmentNotFoundError()

        if appointment.status == status:
            raise AppointmentStatusTransitionError()

        update_data = AppointmentUpdateSchema(status=status)

        return await self.appointment_repository.update_appointment(
            appointment_id=appointment_id,
            appointment_data=update_data,
        )

    async def get_appointments(
        self,
        filters: AppointmentFilterSchema,
    ) -> list[Appointment]:

        appointments = await self.appointment_repository.get_appointments_with_filters(
            filters=filters
        )
        return appointments

    async def finish_expired_appointments(self):
        now = datetime.utcnow()
        await self.appointment_repository.finish_appointments(now)
