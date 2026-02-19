import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaUserMd, FaCalendarAlt, FaClock } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './DoctorSchedulePage.module.css';
import {DOCTOR_SCHEDULES} from "../test_data";

// Глобальное хранилище забронированных слотов
let GLOBAL_BOOKED_SLOTS = {};

// const DOCTOR_SCHEDULES = {
//   1: {
//     '2025-02-20': [1, 8, 9, 13, 20],
//     '2025-02-21': [0, 5, 10, 15, 25],
//     '2025-02-22': [2, 7, 12, 18, 23],
//   },
//   2: {
//     '2025-02-20': [3, 6, 11, 16, 21],
//     '2025-02-21': [1, 4, 9, 14, 19],
//   },
//   3: {
//     '2025-02-20': [3, 6, 11, 16, 21],
//     '2025-02-21': [1, 4, 9, 14, 19],
//     '2025-02-24': [0, 5, 10, 15, 20, 25],
//   },
//   4: {
//     '2025-02-20': [2, 5, 8, 12, 17],
//     '2025-02-22': [0, 6, 11, 16, 22],
//   },
//   5: {
//     '2025-02-21': [4, 7, 10, 14, 19, 24],
//     '2025-02-23': [1, 6, 11, 16, 21],
//   },
// };

// Генерация доступных дней
const generateAvailableDays = () => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }

  return days;
};

// Генерация временных слотов
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 8;
  const endHour = 18;

  let index = 0;
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({ index, time });
      index++;
    }
  }

  return slots;
};

