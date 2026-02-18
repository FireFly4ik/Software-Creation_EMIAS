from pydantic import BaseModel

from models.doctor import SpecializationEnum


class DoctorCreateSchema(BaseModel):

    first_name: str
    surname: str
    middle_name: str
    specialization: SpecializationEnum
    description: str


class DoctorFilterSchema(BaseModel):
    first_name: str | None = None
    surname: str | None = None
    middle_name: str | None = None
    specialization: SpecializationEnum | None = None


class DoctorUpdateSchema(BaseModel):
    specialization: SpecializationEnum | None = None
    description: str | None = None
