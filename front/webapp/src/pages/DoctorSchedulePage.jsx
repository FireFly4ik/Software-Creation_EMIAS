import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaUserMd, FaCalendarAlt, FaClock } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './DoctorSchedulePage.module.css';
import useApi from '../hooks/useApi';

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

const generateTimeSlots = () => {
  const slots = [];
  const startHour = 10;
  const endHour = 18;

  let index = 0;
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({ index, time, hour, minute });
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
  const [loading, setLoading] = useState(false);

  const api = useApi();

  useEffect(() => {
    if (availableDays.length > 0) {
      setSelectedDate(availableDays[0]);
    }
  }, [availableDays]);

  useEffect(() => {
    if (doctor?.id) {
      loadAppointments();
    }
  }, [doctor?.id]);

  const loadAppointments = async () => {
    try {

      const appointments = await api.getAppointments({ doctor_id: doctor.id });

      const bookedSlotsMap = {};

      appointments.forEach((appointment, index) => {

        if (appointment.status === 'Запланировано') {
          const dateKey = appointment.date; // 2026-02-24

          if (!bookedSlotsMap[dateKey]) {
            bookedSlotsMap[dateKey] = [];
          }

          bookedSlotsMap[dateKey].push(appointment.slot_index);
        }
      });


      setBookedSlots(bookedSlotsMap);

    } catch (error) {
    }
  };


  const handleTimeSlotClick = (slot) => {
    if (!isAuthorized) {
      alert('Для записи к врачу необходимо авторизоваться');
      onNeedAuth?.();
      return;
    }

    if (isSlotBooked(slot.index) || isSlotPassed(slot)) {
      return;
    }

    setSelectedTime(slot);
  };

  const formatDoctorName = (doctor) => {
    const firstInitial = doctor.first_name ? doctor.first_name.charAt(0) + '.' : '';
    const middleInitial = doctor.middle_name ? doctor.middle_name.charAt(0) + '.' : '';
    return `${doctor.surname} ${firstInitial} ${middleInitial}`;
  };

  const formatDateShort = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('ru-RU', { month: 'short' });
    return { day, month };
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const isSlotBooked = (slotIndex) => {
    if (!selectedDate || !doctor) return false;

    const dateKey = formatDateKey(selectedDate);

    const isBooked = bookedSlots[dateKey] && bookedSlots[dateKey].includes(slotIndex);


    return isBooked;
  };

  const isSlotPassed = (slot) => {
    if (!selectedDate) return false;

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slotDate = new Date(selectedDate);
    slotDate.setHours(0, 0, 0, 0);

    if (slotDate.getTime() !== today.getTime()) {
      return false;
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (slot.hour < currentHour) {
      return true;
    }

    if (slot.hour === currentHour && slot.minute <= currentMinute) {
      return true;
    }

    return false;
  };
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleConfirmBooking = async () => {
    if (!selectedTime || loading) return;

    setLoading(true);

    const currentSlot = selectedTime;
    const dateKey = formatDateKey(selectedDate);

    try {
      const dateForAPI = formatDateForAPI(selectedDate);

      const requestData = {
        doctor_id: doctor.id,
        date: dateForAPI,
        slot_index: currentSlot.index,
      };


      setSelectedTime(null);

      setBookedSlots(prev => {
        const updated = { ...prev };
        if (!updated[dateKey]) {
          updated[dateKey] = [];
        }
        if (!updated[dateKey].includes(currentSlot.index)) {
          updated[dateKey] = [...updated[dateKey], currentSlot.index];
        }
        return updated;
      });

      const responseData = await api.createAppointment(requestData);

      const displayDate = selectedDate.toLocaleDateString('ru-RU');
      alert(`Вы записаны к врачу ${formatDoctorName(doctor)} на ${displayDate} в ${currentSlot.time}`);

      loadAppointments()

      onAppointmentBooked?.(responseData);

    } catch (error) {

      setBookedSlots(prev => {
        const updated = { ...prev };
        if (updated[dateKey]) {
          updated[dateKey] = updated[dateKey].filter(idx => idx !== currentSlot.index);
          if (updated[dateKey].length === 0) {
            delete updated[dateKey];
          }
        }
        return updated;
      });

      if (error.message.includes('409') || error.message.includes('already')) {
        alert('Это время уже занято. Выберите другое.');
        await loadAppointments();
      } else {
        alert(`Произошла ошибка при записи: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
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
            <p className={styles.doctorSpecialty}>{doctor.description}</p>
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
            const isPassed = isSlotPassed(slot);
            const isDisabled = isBooked || isPassed;
            const isSelected = selectedTime && selectedTime.index === slot.index;

            return (
              <motion.button
                key={slot.index}
                className={clsx(styles.timeSlot, {
                  [styles.timeSlotBooked]: isDisabled,
                  [styles.timeSlotActive]: isSelected,
                })}
                onClick={() => handleTimeSlotClick(slot)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
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
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Запись...' : `Подтвердить запись на ${selectedTime.time}`}
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