import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Базовая функция для запросов
  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Важно для отправки cookies
      });

      if (!response.ok) {
        // Пытаемся обновить токены только если:
        // 1. Получили 401
        // 2. Это не первый запрос (skipRefresh)
        // 3. Это не auth эндпоинт
        const isAuthEndpoint = endpoint.startsWith('/auth/');

        if (response.status === 401 && !options.skipRefresh && !isAuthEndpoint) {
          console.log('Токен протух, пытаемся обновить...');
          const refreshed = await refreshTokens();
          if (refreshed) {
            console.log('Токен обновлён, повторяем запрос');
            // Повторяем запрос
            return request(endpoint, { ...options, skipRefresh: true });
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.error('[API] Ошибка:', errorData);
        console.error('[API] Полный ответ ошибки:', JSON.stringify(errorData, null, 2)); // ← ДОБАВИЛИ
        throw new Error(errorData.detail || JSON.stringify(errorData) || `HTTP Error: ${response.status}`); // ← ИЗМЕНИЛИ
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }

      return {};
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== AUTH ====================

  /**
   * Авторизация через Telegram
   * @param {string} initData - Telegram WebApp initData
   * @returns {Promise<{ msg: string }>}
   */
  const loginTelegram = useCallback(async (initData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${initData}`, // Специальный формат для Telegram
        },
        credentials: 'include', // Важно для получения cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response:', data);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Верификация аккаунта (первая регистрация)
   * @param {Object} userData - Данные пользователя
   * @param {string} userData.first_name - Имя
   * @param {string} userData.surname - Фамилия
   * @param {string} userData.middle_name - Отчество
   * @param {string} userData.phone - Телефон
   * @param {string} userData.email - Email
   * @param {string} userData.birth_date - Дата рождения (YYYY-MM-DD)
   * @param {string} userData.gender - Пол
   * @returns {Promise<Object>}
   */
  const verifyAccount = useCallback(async (userData) => {
    return await request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipRefresh: true, // Не пытаемся обновить токен при верификации
    });
  }, [request]);

  /**
   * Обновление токенов
   * @returns {Promise<boolean>}
   */
  const refreshTokens = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Отправляем refresh_token из cookies
      });

      if (!response.ok) {
        console.error('Refresh failed with status:', response.status);
        return false;
      }

      console.log('Tokens refreshed successfully');
      return true;
    } catch (err) {
      console.error('Refresh failed:', err);
      return false;
    }
  }, []);

  // ==================== DOCTOR ====================

  /**
   * Создание врача
   * @param {Object} doctorData - Данные врача
   * @param {string} doctorData.first_name - Имя
   * @param {string} doctorData.surname - Фамилия
   * @param {string} doctorData.middle_name - Отчество
   * @param {string} doctorData.specialization - Специализация (SpecializationEnum)
   * @param {string} doctorData.description - Описание
   * @returns {Promise<Object>} - Созданный врач
   */
  const createDoctor = useCallback(async (doctorData) => {
    return await request('/doctor/', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }, [request]);

  /**
   * Получение списка врачей с фильтрами
   * @param {Object} filters - Фильтры
   * @param {string} [filters.first_name] - Имя
   * @param {string} [filters.surname] - Фамилия
   * @param {string} [filters.middle_name] - Отчество
   * @param {string} [filters.specialization] - Специализация
   * @returns {Promise<Array>} - Список врачей
   */
  const getDoctors = useCallback(async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/doctor/?${queryString}` : '/doctor/';

    return await request(endpoint, { method: 'GET' });
  }, [request]);

  /**
   * Получение врача по ID
   * @param {number} doctorId - ID врача
   * @returns {Promise<Object>} - Данные врача
   */
  const getDoctorById = useCallback(async (doctorId) => {
    return await request(`/doctor/${doctorId}`, { method: 'GET' });
  }, [request]);

  /**
   * Обновление врача
   * @param {number} doctorId - ID врача
   * @param {Object} updateData - Данные для обновления
   * @param {string} [updateData.specialization] - Специализация
   * @param {string} [updateData.description] - Описание
   * @returns {Promise<Object>} - Обновлённый врач
   */
  const updateDoctor = useCallback(async (doctorId, updateData) => {
    return await request(`/doctor/${doctorId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }, [request]);

  /**
   * Удаление врача
   * @param {number} doctorId - ID врача
   * @returns {Promise<Object>}
   */
  const deleteDoctor = useCallback(async (doctorId) => {
    return await request(`/doctor/${doctorId}`, { method: 'DELETE' });
  }, [request]);

  // ==================== PROFILE ====================

  /**
   * Получение своего профиля
   * @returns {Promise<Object>} - Данные профиля
   */
  const getProfile = useCallback(async () => {
    return await request('/profile/', { method: 'GET' });
  }, [request]);

  /**
   * Обновление своего профиля
   * @param {Object} updateData - Данные для обновления
   * @param {string} [updateData.first_name] - Имя
   * @param {string} [updateData.surname] - Фамилия
   * @param {string} [updateData.middle_name] - Отчество
   * @param {string} [updateData.phone] - Телефон
   * @param {string} [updateData.email] - Email
   * @param {string} [updateData.birth_date] - Дата рождения (YYYY-MM-DD)
   * @param {string} [updateData.gender] - Пол
   * @returns {Promise<Object>} - Обновлённый профиль
   */
  const updateProfile = useCallback(async (updateData) => {
    return await request('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }, [request]);

  /**
   * Стать администратором
   * @returns {Promise<Object>}
   */
  const becomeAdmin = useCallback(async () => {
    return await request('/profile/become-admin', { method: 'PATCH' });
  }, [request]);

  /**
   * Перестать быть администратором
   * @returns {Promise<Object>}
   */
  const stopBeingAdmin = useCallback(async () => {
    return await request('/profile/stop-being-admin', { method: 'PATCH' });
  }, [request]);

  /**
   * Получение своих записей
   * @returns {Promise<Array>} - Список записей
   */
// ✅ Получить МОИ записи (текущего авторизованного пользователя)
  const getMyAppointments = useCallback(async (userId) => {
    return await request(`/profile/appointments?user_id=${userId}`, {
      method: 'GET'
    });
  }, [request]);
  /**
   * Отмена своей записи
   * @param {number} appointmentId - ID записи
   * @returns {Promise<Object>}
   */
  const cancelMyAppointment = useCallback(async (appointmentId) => {
    return await request(`/profile/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
    });
  }, [request]);

  // ==================== APPOINTMENT ====================

  /**
   * Создание записи к врачу
   * @param {Object} appointmentData - Данные записи
   * @param {number} appointmentData.doctor_id - ID врача
   * @param {string} appointmentData.date - Дата и время (YYYY-MM-DD HH:MM:SS)
   * @param {number} appointmentData.slot_index - Индекс слота
   * @returns {Promise<Object>} - Созданная запись
   */
  const createAppointment = useCallback(async (appointmentData) => {
    return await request('/appointment/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }, [request]);

  /**
   * Полу��ение списка записей с фильтрами (только для админов)
   * @param {Object} filters - Фильтры
   * @param {number} [filters.id] - ID записи
   * @param {number} [filters.user_id] - ID пользователя
   * @param {number} [filters.doctor_id] - ID врача
   * @param {string} [filters.status] - Статус (Запланировано/Завершено/Отменено)
   * @returns {Promise<Array>} - Список записей
   */
// ✅ Получить ВСЕ записи врача (всех пользователей) для блокировки слотов
  const getAppointments = useCallback(async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.doctor_id) {
      params.append('doctor_id', filters.doctor_id);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/appointment/?${queryString}` : '/appointment/';

    const response = await request(endpoint);
    return response;
  }, [request]);

  /**
   * Изменение статуса записи (только для админов)
   * @param {number} appointmentId - ID записи
   * @param {Object} statusData - Данные статуса
   * @param {string} statusData.status - Статус (Запланировано/Завершено/Отменено)
   * @returns {Promise<Object>}
   */
  const changeAppointmentStatus = useCallback(async (appointmentId, statusData) => {
    return await request(`/appointment/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }, [request]);

  return {
    loading,
    error,
    // Auth
    loginTelegram,
    verifyAccount,
    refreshTokens,
    // Doctor
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    // Profile
    getProfile,
    updateProfile,
    becomeAdmin,
    stopBeingAdmin,
    getMyAppointments,
    cancelMyAppointment,
    // Appointment
    createAppointment,
    getAppointments,
    changeAppointmentStatus,
  };
};

export default useApi;