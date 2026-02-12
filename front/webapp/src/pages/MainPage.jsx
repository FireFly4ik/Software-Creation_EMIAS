import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import clsx from 'clsx';
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaVenusMars,
  FaChevronRight,
  FaStethoscope,
  FaUserMd,
  FaFileMedical,
  FaCut,
  FaEye,
  FaHeadSideVirus,
  FaSyringe,
  FaClipboardCheck,
  FaShieldVirus,
  FaHospitalUser,
  FaClinicMedical
} from 'react-icons/fa';
import styles from './MainPage.module.css';

const PROFILE_DATA = {
  name: 'Иван Иванович',
  phone: '+7 (999) 123-45-67',
  email: 'ivan@example.com',
  birthDate: '01.01.1990',
  gender: 'Мужской',
};

const APPOINTMENT_HISTORY = [
  {
    id: 1,
    date: '05.04.2025',
    service: 'Приём терапевта',
    status: 'Завершено',
    statusColor: '#4CAF50',
  },
  {
    id: 2,
    date: '12.04.2025',
    service: 'УЗИ органов брюшной полости',
    status: 'Ожидание',
    statusColor: '#FF9800',
  },
  {
    id: 3,
    date: '18.04.2025',
    service: 'Вакцинация',
    status: 'Запланировано',
    statusColor: '#2196F3',
  },
];

const DOCTORS_DATA = [
  {
    category: 'ОРВИ / COVID-19',
    items: [
      {
        id: 'covid-doctor',
        name: 'Дежурный врач ОРВИ',
        icon: FaShieldVirus,
        color: '#FF5252'
      },
    ],
  },
  {
    category: 'Специальности',
    items: [
      { id: 'district-doctor', name: 'Участковый врач', icon: FaUserMd, color: '#2196F3' },
      { id: 'therapist', name: 'Терапевт', icon: FaStethoscope, color: '#4CAF50' },
      { id: 'certificates', name: 'Кабинет выдачи справок и направлений', icon: FaFileMedical, color: '#9C27B0' },
      { id: 'surgeon', name: 'Хирург', icon: FaCut, color: '#F44336' },
      { id: 'ophthalmologist', name: 'Офтальмолог', icon: FaEye, color: '#00BCD4' },
      { id: 'otorhinolaryngologist', name: 'Оториноларинголог', icon: FaHeadSideVirus, color: '#FF9800' },
      { id: 'urologist', name: 'Уролог', icon: FaHospitalUser, color: '#3F51B5' },
      { id: 'dispensary', name: 'Диспансеризация/Профилактический осмотр', icon: FaClipboardCheck, color: '#009688' },
      { id: 'vaccination', name: 'Кабинет вакцинации', icon: FaSyringe, color: '#8BC34A' },
    ],
  },
];

