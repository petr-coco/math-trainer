import api from './api';

export const authService = {
  // Гостевой вход
  guestLogin: async () => {
    const response = await api.post('/auth/guest');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Регистрация
  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Вход
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Выход
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Получить текущего пользователя
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Получить профиль
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};
