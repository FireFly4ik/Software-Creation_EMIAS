import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaUserShield,
  FaCalendar,
  FaVenusMars
} from 'react-icons/fa';
import styles from './UserRegistrationForm.module.css';

const UserRegistrationForm = ({ onSubmit, onGuest }) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
  });

  const [agreedToNewsletter, setAgreedToNewsletter] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация телефона
  const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') return true; // Телефон необязателен
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

  // Валидация даты рождения
  const validateBirthDate = (date) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    return age >= 0 && age <= 150;
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Обязательное поле';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Обязательное поле';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Обязательное поле';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'Обязательное поле';
    } else if (!validateBirthDate(formData.birthDate)) {
      newErrors.birthDate = 'Некорректная дата';
    }

    if (!formData.gender) {
      newErrors.gender = 'Обязательное поле';
    }

    // Валидация телефона (если введён)
    if (formData.phone && formData.phone.trim() !== '') {
      if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Некорректный номер телефона';
      }
    }

    return newErrors;
  };

  // Проверка заполненности обязательных полей
  const isFormValid = () => {
    const newErrors = validateForm();
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Убираем ошибку при начале ввода
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
    handleChange('phone', formatted);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    const fieldErrors = validateForm();
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        lastName: true,
        firstName: true,
        email: true,
        birthDate: true,
        gender: true,
        phone: formData.phone ? true : false,
      });
      return;
    }

    const submissionData = {
      ...formData,
      agreedToNewsletter,
    };

    console.log('Форма отправлена:', submissionData);
    onSubmit?.(submissionData);
  };

  const handleGuestClick = () => {
    console.log('Пользователь остался гостем');
    onGuest?.();
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.formWrapper}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Заголовок */}
        <div className={styles.header}>
          <FaUserShield className={styles.headerIcon} />
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.subtitle}>Заполните данные для входа в систему</p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Фамилия */}
          <div className={styles.field}>
            <label className={styles.label}>
              Фамилия <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={clsx(styles.input, {
                  [styles.inputError]: touched.lastName && errors.lastName,
                })}
                placeholder="Иванов"
              />
            </div>
            {touched.lastName && errors.lastName && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorText}
              >
                {errors.lastName}
              </motion.span>
            )}
          </div>

          {/* Имя */}
          <div className={styles.field}>
            <label className={styles.label}>
              Имя <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={clsx(styles.input, {
                  [styles.inputError]: touched.firstName && errors.firstName,
                })}
                placeholder="Иван"
              />
            </div>
            {touched.firstName && errors.firstName && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorText}
              >
                {errors.firstName}
              </motion.span>
            )}
          </div>

          {/* Отчество */}
          <div className={styles.field}>
            <label className={styles.label}>
              Отчество <span className={styles.optional}>(необязательно)</span>
            </label>
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
                className={styles.input}
                placeholder="Иванович"
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={clsx(styles.input, {
                  [styles.inputError]: touched.email && errors.email,
                })}
                placeholder="example@mail.com"
              />
            </div>
            {touched.email && errors.email && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorText}
              >
                {errors.email}
              </motion.span>
            )}
          </div>

          {/* Дата рождения */}
          <div className={styles.field}>
            <label className={styles.label}>
              Дата рождения <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <FaCalendar className={styles.inputIcon} />
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                onBlur={() => handleBlur('birthDate')}
                className={clsx(styles.input, styles.inputDate, {
                  [styles.inputError]: touched.birthDate && errors.birthDate,
                })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            {touched.birthDate && errors.birthDate && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorText}
              >
                {errors.birthDate}
              </motion.span>
            )}
          </div>

          {/* Пол */}
          <div className={styles.field}>
            <label className={styles.label}>
              Пол <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <FaVenusMars className={styles.inputIcon} />
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                onBlur={() => handleBlur('gender')}
                className={clsx(styles.input, styles.select, {
                  [styles.inputError]: touched.gender && errors.gender,
                  [styles.selectPlaceholder]: !formData.gender,
                })}
              >
                <option value="" disabled>Выберите пол</option>
                <option value="Мужской">Мужской</option>
                <option value="Женский">Женский</option>
              </select>
            </div>
            {touched.gender && errors.gender && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorText}
              >
                {errors.gender}
              </motion.span>
            )}
          </div>

          {/* Телефон (необязательно) */}
          <div className={styles.field}>
            <label className={styles.label}>
              Номер телефона <span className={styles.optional}>(необязательно)</span>
            </label>
            <div className={styles.inputWrapper}>
              <FaPhone className={styles.inputIcon} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={clsx(styles.input, {
                  [styles.inputError]: touched.phone && errors.phone,
                })}
                placeholder="+7 (999) 999-99-99"
              />
            </div>
            {touched.phone && errors.phone && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorText}
              >
                {errors.phone}
              </motion.span>
            )}
          </div>

          {/* Чекбокс рассылки */}
          <div className={styles.checkboxWrapper}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={agreedToNewsletter}
                onChange={(e) => setAgreedToNewsletter(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxCustom}>
                {agreedToNewsletter && <FaCheckCircle className={styles.checkIcon} />}
              </span>
              <span className={styles.checkboxText}>
                Согласен получать рассылку на почту
              </span>
            </label>
          </div>

          {/* Кнопки */}
          <div className={styles.buttons}>
            <motion.button
              type="submit"
              disabled={!isFormValid()}
              className={clsx(styles.button, styles.buttonPrimary, {
                [styles.buttonDisabled]: !isFormValid(),
              })}
              whileTap={isFormValid() ? { scale: 0.98 } : {}}
            >
              Войти
            </motion.button>

            <motion.button
              type="button"
              onClick={handleGuestClick}
              className={clsx(styles.button, styles.buttonSecondary)}
              whileTap={{ scale: 0.98 }}
            >
              Остаться гостем
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserRegistrationForm;