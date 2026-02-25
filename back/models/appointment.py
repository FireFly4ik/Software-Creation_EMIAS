from datetime import datetime, date
from enum import Enum

from sqlalchemy import (
    BigInteger,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from models.base import Base


class AppointmentStatusEnum(str, Enum):
    PLANNED = "Запланировано"
    FINISHED = "Завершено"
    CANCELLED = "Отменено"


class Appointment(Base):

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id"), nullable=False
    )
    doctor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("doctors.id"), nullable=False
    )

    date: Mapped[date] = mapped_column(Date, nullable=False)
    slot_index: Mapped[int] = mapped_column(Integer, nullable=False)

    status: Mapped[AppointmentStatusEnum] = mapped_column(
        SQLAlchemyEnum(AppointmentStatusEnum, name="appointment_status_enum"),
        nullable=False,
        default=AppointmentStatusEnum.PLANNED,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user: Mapped["User"] = relationship("User", back_populates="appointments")
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="appointments")

    __table_args__ = (
        UniqueConstraint("doctor_id", "date", "slot_index", "status", "user_id", name="uq_doctor_slot"),
        CheckConstraint(
            "slot_index >= 0 AND slot_index < 24", name="ck_slot_index_range"
        ),
        Index("ix_appointments_doctor_date", "doctor_id", "date"),
    )
