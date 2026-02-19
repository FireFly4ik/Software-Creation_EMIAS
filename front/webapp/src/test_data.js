
/*
export const userData = {
  id: 123123123,
  lastName: 'Змеев',
  firstName: 'Илья',
  middleName: 'Викторович',
  email: 'poovvroi@gmail.com',
  phone: '+7 (999) 123-45-67',
  birthDate: '2000-01-15',
  gender: 'Мужской',
  role: 'user', // 'guest', 'user', 'admin'
};*/
export const userData = undefined

export const ALL_DOCTORS = [
  { id: 1, lastName: 'Петров', firstName: 'Алексей', middleName: 'Сергеевич', desc: 'Дежурный врач ОРВИ', specialty: 'covid-doctor' },
  { id: 2, lastName: 'Сидорова', firstName: 'Мария', middleName: 'Ивановна', desc: 'Дежурный врач ОРВИ', specialty: 'covid-doctor' },
  { id: 3, lastName: 'Иванов', firstName: 'Иван', middleName: 'Иванович', desc: 'Терапевт', specialty: 'therapist' },
  { id: 4, lastName: 'Кузнецова', firstName: 'Анна', middleName: 'Петровна', desc: 'Терапевт', specialty: 'therapist' },
  { id: 5, lastName: 'Смирнов', firstName: 'Дмитрий', middleName: 'Александрович', desc: 'Терапевт', specialty: 'therapist' },
  { id: 6, lastName: 'Волкова', firstName: 'Елена', middleName: 'Викторовна', desc: 'Участковый врач', specialty: 'district-doctor' },
  { id: 7, lastName: 'Морозов', firstName: 'Сергей', middleName: 'Николаевич', desc: 'Участковый врач', specialty: 'district-doctor' },
  { id: 8, lastName: 'Соколов', firstName: 'Михаил', middleName: 'Владимирович', desc: 'Хирург', specialty: 'surgeon' },
  { id: 9, lastName: 'Новикова', firstName: 'Ольга', middleName: 'Андреевна', desc: 'Хирург', specialty: 'surgeon' },
  { id: 10, lastName: 'Лебедев', firstName: 'Константин', middleName: 'Юрьевич', desc: 'Офтальмолог', specialty: 'ophthalmologist' },
  { id: 11, lastName: 'Павлова', firstName: 'Татьяна', middleName: 'Сергеевна', desc: 'Оториноларинголог', specialty: 'otorhinolaryngologist' },
  { id: 12, lastName: 'Федоров', firstName: 'Андрей', middleName: 'Павлович', desc: 'Уролог', specialty: 'urologist' },
  { id: 13, lastName: 'Егорова', firstName: 'Наталья', middleName: 'Владимировна', desc: 'Выдача справок и направлений', specialty: 'certificates' },
  { id: 14, lastName: 'Козлов', firstName: 'Владислав', middleName: 'Игоревич', desc: 'Диспансеризация', specialty: 'dispensary' },
  { id: 15, lastName: 'Романова', firstName: 'Светлана', middleName: 'Дмитриевна', desc: 'Диспансеризация', specialty: 'dispensary' },
  { id: 16, lastName: 'Зайцева', firstName: 'Ирина', middleName: 'Алексеевна', desc: 'Вакцинация', specialty: 'vaccination' },
];

export const DOCTOR_SCHEDULES = {
  1: {
    '2025-02-20': [1, 8, 9, 13, 20],
    '2025-02-21': [0, 5, 10, 15, 25],
    '2025-02-22': [2, 7, 12, 18, 23],
  },
  2: {
    '2025-02-20': [3, 6, 11, 16, 21],
    '2025-02-21': [1, 4, 9, 14, 19],
  },
  3: {
    '2025-02-20': [3, 6, 11, 16, 21],
    '2025-02-21': [1, 4, 9, 14, 19],
    '2025-02-24': [0, 5, 10, 15, 20, 25],
  },
  4: {
    '2025-02-20': [2, 5, 8, 12, 17],
    '2025-02-22': [0, 6, 11, 16, 22],
  },
  5: {
    '2025-02-21': [4, 7, 10, 14, 19, 24],
    '2025-02-23': [1, 6, 11, 16, 21],
  },
};