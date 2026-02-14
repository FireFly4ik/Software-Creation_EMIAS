import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaUserMd, FaChevronRight } from 'react-icons/fa';
import styles from './DoctorSelectionPage.module.css';

const ALL_DOCTORS = [
  { id: 1, lastName: 'Петров', firstName: 'Алексей', middleName: 'Сергеевич', desc: 'Дежурный врач ОРВИ', specialty: 'covid-doctor' },
  { id: 2, lastName: 'Сидорова', firstName: 'Мария', middleName: 'Ивановна', desc: 'Дежурный врач ОРВИ', specialty: 'covid-doctor' },
  { id: 3, lastName: 'Иванов', firstName: 'Иван', middleName: 'Иванович', desc: 'Терапевт', specialty: 'therapist' },
  { id: 4, lastName: 'Кузнецова', firstName: 'Анна', middleName: 'Петровна', desc: 'Терапевт', specialty: 'therapist' },
  { id: 5, lastName: 'Смирнов', firstName: 'Дмитрий', middleName: 'Александрович', desc: 'Терапевт', specialty: 'therapist' },
  { id: 6, lastName: 'Волкова', firstName: 'Елена', middleName: 'Викторовна', desc: 'Участковый врач', specialty: 'district-doctor' },
  { id: 7, lastName: 'Морозов', firstName: 'Сергей', middleName: 'Николаевич', desc: 'Участковый врач', specialty: 'district-doctor' },
  { id: 8, lastName: 'Соколов', firstName: 'Михаил', middleName: 'Владимирович', desc: 'Хирург', specialty: 'surgeon' },
  { id: 9, lastName: 'Новикова', firstName: 'Ольга', middleName: 'Андреевна', desc: 'Хирург', specialty: 'surgeon' },
  { id: 10, lastName: 'Лебедев', firstName: 'Константин', middleName: 'Юрьевич', desc: 'Офтальмолог', specialty: 'ophthalmologist' },
  { id: 11, lastName: 'Павлова', firstName: 'Татьяна', middleName: 'Сергеевна', desc: 'Оториноларинголог', specialty: 'otorhinolaryngologist' },
  { id: 12, lastName: 'Федоров', firstName: 'Андрей', middleName: 'Павлович', desc: 'Уролог', specialty: 'urologist' },
  { id: 13, lastName: 'Егорова', firstName: 'Наталья', middleName: 'Владимировна', desc: 'Выдача справок и направлений', specialty: 'certificates' },
  { id: 14, lastName: 'Козлов', firstName: 'Владислав', middleName: 'Игоревич', desc: 'Диспансеризация', specialty: 'dispensary' },
  { id: 15, lastName: 'Романова', firstName: 'Светлана', middleName: 'Дмитриевна', desc: 'Диспансеризация', specialty: 'dispensary' },
  { id: 16, lastName: 'Зайцева', firstName: 'Ирина', middleName: 'Алексеевна', desc: 'Вакцинация', specialty: 'vaccination' },
];

const DoctorSelectionPage = ({ specialtyId, specialtyName, onBack, onDoctorSelect }) => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const filteredDoctors = ALL_DOCTORS.filter(doctor => doctor.specialty === specialtyId);
    setDoctors(filteredDoctors);

    // TODO: В реальности это будет запрос к бэкенду
    // const fetchDoctors = async () => {
    //   const response = await fetch(`/api/doctors?specialty=${specialtyId}`);
    //   const data = await response.json();
    //   setDoctors(data);
    // };
    // fetchDoctors();
  }, [specialtyId]);

  // Функция для форматирования ФИО в "Фамилия И. О."
  const formatDoctorName = (doctor) => {
    const firstInitial = doctor.firstName ? doctor.firstName.charAt(0) + '.' : '';
    const middleInitial = doctor.middleName ? doctor.middleName.charAt(0) + '.' : '';
    return `${doctor.lastName} ${firstInitial} ${middleInitial}`;
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
        {doctors.length === 0 ? (
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
            {doctors.map((doctor, index) => (
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
                  <span className={styles.doctorSpecialty}>{doctor.desc}</span>
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