import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaClinicMedical,
  FaSignInAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserShield
} from 'react-icons/fa';
import DoctorList from '../components/DoctorList';
import styles from './MainPage.module.css';
import DoctorSelectionPage from "./DoctorSelectionPage";
import DoctorSchedulePage from './DoctorSchedulePage';

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

const MainPage = ({ isAutorized, onLoginClick, PROFILE_DATA, onProfileUpdate, appointments, onAppointmentAdd, onRoleChange }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [direction, setDirection] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(PROFILE_DATA || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    if (PROFILE_DATA) {
      setEditedProfile(PROFILE_DATA);
    }
  }, [PROFILE_DATA]);

  const handleToggleAdmin = () => {
    const isAdmin = PROFILE_DATA?.role === 'admin';

    if (isAdmin) {
      const confirmed = window.confirm('Вы уверены, что хотите снять роль администратора?');
      if (confirmed) {
        onRoleChange?.('user');
      }
    } else {
      const confirmed = window.confirm('Вы уверены, что хотите стать администратором?');
      if (confirmed) {
        onRoleChange?.('admin');
      }
    }
  };

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация даты рождения
  const validateBirthDate = (date) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    return age >= 0 && age <= 150;
  };

  // Валидация телефона
  const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') return true;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 11 && cleanPhone.startsWith('7');
  };

  // Форматирование телефона
  const formatPhoneNumber = (value) => {
    let cleaned = value.replace(/\D/g, '');

    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    }

    if (cleaned.length > 0 && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }

    cleaned = cleaned.slice(0, 11);

    if (cleaned.length === 0) return '';

    let formatted = '+7';

    if (cleaned.length > 1) {
      formatted += ' (' + cleaned.slice(1, 4);
    }

    if (cleaned.length >= 5) {
      formatted += ') ' + cleaned.slice(4, 7);
    }

    if (cleaned.length >= 8) {
      formatted += '-' + cleaned.slice(7, 9);
    }

    if (cleaned.length >= 10) {
      formatted += '-' + cleaned.slice(9, 11);
    }

    return formatted;
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    if (!editedProfile.lastName?.trim()) {
      newErrors.lastName = 'Обязательное поле';
    }

    if (!editedProfile.firstName?.trim()) {
      newErrors.firstName = 'Обязательное поле';
    }

    if (!editedProfile.email?.trim()) {
      newErrors.email = 'Обязательное поле';
    } else if (!validateEmail(editedProfile.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!editedProfile.birthDate?.trim()) {
      newErrors.birthDate = 'Обязательное поле';
    } else if (!validateBirthDate(editedProfile.birthDate)) {
      newErrors.birthDate = 'Некорректная дата';
    }

    if (!editedProfile.gender) {
      newErrors.gender = 'Обязательное поле';
    }

    if (editedProfile.phone && editedProfile.phone.trim() !== '') {
      if (!validatePhone(editedProfile.phone)) {
        newErrors.phone = 'Некорректный номер телефона';
      }
    }

    return newErrors;
  };

  const isFormValid = () => {
    const newErrors = validateForm();
    return Object.keys(newErrors).length === 0;
  };

  const handleAppointmentClick = (appointment) => {
    console.log('Запись:', appointment);
  };

  const handleDoctorClick = (doctor) => {
    console.log('Врач/Специальность:', doctor.name);
    setSelectedSpecialty({
      id: doctor.id,
      name: doctor.name
    });
  };

  const handleBackFromDoctorSelection = () => {
    setSelectedSpecialty(null);
  };

  const handleDoctorSelect = (doctor) => {
    console.log('Выбран врач:', doctor);
    setSelectedDoctor(doctor);
  };

  const handleBackFromSchedule = () => {
    setSelectedDoctor(null);
  };

  const handleNeedAuth = () => {
    setSelectedDoctor(null);
    setSelectedSpecialty(null);
    setActiveTab('profile');
  };

  // Обработчик успешного бронирования
  const handleAppointmentBooked = (appointmentData) => {
    console.log('Новая запись добавлена:', appointmentData);
    onAppointmentAdd?.(appointmentData);

    setSelectedDoctor(null);
    setSelectedSpecialty(null);

    setActiveTab('profile');
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setDirection(newTab === 'doctor' ? 1 : -1);
    setActiveTab(newTab);
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;

    if (info.offset.x > swipeThreshold && activeTab === 'doctor') {
      handleTabChange('profile');
    } else if (info.offset.x < -swipeThreshold && activeTab === 'profile') {
      handleTabChange('doctor');
    }
  };

  const handleEditClick = () => {
    setEditedProfile(PROFILE_DATA);
    setErrors({});
    setTouched({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedProfile(PROFILE_DATA);
    setErrors({});
    setTouched({});
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        lastName: true,
        firstName: true,
        email: true,
        birthDate: true,
        gender: true,
        phone: editedProfile.phone ? true : false,
      });
      return;
    }

    console.log('Сохранение профиля:', editedProfile);
    onProfileUpdate?.(editedProfile);
    setErrors({});
    setTouched({});
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handlePhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    const fieldErrors = validateForm();
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
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

  if (selectedDoctor && activeTab === 'doctor') {
    return (
      <DoctorSchedulePage
        doctor={selectedDoctor}
        onBack={handleBackFromSchedule}
        isAuthorized={isAutorized}
        onNeedAuth={handleNeedAuth}
        onAppointmentBooked={handleAppointmentBooked}
      />
    );
  }

  if (selectedSpecialty && activeTab === 'doctor') {
    return (
      <DoctorSelectionPage
        specialtyId={selectedSpecialty.id}
        specialtyName={selectedSpecialty.name}
        onBack={handleBackFromDoctorSelection}
        onDoctorSelect={handleDoctorSelect}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Шапка */}
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
              {!isAutorized ? (
                <div className={styles.section}>
                  <motion.div
                    className={styles.loginPrompt}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <FaSignInAlt className={styles.loginIcon} />
                    <h2 className={styles.loginTitle}>Войдите в систему</h2>
                    <p className={styles.loginSubtitle}>
                      Для доступа к личным данным и истории записей необходимо авторизоваться
                    </p>
                    <motion.button
                      className={styles.loginButton}
                      onClick={onLoginClick}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaSignInAlt className={styles.loginButtonIcon} />
                      Войти
                    </motion.button>
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* Данные пользователя */}
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>Личные данные</h2>
                      {!isEditing ? (
                        <motion.button
                          className={styles.editButton}
                          onClick={handleEditClick}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaEdit className={styles.editIcon} />
                          Редактировать
                        </motion.button>
                      ) : (
                        <div className={styles.editActions}>
                          <motion.button
                            className={clsx(styles.actionButton, styles.saveButton, {
                              [styles.buttonDisabled]: !isFormValid()
                            })}
                            onClick={handleSaveEdit}
                            disabled={!isFormValid()}
                            whileHover={isFormValid() ? { scale: 1.05 } : {}}
                            whileTap={isFormValid() ? { scale: 0.95 } : {}}
                          >
                            <FaSave className={styles.actionIcon} />
                            Сохранить
                          </motion.button>
                          <motion.button
                            className={clsx(styles.actionButton, styles.cancelButton)}
                            onClick={handleCancelEdit}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTimes className={styles.actionIcon} />
                            Отмена
                          </motion.button>
                        </div>
                      )}
                    </div>

                    <div className={styles.profileCard}>
                      {/* Фамилия */}
                      <div className={styles.profileItem}>
                        <FaUser className={styles.profileIcon} />
                        <div className={styles.profileInfo}>
                          <span className={styles.profileLabel}>
                            Фамилия {isEditing && <span className={styles.required}>*</span>}
                          </span>
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={editedProfile.lastName || ''}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                onBlur={() => handleBlur('lastName')}
                                className={clsx(styles.profileInput, {
                                  [styles.inputError]: touched.lastName && errors.lastName
                                })}
                                placeholder="Фамилия"
                              />
                              {touched.lastName && errors.lastName && (
                                <motion.span
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={styles.errorText}
                                >
                                  {errors.lastName}
                                </motion.span>
                              )}
                            </>
                          ) : (
                            <span className={styles.profileValue}>{PROFILE_DATA?.lastName || '—'}</span>
                          )}
                        </div>
                      </div>

                      {/* Имя */}
                      <div className={styles.profileItem}>
                        <FaUser className={styles.profileIcon} />
                        <div className={styles.profileInfo}>
                          <span className={styles.profileLabel}>
                            Имя {isEditing && <span className={styles.required}>*</span>}
                          </span>
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={editedProfile.firstName || ''}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                onBlur={() => handleBlur('firstName')}
                                className={clsx(styles.profileInput, {
                                  [styles.inputError]: touched.firstName && errors.firstName
                                })}
                                placeholder="Имя"
                              />
                              {touched.firstName && errors.firstName && (
                                <motion.span
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={styles.errorText}
                                >
                                  {errors.firstName}
                                </motion.span>
                              )}
                            </>
                          ) : (
                            <span className={styles.profileValue}>{PROFILE_DATA?.firstName || '—'}</span>
                          )}
                        </div>
                      </div>

                      {/* Отчество */}
                      <div className={styles.profileItem}>
                        <FaUser className={styles.profileIcon} />
                        <div className={styles.profileInfo}>
                          <span className={styles.profileLabel}>Отчество</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProfile.middleName || ''}
                              onChange={(e) => handleInputChange('middleName', e.target.value)}
                              className={styles.profileInput}
                              placeholder="Отчество"
                            />
                          ) : (
                            <span className={styles.profileValue}>{PROFILE_DATA?.middleName || '—'}</span>
                          )}
                        </div>
                      </div>

                      {/* Телефон */}
                      <div className={styles.profileItem}>
                        <FaPhone className={styles.profileIcon} />
                        <div className={styles.profileInfo}>
                          <span className={styles.profileLabel}>Телефон</span>
                          {isEditing ? (
                            <>
                              <input
                                type="tel"
                                value={editedProfile.phone || ''}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                onBlur={() => handleBlur('phone')}
                                className={clsx(styles.profileInput, {
                                  [styles.inputError]: touched.phone && errors.phone
                                })}
                                placeholder="+7 (999) 999-99-99"
                              />
                              {touched.phone && errors.phone && (
                                <motion.span
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={styles.errorText}
                                >
                                  {errors.phone}
                                </motion.span>
                              )}
                            </>
                          ) : (
                            <span className={styles.profileValue}>{PROFILE_DATA?.phone || '—'}</span>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className={styles.profileItem}>
                        <FaEnvelope className={styles.profileIcon} />
                        <div className={styles.profileInfo}>
                          <span className={styles.profileLabel}>
                            Email {isEditing && <span className={styles.required}>*</span>}
                          </span>
                          {isEditing ? (
                            <>
                              <input
                                type="email"
                                value={editedProfile.email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                className={clsx(styles.profileInput, {
                                  [styles.inputError]: touched.email && errors.email
                                })}
                                placeholder="example@mail.com"
                              />
                              {touched.email && errors.email && (
                                <motion.span
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={styles.errorText}
                                >
                                  {errors.email}
                                </motion.span>
                              )}
                            </>
                          ) : (
                            <span className={styles.profileValue}>{PROFILE_DATA?.email || '—'}</span>
                          )}
                        </div>
                      </div>

                      {/* Дата рождения */}
                      <div className={styles.profileItem}>
                        <FaCalendar className={styles.profileIcon} />
                        <div className={styles.profileInfo}>
                          <span className={styles.profileLabel}>
                            Дата рождения {isEditing && <span className={styles.required}>*</span>}
                          </span>
                          {isEditing ? (
                            <>
                              <input
                                type="date"
                                value={editedProfile.birthDate || ''}
                                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                onBlur={() => handleBlur('birthDate')}
                                className={clsx(styles.profileInput, styles.inputDate, {
                                  [styles.inputError]: touched.birthDate && errors.birthDate
                                })}
                                max={new Date().toISOString().split('T')[0]}
                              />
                              {touched.birthDate && errors.birthDate && (
                                <motion.span
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={styles.errorText}
                                >
                                  {errors.birthDate}
                                </motion.span>
                              )}
                            </>
                          ) : (
                            <span className={styles.profileValue}>
                              {PROFILE_DATA?.birthDate ? formatDate(PROFILE_DATA.birthDate) : '—'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Пол */}
                      <div className={styles.profileItem}>
                        <FaVenusMars className={styles.profileIcon} />
                        <div className={styles.profileInfo}>
                          <span className={styles.profileLabel}>
                            Пол {isEditing && <span className={styles.required}>*</span>}
                          </span>
                          {isEditing ? (
                            <>
                              <select
                                value={editedProfile.gender || ''}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                onBlur={() => handleBlur('gender')}
                                className={clsx(styles.profileSelect, {
                                  [styles.inputError]: touched.gender && errors.gender,
                                  [styles.selectPlaceholder]: !editedProfile.gender
                                })}
                              >
                                <option value="">Выберите пол</option>
                                <option value="Мужской">Мужской</option>
                                <option value="Женский">Женский</option>
                              </select>
                              {touched.gender && errors.gender && (
                                <motion.span
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={styles.errorText}
                                >
                                  {errors.gender}
                                </motion.span>
                              )}
                            </>
                          ) : (
                            <span className={styles.profileValue}>{PROFILE_DATA?.gender || '—'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* История записей */}
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>История записей</h2>
                    {appointments && appointments.length > 0 ? (
                      <div className={styles.historyList}>
                        {appointments.map((appointment) => (
                          <motion.button
                            key={appointment.id}
                            className={styles.historyCard}
                            onClick={() => handleAppointmentClick(appointment)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className={styles.historyContent}>
                              <div className={styles.historyDateTime}>
                                <span className={styles.historyDate}>{appointment.date}</span>
                                {appointment.time && (
                                  <span className={styles.historyTime}>{appointment.time}</span>
                                )}
                              </div>
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
                    ) : (
                      <motion.div
                        className={styles.emptyAppointments}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <FaCalendar className={styles.emptyIcon} />
                        <p className={styles.emptyText}>У вас пока нет записей к врачу</p>
                      </motion.div>
                    )}
                  </div>
                  {/* Кнопка "Стать администратором" / "Перестать быть администратором" */}
                  <div className={styles.section}>
                    <motion.button
                      className={clsx(styles.adminButton, {
                        [styles.adminButtonActive]: PROFILE_DATA?.role === 'admin'
                      })}
                      onClick={handleToggleAdmin}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <FaUserShield className={styles.adminButtonIcon} />
                      {PROFILE_DATA?.role === 'admin'
                        ? 'Перестать быть администратором'
                        : 'Стать администратором'
                      }
                    </motion.button>
                  </div>
                </>
              )}
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
              <DoctorList
                categories={DOCTORS_DATA}
                onDoctorClick={handleDoctorClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainPage;