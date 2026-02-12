import React, { useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import clsx from 'clsx';
import styles from './OnboardingPage.module.css';

const slides = [
    {
        id: 1,
        title: 'Забота о здоровье начинается здесь',
        animationPath: '/animations/health-care.json',
    },
    {
        id: 2,
        title: 'Профессиональная диагностика без очередей',
        animationPath: '/animations/diagnostics.json',
    },
    {
        id: 3,
        title: 'Ваше время — наш приоритет',
        animationPath: '/animations/time-priority.json',
    },
];

const OnboardingPage = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(1);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setDirection(1);
            setCurrentSlide(prev => prev + 1);
        }
    };

    const handleScreenClick = (e) => {
        if (e.target.closest('button')) return;
        handleNext();
    };

    const slideVariants = {
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
        <div className={styles.container} onClick={handleScreenClick}>
            <div className={styles.content}>
                <div className={styles.slidesWrapper}>
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentSlide}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            className={styles.slide}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className={styles.animationContainer}
                            >
                                <Player
                                    autoplay
                                    loop
                                    src={slides[currentSlide].animationPath}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </motion.div>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className={styles.title}
                            >
                                {slides[currentSlide].title}
                            </motion.h2>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className={styles.pagination}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={clsx(styles.dot, {
                                [styles.dotActive]: index === currentSlide,
                            })}
                            onClick={(e) => {
                                e.stopPropagation();
                                setDirection(index > currentSlide ? 1 : -1);
                                setCurrentSlide(index);
                            }}
                            aria-label={`Перейти к слайду ${index + 1}`}
                        />
                    ))}
                </div>

                {currentSlide === slides.length - 1 && (
                    <motion.button
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={styles.startButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onComplete(1);
                        }}
                    >
                        Начать
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default OnboardingPage;