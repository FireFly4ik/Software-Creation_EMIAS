import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaUserMd,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import styles from './AdminAppointmentsPage.module.css';
import useApi from '../hooks/useApi';

const AdminAppointmentsPage = ({ doctor, onBack }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const api = useApi();

  useEffect(() => {
    if (doctor) {
      loadAppointments();
    }
  }, [doctor]);

  const loadAppointments = async () => {
    if (!doctor) return;

    setLoading(true);
    try {

      const data = await api.getAppointments({ doctor_id: doctor.id });

      const sorted = data.sort((a, b) => {
        if (a.date !== b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        return b.slot_index - a.slot_index;
      });

      setAppointments(sorted);
    } catch (error) {
      alert(`Ошибка загрузки записей: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const patientName = `ID: ${appointment.user_id}`;

    const confirmed = window.confirm(
      `Вы уверены, что хотите отменить запись?\n\nПациент: ${patientName}\nДата: ${formatDate(appointment.date)}\nВремя: ${calculateTimeFromSlot(appointment.slot_index)}`
    );

    if (!confirmed) return;

    try {
      await api.cancelAppointment(appointment.id);
      await loadAppointments();
      alert('Запись успешно отменена');
    } catch (error) {
      alert(`Ошибка отмены записи: ${error.message}`);
    }
  };
  const formatDoctorName = (doctor) => {
    const firstInitial = doctor.first_name ? doctor.first_name.charAt(0) + '.' : '';
    const middleInitial = doctor.middle_name ? doctor.middle_name.charAt(0) + '.' : '';
    return `${doctor.surname} ${firstInitial} ${middleInitial}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateTimeFromSlot = (slotIndex) => {
    if (slotIndex === undefined || slotIndex === null) return '';

    const startHour = 10;
    const slotDuration = 20;

    const totalMinutes = slotIndex * slotDuration;
    const hour = startHour + Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const formatPatientName = (userId) => {
    return `ID: ${userId}`;
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'planned') return appointment.status === 'Запланировано';
    if (filter === 'finished') return appointment.status === 'Завершено';
    if (filter === 'cancelled') return appointment.status === 'Отменено';
    return true;
  });

  const statusColors = {
    'Запланировано': '#3B82F6',
    'Завершено': '#10B981',
    'Отменено': '#EF4444',
  };

  const statusIcons = {
    'Запланировано': FaClock,
    'Завершено': FaCheck,
    'Отменено': FaTimes,
  };

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <div className={styles.header}>
        <h1 className={styles.title}>{formatDoctorName(doctor)}</h1>
        <p className={styles.subtitle}>{doctor.description}</p>
      </div>

      <div className={styles.content}>
        {/* Фильтры */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('all')}
          >
            Все ({appointments.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'planned' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('planned')}
          >
            Запланировано ({appointments.filter(a => a.status === 'Запланировано').length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'finished' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('finished')}
          >
            Завершено ({appointments.filter(a => a.status === 'Завершено').length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'cancelled' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Отменено ({appointments.filter(a => a.status === 'Отменено').length})
          </button>
        </div>

        {/* Список записей */}
        {loading ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaCalendarAlt className={styles.emptyIcon} />
            <p className={styles.emptyText}>Загрузка записей...</p>
          </motion.div>
        ) : filteredAppointments.length === 0 ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaCalendarAlt className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              {filter === 'all'
                ? 'У этого врача пока нет записей'
                : `Нет записей со статусом "${filter}"`
              }
            </p>
          </motion.div>
        ) : (
          <div className={styles.appointmentsList}>
            {filteredAppointments.map((appointment, index) => {
              const StatusIcon = statusIcons[appointment.status] || FaClock;

              return (
                <motion.div
                  key={appointment.id}
                  className={styles.appointmentCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className={styles.appointmentMain}>
                    <div className={styles.appointmentDateTime}>
                      <div className={styles.dateTimeItem}>
                        <FaCalendarAlt className={styles.appointmentIcon} />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className={styles.dateTimeItem}>
                        <FaClock className={styles.appointmentIcon} />
                        <span>{calculateTimeFromSlot(appointment.slot_index)}</span>
                      </div>
                    </div>

                    <div
                      className={styles.appointmentStatus}
                      style={{ backgroundColor: statusColors[appointment.status] }}
                    >
                      <StatusIcon />
                      <span>{appointment.status}</span>
                    </div>
                  </div>

                  <div className={styles.appointmentPatient}>
                    <FaUser className={styles.patientIcon} />
                    <div className={styles.patientInfo}>
                      <span className={styles.patientLabel}>Пациент:</span>
                      <span className={styles.patientName}>
                        {formatPatientName(appointment.user_id)}
                      </span>
                    </div>
                  </div>

                  {appointment.status === 'Запланировано' && (
                    <div className={styles.appointmentActions}>
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleCancelAppointment(appointment)}
                      >
                        <FaTimes />
                        Отменить запись
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

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

export default AdminAppointmentsPage;