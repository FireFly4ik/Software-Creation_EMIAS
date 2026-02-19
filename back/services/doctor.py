from dataclasses import dataclass

from core.exceptions import DoctorAlreadyExistsError, DoctorNotFoundError
from models.doctor import Doctor
from repositories.doctor import DoctorRepository
from schemas.doctor import DoctorCreateSchema, DoctorFilterSchema, DoctorUpdateSchema


@dataclass
class DoctorService:
    doctor_repository: DoctorRepository

    async def create_doctor(self, doctor_data: DoctorCreateSchema) -> Doctor:
        doctor = await self.doctor_repository.find_all(
            DoctorFilterSchema(**doctor_data.model_dump(exclude_none=True))
        )
        if doctor:
            raise DoctorAlreadyExistsError()

        doctor = await self.doctor_repository.create_doctor(doctor_data)
        return doctor

    async def update_doctor(
        self,
        doctor_id: int,
        doctor_data: DoctorUpdateSchema,
    ) -> Doctor:

        doctor = await self.doctor_repository.find_doctor_by_id(doctor_id)
        if not doctor:
            raise DoctorNotFoundError()

        updated_doctor = await self.doctor_repository.update_doctor(
            doctor_id=doctor_id, doctor_data=doctor_data
        )

        return updated_doctor

    async def delete_doctor(self, doctor_id: int) -> None:
        doctor = await self.doctor_repository.find_doctor_by_id(doctor_id)
        if not doctor:
            raise DoctorNotFoundError()

        await self.doctor_repository.delete_doctor(doctor_id=doctor_id)

    async def get_doctors(
        self,
        filters: DoctorFilterSchema,
    ) -> list[Doctor]:

        doctors = await self.doctor_repository.get_doctors_with_filters(filters=filters)
        return doctors

    async def get_doctor_by_id(self, doctor_id: int) -> Doctor | None:
        return await self.doctor_repository.find_doctor_by_id(doctor_id)
