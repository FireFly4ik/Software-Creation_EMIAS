import './App.css';
import { useEffect, useState } from 'react';
import OnboardingPage from './pages/OnboardingPage';
import MainPage from './pages/MainPage';
import { useTelegram } from './hooks/useTelegram';
import UserRegistrationForm from "./pages/UserRegistrationForm";
import useApi from "./hooks/useApi.js";

function App() {
  const [tab, setTab] = useState(0);
  const { tg } = useTelegram();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const api = useApi();

  const mapProfileFromBackend = (backendProfile) => {
    return {
      id: backendProfile.id,
      firstName: backendProfile.first_name,
      lastName: backendProfile.surname,
      middleName: backendProfile.middle_name,
      email: backendProfile.email,
      phone: backendProfile.phone,
      birthDate: backendProfile.birth_date,
      gender: backendProfile.gender,
      role: backendProfile.role,
    };
  };

  useEffect(() => {
    tg?.ready();
    tg?.expand();

    const initializeApp = async () => {
      try {
        setIsLoading(true);

        if (!tg.initData) {
          alert('Приложение должно быть запущено через Telegram');
          setIsLoading(false);
          return;
        }

        const authData = await api.loginTelegram(tg.initData);

        try {
          const profile = await api.getProfile();

          if (!profile.first_name || !profile.email) {
            setTab(0);
            setIsLoading(false);
            return;
          }

          const mappedProfile = mapProfileFromBackend(profile);
          setProfileData(mappedProfile);
          setIsAuthorized(mappedProfile.role !== 'guest');

          try {
            const userAppointments = await api.getMyAppointments();
            setAppointments(userAppointments || []);
          } catch (appointmentsError) {
            setAppointments([]);
          }

          setTab(2);
        } catch (profileError) {
          setTab(0);
        }
      } catch (error) {
        alert('Ошибка авторизации. Попробуйте перезапустить приложение.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [tg]);

  const handleOnSubmit = async (submissionData) => {
    try {

      const verifyData = {
        first_name: submissionData.firstName,
        surname: submissionData.lastName,
        middle_name: submissionData.middleName,
        phone: submissionData.phone,
        email: submissionData.email,
        birth_date: submissionData.birthDate,
        gender: submissionData.gender,
      };

      const result = await api.verifyAccount(verifyData);

      const profile = await api.getProfile();

      const mappedProfile = mapProfileFromBackend(profile);
      setProfileData(mappedProfile);
      setIsAuthorized(mappedProfile.role !== 'guest');

      try {
        const userAppointments = await api.getMyAppointments();
        setAppointments(userAppointments || []);
      } catch (error) {
        setAppointments([]);
      }

      setTab(2);
    } catch (error) {
      alert('Произошла ошибка при регистрации. Попробуйте снова.');
    }
  };

  const handleOnGuest = () => {
    setIsAuthorized(false);
    setProfileData({ role: 'guest' });
    setAppointments([]);
    setTab(2);
  };

  const handleLoginClick = () => {
    setTab(1);
  };

  const handleProfileUpdate = async (updatedData) => {
    try {

      const updateData = {
        first_name: updatedData.firstName,
        surname: updatedData.lastName,
        middle_name: updatedData.middleName,
        phone: updatedData.phone,
        email: updatedData.email,
        birth_date: updatedData.birthDate,
        gender: updatedData.gender,
      };

      const result = await api.updateProfile(updateData);

      const profile = await api.getProfile();
      const mappedProfile = mapProfileFromBackend(profile);
      setProfileData(mappedProfile);

      alert('Профиль успешно обновлён!');
    } catch (error) {
      alert('Произошла ошибка при обновлении профиля. Попробуйте снова.');
    }
  };

  const handleRoleChange = async (newRole) => {
    try {

      if (newRole === 'admin') {
        await api.becomeAdmin();
      } else {
        await api.stopBeingAdmin();
      }

      const profile = await api.getProfile();

      const mappedProfile = mapProfileFromBackend(profile);
      setProfileData(mappedProfile);
      setIsAuthorized(mappedProfile.role !== 'guest');

      alert(`Роль успешно изменена на: ${newRole === 'admin' ? 'Администратор' : 'Пользователь'}`);
    } catch (error) {
      alert('Произошла ошибка при изменении роли. Попробуйте снова.');
    }
  };

  const handleAppointmentAdd = async (appointmentData) => {
    try {

      const createData = {
        doctor_id: appointmentData.doctor_id,
        date: appointmentData.date,
        slot_index: appointmentData.slot_index,
      };

      const createdAppointment = await api.createAppointment(createData);

      const userAppointments = await api.getMyAppointments();
      setAppointments(userAppointments || []);

    } catch (error) {
      alert('Произошла ошибка при добавлении записи. Попробуйте снова.');
    }
  };

  if (isLoading || api.loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#F5F7FA'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6B7280'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#2563EB',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Загрузка...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {tab === 0 && <OnboardingPage onComplete={() => setTab(1)} />}
      {tab === 1 && (
        <UserRegistrationForm
          onGuest={handleOnGuest}
          onSubmit={handleOnSubmit}
        />
      )}
      {tab === 2 && (
        <MainPage
          PROFILE_DATA={profileData}
          isAutorized={isAuthorized}
          onLoginClick={handleLoginClick}
          onProfileUpdate={handleProfileUpdate}
          onRoleChange={handleRoleChange}
          appointments={appointments}
          onAppointmentAdd={handleAppointmentAdd}
          userRole={profileData?.role}
        />
      )}
    </>
  );
}

export default App;