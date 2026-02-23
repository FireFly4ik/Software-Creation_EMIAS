import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaUserMd, FaSave } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './AddDoctorPage.module.css';

const SPECIALTIES = [
  { id: 'covid-doctor', value: 'Дежурный врач ОРВИ', name: 'Дежурный врач ОРВИ' },
  { id: 'district-doctor', value: 'Участковый врач', name: 'Участковый врач' },
  { id: 'therapist', value: 'Терапевт', name: 'Терапевт' },
  { id: 'certificates', value: 'Кабинет выдачи справок и направлений', name: 'Кабинет выдачи справок и направлений' },
  { id: 'surgeon', value: 'Хирург', name: 'Хирург' },
  { id: 'ophthalmologist', value: 'Офтальмолог', name: 'Офтальмолог' },
  { id: 'otorhinolaryngologist', value: 'Оториноларинголог', name: 'Оториноларинголог' },
  { id: 'urologist', value: 'Уролог', name: 'Уролог' },
  { id: 'dispensary', value: 'Диспансеризация/Профилактический осмотр', name: 'Диспансеризация/Профилактический осмотр' },
  { id: 'vaccination', value: 'Кабинет вакцинации', name: 'Кабинет вакцинации' },
];

const AddDoctorPage = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    specialty: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Обязательное поле';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Обязательное поле';
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Обязательное поле';
    }

    return newErrors;
  };

  const isFormValid = () => {
    const newErrors = validateForm();
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        lastName: true,
        firstName: true,
        specialty: true
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const doctorData = {
        surname: formData.lastName,
        first_name: formData.firstName,
        middle_name: formData.middleName || "",
        specialization: formData.specialty,
        description: formData.specialty,
      };


      await onSave?.(doctorData);

      setFormData({
        lastName: '',
        firstName: '',
        middleName: '',
        specialty: ''
      });
      setTouched({});
      setErrors({});

    } catch (error) {
      alert(`Произошла ошибка: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FaUserMd className={styles.headerIcon} />
          <h1 className={styles.title}>Добавить врача</h1>
        </div>
      </div>

      {/* Форма */}
      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Специальность */}
          <div className={styles.field}>
            <label className={styles.label}>
              Специальность <span className={styles.required}>*</span>
            </label>
            <select
              value={formData.specialty}
              onChange={(e) => handleInputChange('specialty', e.target.value)}
              onBlur={() => handleBlur('specialty')}
              disabled={isSubmitting}
              className={clsx(styles.select, {
                [styles.inputError]: touched.specialty && errors.specialty,
                [styles.selectPlaceholder]: !formData.specialty
              })}
            >
              <option value="">Выберите специальность</option>
              {SPECIALTIES.map(specialty => (
                <option key={specialty.id} value={specialty.value}>
                  {specialty.name}
                </option>
              ))}
            </select>
            {touched.specialty && errors.specialty && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorText}
              >
                {errors.specialty}
              </motion.span>
            )}
          </div>

          {/* Фамилия */}
          <div className={styles.field}>
            <label className={styles.label}>
              Фамилия <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              disabled={isSubmitting}
              className={clsx(styles.input, {
                [styles.inputError]: touched.lastName && errors.lastName
              })}
              placeholder="Иванов"
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
          </div>

          {/* Имя */}
          <div className={styles.field}>
            <label className={styles.label}>
              Имя <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              disabled={isSubmitting}
              className={clsx(styles.input, {
                [styles.inputError]: touched.firstName && errors.firstName
              })}
              placeholder="Иван"
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
          </div>

          {/* Отчество */}
          <div className={styles.field}>
            <label className={styles.label}>
              Отчество <span className={styles.optional}>(необязательно)</span>
            </label>
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => handleInputChange('middleName', e.target.value)}
              disabled={isSubmitting}
              className={styles.input}
              placeholder="Иванович"
            />
          </div>

          {/* Кнопка сохранения */}
          <motion.button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={clsx(styles.submitButton, {
              [styles.buttonDisabled]: !isFormValid() || isSubmitting
            })}
            whileHover={isFormValid() && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={isFormValid() && !isSubmitting ? { scale: 0.98 } : {}}
          >
            <FaSave className={styles.buttonIcon} />
            {isSubmitting ? 'Добавление...' : 'Добавить врача'}
          </motion.button>
        </form>
      </div>

      {/* Плавающая кнопка возврата */}
      <motion.button
        className={styles.backButton}
        onClick={onBack}
        disabled={isSubmitting}
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

export default AddDoctorPage;