const DoctorSchedulePage = ({ doctor, onBack, isAuthorized, onNeedAuth, onAppointmentBooked }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableDays] = useState(generateAvailableDays());
  const [timeSlots] = useState(generateTimeSlots());
  const [bookedSlots, setBookedSlots] = useState({});

  useEffect(() => {
    if (availableDays.length > 0) {
      setSelectedDate(availableDays[0]);
    }

    const doctorKey = `doctor_${doctor.id}`;

    if (!GLOBAL_BOOKED_SLOTS[doctorKey]) {
      if (DOCTOR_SCHEDULES[doctor.id]) {
        GLOBAL_BOOKED_SLOTS[doctorKey] = JSON.parse(JSON.stringify(DOCTOR_SCHEDULES[doctor.id]));
      } else {
        GLOBAL_BOOKED_SLOTS[doctorKey] = {};
      }
    }

    // Устанавливаем локальное состояние из глобального хранилища
    setBookedSlots(GLOBAL_BOOKED_SLOTS[doctorKey]);
  }, [availableDays, doctor]);

  const handleTimeSlotClick = (slot) => {
    if (!isAuthorized) {
      alert('Для записи к врачу необходимо авторизоваться');
      onNeedAuth?.();
      return;
    }

    if (isSlotBooked(slot.index)) {
      return;
    }

    setSelectedTime(slot);
  };

  //TODO: вынести в hook
  // Форматирования ФИО врача
  const formatDoctorName = (doctor) => {
    const firstInitial = doctor.firstName ? doctor.firstName.charAt(0) + '.' : '';
    const middleInitial = doctor.middleName ? doctor.middleName.charAt(0) + '.' : '';
    return `${doctor.lastName} ${firstInitial} ${middleInitial}`;
  };

  // Форматирование даты
  const formatDateShort = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('ru-RU', { month: 'short' });
    return { day, month };
  };

  // Форматирование даты для ключа
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Получение названия дня недели
  const getDayName = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    } else {
      return date.toLocaleString('ru-RU', { weekday: 'short' });
    }
  };

  // Проверка, занят ли слот
  const isSlotBooked = (slotIndex) => {
    if (!selectedDate || !doctor) return false;

    const dateKey = formatDateKey(selectedDate);

    if (!bookedSlots[dateKey]) return false;

    return bookedSlots[dateKey].includes(slotIndex);
  };

  // Подтверждение записи
  const handleConfirmBooking = () => {
    if (!selectedTime) return;

    const dateKey = formatDateKey(selectedDate);
    const displayDate = selectedDate.toLocaleDateString('ru-RU');

    const bookingData = {
      id: Date.now(),
      doctorId: doctor.id,
      dateKey: dateKey,
      date: displayDate,
      time: selectedTime.time,
      slotIndex: selectedTime.index,
      status: 'Запланировано',
    };

    console.log('Запись подтверждена:', selectedDate);

    // Обновляем глобальное хранилище
    const doctorKey = `doctor_${doctor.id}`;
    if (!GLOBAL_BOOKED_SLOTS[doctorKey]) {
      GLOBAL_BOOKED_SLOTS[doctorKey] = {};
    }
    if (!GLOBAL_BOOKED_SLOTS[doctorKey][dateKey]) {
      GLOBAL_BOOKED_SLOTS[doctorKey][dateKey] = [];
    }
    GLOBAL_BOOKED_SLOTS[doctorKey][dateKey] = [...GLOBAL_BOOKED_SLOTS[doctorKey][dateKey], selectedTime.index];

    // Обновляем локальное состояние
    setBookedSlots(prev => {
      const updated = { ...prev };
      if (!updated[dateKey]) {
        updated[dateKey] = [];
      }
      updated[dateKey] = [...updated[dateKey], selectedTime.index];
      return updated;
    });

    setSelectedTime(null);

    onAppointmentBooked?.(bookingData);

    alert(`Вы записаны к врачу ${formatDoctorName(doctor)} на ${displayDate} в ${selectedTime.time}`);
  };

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <div className={styles.header}>
        <div className={styles.doctorInfo}>
          <div className={styles.doctorIconWrapper}>
            <FaUserMd className={styles.doctorIcon} />
          </div>
          <div>
            <h1 className={styles.doctorName}>{formatDoctorName(doctor)}</h1>
            <p className={styles.doctorSpecialty}>{doctor.desc}</p>
          </div>
        </div>
      </div>

      {/* Выбор даты */}
      <div className={styles.dateSection}>
        <div className={styles.sectionHeader}>
          <FaCalendarAlt className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Выберите дату</h2>
        </div>
        <div className={styles.datesScroll}>
          {availableDays.map((date, index) => {
            const { day, month } = formatDateShort(date);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            return (
              <motion.button
                key={index}
                className={clsx(styles.dateCard, {
                  [styles.dateCardActive]: isSelected,
                })}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={styles.dateDayName}>{getDayName(date)}</span>
                <span className={styles.dateDay}>{day}</span>
                <span className={styles.dateMonth}>{month}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Выбор времени */}
      <div className={styles.timeSection}>
        <div className={styles.sectionHeader}>
          <FaClock className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Выберите время</h2>
        </div>
        <div className={styles.timeSlotsGrid}>
          {timeSlots.map((slot) => {
            const isBooked = isSlotBooked(slot.index);
            const isSelected = selectedTime && selectedTime.index === slot.index;

            return (
              <motion.button
                key={slot.index}
                className={clsx(styles.timeSlot, {
                  [styles.timeSlotBooked]: isBooked,
                  [styles.timeSlotActive]: isSelected,
                })}
                onClick={() => handleTimeSlotClick(slot)}
                disabled={isBooked}
                whileHover={!isBooked ? { scale: 1.05 } : {}}
                whileTap={!isBooked ? { scale: 0.95 } : {}}
              >
                {slot.time}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Кнопка подтверждения */}
      <AnimatePresence>
        {selectedTime && (
          <motion.div
            className={styles.confirmSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className={styles.confirmButton}
              onClick={handleConfirmBooking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Подтвердить запись на {selectedTime.time}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Плавающая кнопка возврата */}
      <motion.button
        className={styles.backButton}
        onClick={onBack}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
      >
        <FaArrowLeft className={styles.backIcon} />
      </motion.button>
    </div>
  );
};

export default DoctorSchedulePage;