const MainPage = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'doctor'
  const [direction, setDirection] = useState(0);

  const handleAppointmentClick = (appointment) => {
    console.log('Запись:', appointment);
  };

  const handleDoctorClick = (doctor) => {
    console.log('Врач/Специальность:', doctor.name);
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setDirection(newTab === 'doctor' ? 1 : -1);
    setActiveTab(newTab);
  };

  // Обработка свайпов
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;

    if (info.offset.x > swipeThreshold && activeTab === 'doctor') {
      // Свайп вправо - переход на профиль
      handleTabChange('profile');
    } else if (info.offset.x < -swipeThreshold && activeTab === 'profile') {
      // Свайп влево - переход на врача
      handleTabChange('doctor');
    }
  };

  const tabVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div className={styles.container}>
      {/* Шапка с логотипом */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <FaClinicMedical className={styles.logoIcon} />
          <span className={styles.logoText}>Моя Клиника</span>
        </div>
      </div>

      {/* Табы */}
      <div className={styles.tabs}>
        <button
          className={clsx(styles.tab, {
            [styles.tabActive]: activeTab === 'profile',
          })}
          onClick={() => handleTabChange('profile')}
        >
          Профиль
          {activeTab === 'profile' && (
            <motion.div
              className={styles.tabIndicator}
              layoutId="tabIndicator"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
        <button
          className={clsx(styles.tab, {
            [styles.tabActive]: activeTab === 'doctor',
          })}
          onClick={() => handleTabChange('doctor')}
        >
          Врач
          {activeTab === 'doctor' && (
            <motion.div
              className={styles.tabIndicator}
              layoutId="tabIndicator"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Контент вкладок с поддержкой свайпов */}
      <div className={styles.content}>
        <AnimatePresence mode="wait" custom={direction}>
          {activeTab === 'profile' ? (
            <motion.div
              key="profile"
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className={styles.tabContent}
            >
              {/* Данные пользователя */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Личные данные</h2>
                <div className={styles.profileCard}>
                  <div className={styles.profileItem}>
                    <FaUser className={styles.profileIcon} />
                    <div className={styles.profileInfo}>
                      <span className={styles.profileLabel}>ФИО</span>
                      <span className={styles.profileValue}>{PROFILE_DATA.name}</span>
                    </div>
                  </div>

                  <div className={styles.profileItem}>
                    <FaPhone className={styles.profileIcon} />
                    <div className={styles.profileInfo}>
                      <span className={styles.profileLabel}>Телефон</span>
                      <span className={styles.profileValue}>{PROFILE_DATA.phone}</span>
                    </div>
                  </div>

                  <div className={styles.profileItem}>
                    <FaEnvelope className={styles.profileIcon} />
                    <div className={styles.profileInfo}>
                      <span className={styles.profileLabel}>Email</span>
                      <span className={styles.profileValue}>{PROFILE_DATA.email}</span>
                    </div>
                  </div>

                  <div className={styles.profileItem}>
                    <FaCalendar className={styles.profileIcon} />
                    <div className={styles.profileInfo}>
                      <span className={styles.profileLabel}>Дата рождения</span>
                      <span className={styles.profileValue}>{PROFILE_DATA.birthDate}</span>
                    </div>
                  </div>

                  <div className={styles.profileItem}>
                    <FaVenusMars className={styles.profileIcon} />
                    <div className={styles.profileInfo}>
                      <span className={styles.profileLabel}>Пол</span>
                      <span className={styles.profileValue}>{PROFILE_DATA.gender}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* История записей */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>История записей</h2>
                <div className={styles.historyList}>
                  {APPOINTMENT_HISTORY.map((appointment) => (
                    <motion.button
                      key={appointment.id}
                      className={styles.historyCard}
                      onClick={() => handleAppointmentClick(appointment)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={styles.historyContent}>
                        <div className={styles.historyDate}>{appointment.date}</div>
                        <div className={styles.historyService}>{appointment.service}</div>
                        <div
                          className={styles.historyStatus}
                          style={{ color: appointment.statusColor }}
                        >
                          {appointment.status}
                        </div>
                      </div>
                      <FaChevronRight className={styles.historyArrow} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="doctor"
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className={styles.tabContent}
            >
              {DOCTORS_DATA.map((category, categoryIndex) => (
                <div key={categoryIndex} className={styles.section}>
                  <h2 className={styles.sectionTitle}>{category.category}</h2>
                  <div className={styles.doctorsList}>
                    {category.items.map((doctor) => {
                      const IconComponent = doctor.icon;
                      return (
                        <motion.button
                          key={doctor.id}
                          className={styles.doctorCard}
                          onClick={() => handleDoctorClick(doctor)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className={styles.doctorIconWrapper}
                            style={{ backgroundColor: `${doctor.color}20` }}
                          >
                            <IconComponent
                              className={styles.doctorIcon}
                              style={{ color: doctor.color }}
                            />
                          </div>
                          <span className={styles.doctorName}>{doctor.name}</span>
                          <FaChevronRight className={styles.doctorArrow} />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainPage;