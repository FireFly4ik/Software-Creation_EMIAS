import { motion } from 'framer-motion';
import { FaUserMd, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import styles from './AdminDoctorSelectPage.module.css';

const AdminDoctorSelectPage = ({ doctors = [], onSelectDoctor, onBack }) => {
  const formatDoctorName = (doctor) => {
    const firstInitial = doctor.first_name ? doctor.first_name.charAt(0) + '.' : '';
    const middleInitial = doctor.middle_name ? doctor.middle_name.charAt(0) + '.' : '';
    return `${doctor.surname} ${firstInitial} ${middleInitial}`;
  };

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <div className={styles.header}>
        <h1 className={styles.title}>Управление записями</h1>
      </div>

      {/* Список врачей */}
      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <FaUserMd className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Врачи</h2>
        </div>

        <div className={styles.doctorsList}>
          {doctors.length === 0 ? (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaUserMd className={styles.emptyIcon} />
              <p className={styles.emptyText}>Нет доступных врачей</p>
            </motion.div>
          ) : (
            doctors.map((doctor, index) => (
              <motion.button
                key={doctor.id}
                className={styles.doctorCard}
                onClick={() => onSelectDoctor(doctor)}
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
                  <span className={styles.doctorName}>
                    {formatDoctorName(doctor)}
                  </span>
                  <span className={styles.doctorSpecialty}>
                    {doctor.description}
                  </span>
                </div>
                <FaChevronRight className={styles.chevronIcon} />
              </motion.button>
            ))
          )}
        </div>
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

export default AdminDoctorSelectPage;