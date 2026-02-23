import {useCallback, useState} from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        credentials: 'include',
      });

      if (!response.ok) {
        const isAuthEndpoint = endpoint.startsWith('/auth/');

        if (response.status === 401 && !options.skipRefresh && !isAuthEndpoint) {
          console.log('Токен протух, пытаемся обновить...');
          const refreshed = await refreshTokens();
          if (refreshed) {
            console.log('Токен обновлён, повторяем запрос');
            return request(endpoint, { ...options, skipRefresh: true });
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.error('[API] Ошибка:', errorData);
        console.error('[API] Полный ответ ошибки:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.detail || JSON.stringify(errorData) || `HTTP Error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
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

  const loginTelegram = useCallback(async (initData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${initData}`,
        },
        credentials: 'include',
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

  const refreshTokens = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
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

  const createDoctor = useCallback(async (doctorData) => {
    return await request('/doctor/', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }, [request]);

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

  const getDoctorById = useCallback(async (doctorId) => {
    return await request(`/doctor/${doctorId}`, { method: 'GET' });
  }, [request]);

  const updateDoctor = useCallback(async (doctorId, updateData) => {
    return await request(`/doctor/${doctorId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }, [request]);

  const deleteDoctor = useCallback(async (doctorId) => {
    return await request(`/doctor/${doctorId}`, { method: 'DELETE' });
  }, [request]);

  // ==================== PROFILE ====================

  const getProfile = useCallback(async () => {
    return await request('/profile/', { method: 'GET' });
  }, [request]);

  const updateProfile = useCallback(async (updateData) => {
    return await request('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }, [request]);

  const becomeAdmin = useCallback(async () => {
    return await request('/profile/become-admin', { method: 'PATCH' });
  }, [request]);

  const stopBeingAdmin = useCallback(async () => {
    return await request('/profile/stop-being-admin', { method: 'PATCH' });
  }, [request]);

  const getMyAppointments = useCallback(async (userId) => {
    return await request(`/profile/appointments?user_id=${userId}`, {
      method: 'GET'
    });
  }, [request]);

  const cancelAppointment = useCallback(async (appointmentId) => {
    return await request(`/profile/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
    });
  }, [request]);

  // ==================== APPOINTMENT ====================

  const createAppointment = useCallback(async (appointmentData) => {
    return await request('/appointment/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }, [request]);


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
    cancelAppointment,
    // Appointment
    createAppointment,
    getAppointments,
    changeAppointmentStatus,
  };
};

export default useApi;