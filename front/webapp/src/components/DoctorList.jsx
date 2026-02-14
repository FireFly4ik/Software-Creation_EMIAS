import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
import styles from './DoctorList.module.css';

const DoctorList = ({ categories, onDoctorClick }) => {
  return (
    <>
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className={styles.section}>
          <h2 className={styles.sectionTitle}>{category.category}</h2>
          <div className={styles.doctorsList}>
            {category.items.map((doctor) => {
              const IconComponent = doctor.icon;
              return (
                <motion.button
                  key={doctor.id}
                  className={styles.doctorCard}
                  onClick={() => onDoctorClick(doctor)}
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
    </>
  );
};

export default DoctorList;