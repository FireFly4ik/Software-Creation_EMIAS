from enum import Enum

from sqlalchemy import Integer, UniqueConstraint, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column

from models.base import Base


class SpecializationEnum(str, Enum):
    COVID_DOCTOR = "Дежурный врач ОРВИ"
    DISTRICT_DOCTOR = "Участковый врач"
    THERAPIST = "Терапевт"
    CERTIFICATES = "Кабинет выдачи справок и направлений"
    SURGEON = "Хирург"
    OPHTHALMOLOGIST = "Офтальмолог"
    OTORHINOLARYNGOLOGIST = "Оториноларинголог"
    UROLOGIST = "Уролог"
    DISPENSARY = "Диспансеризация/Профилактический осмотр"
    VACCINATION = "Кабинет вакцинации"


class Doctor(Base):

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str]
    surname: Mapped[str]
    middle_name: Mapped[str]
    specialization: Mapped[SpecializationEnum] = mapped_column(
        SQLAlchemyEnum(SpecializationEnum, name="specialization_enum"), nullable=False
    )
    description: Mapped[str]

    appointments: Mapped[list["Appointment"]] = relationship(
        "Appointment", back_populates="doctor"
    )

    __table_args__ = (
        UniqueConstraint(
            "surname",
            "first_name",
            "middle_name",
            "specialization",
            name="uq_doctor_fullname_specialization",
        ),
    )
