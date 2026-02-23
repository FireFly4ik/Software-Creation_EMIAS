from infrastructure.database import async_session_maker
from repositories.appointment import AppointmentRepository
from repositories.doctor import DoctorRepository
from services.appointment import AppointmentService


async def finish_appointments():
    async with async_session_maker() as session:
        async with session.begin():
            doctor_repo = DoctorRepository(session)
            appointment_repo = AppointmentRepository(session)
            appointment_service = AppointmentService(
                appointment_repository=appointment_repo,
                doctor_repository=doctor_repo
            )
            await appointment_service.finish_expired_appointments()
            await session.commit()
