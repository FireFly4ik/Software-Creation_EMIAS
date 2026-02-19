import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaUserMd, FaChevronRight } from 'react-icons/fa';
import styles from './DoctorSelectionPage.module.css';

// Маппинг specialtyId к значениям Enum бэкенда
const SPECIALTY_MAPPING = {
  'covid-doctor': 'Дежурный врач ОРВИ',
  'district-doctor': 'Участковый врач',
  'therapist': 'Терапевт',
  'certificates': 'Кабинет выдачи справок и направлений',
  'surgeon': 'Хирург',
  'ophthalmologist': 'Офтальмолог',
  'otorhinolaryngologist': 'Оториноларинголог',
  'urologist': 'Уролог',
  'dispensary': 'Диспансеризация/Профилактический осмотр',
  'vaccination': 'Кабинет вакцинации',
};

const DoctorSelectionPage = ({
                               specialtyId,
                               specialtyName,
                               onBack,
                               onDoctorSelect,
                               allDoctors = [],  // ✅ Получаем врачей из MainPage
                               loading = false   // ✅ Получаем состояние загрузки
                             }) => {
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    // ✅ Фильтруем врачей по специализации
    const specializationValue = SPECIALTY_MAPPING[specialtyId];
    const filtered = allDoctors.filter(
      doctor => doctor.specialization === specializationValue
    );

    console.log('[DoctorSelection] Фильтрация врачей:', {
      specialtyId,
      specializationValue,
      allDoctors: allDoctors.length,
      filtered: filtered.length
    });

    setFilteredDoctors(filtered);
  }, [specialtyId, allDoctors]);

  // Функция для форматирования ФИО в "Фамилия И. О."
  const formatDoctorName = (doctor) => {
    const firstInitial = doctor.first_name ? doctor.first_name.charAt(0) + '.' : '';
    const middleInitial = doctor.middle_name ? doctor.middle_name.charAt(0) + '.' : '';
    return `${doctor.surname} ${firstInitial} ${middleInitial}`;
  };

  const handleDoctorClick = (doctor) => {
    console.log('Выбран врач:', doctor);
    onDoctorSelect?.(doctor);
  };

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <div className={styles.header}>
        <h1 className={styles.title}>{specialtyName}</h1>
      </div>

      {/* Список врачей */}
      <div className={styles.content}>
        {loading ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaUserMd className={styles.emptyIcon} />
            <p className={styles.emptyText}>Загрузка врачей...</p>
          </motion.div>
        ) : filteredDoctors.length === 0 ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaUserMd className={styles.emptyIcon} />
            <p className={styles.emptyText}>В данный момент нет доступных врачей</p>
          </motion.div>
        ) : (
          <div className={styles.doctorsList}>
            {filteredDoctors.map((doctor, index) => (
              <motion.button
                key={doctor.id}
                className={styles.doctorCard}
                onClick={() => handleDoctorClick(doctor)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.doctorIconWrapper}>
                  <FaUserMd className={styles.doctorIcon} />
                </div>
                <div className={styles.doctorInfo}>
                  <span className={styles.doctorName}>{formatDoctorName(doctor)}</span>
                  <span className={styles.doctorSpecialty}>{doctor.description}</span>
                </div>
                <FaChevronRight className={styles.chevronIcon} />
              </motion.button>
            ))}
          </div>
        )}
      </div>

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

export default DoctorSelectionPage;