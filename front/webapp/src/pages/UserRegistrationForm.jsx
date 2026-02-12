import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaUserShield
} from 'react-icons/fa';
import styles from './UserRegistrationForm.module.css';

const UserRegistrationForm = ({ onSubmit, onGuest }) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    phone: '',
  });

  const [agreedToNewsletter, setAgreedToNewsletter] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

    return newErrors;
  };

  const isFormValid = () => {
    const newErrors = validateForm();
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
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
                onChange={(e) => handleChange('phone', e.target.value)}
                className={styles.input}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
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