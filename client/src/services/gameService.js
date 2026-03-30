import api from '/api';

export const gameService = {
  // Получить вопрос
  getQuestion: async (mode) => {
    const response = await api.get(`/game/question/${mode}`);
    return response.data;
  },

  // Сохранить результат
  saveResult: async (data) => {
    const response = await api.post('/game/save', data);
    return response.data;
  },

  // Получить статистику
  getStats: async (userId) => {
    const response = await api.get(`/game/stats/${userId}`);
    return response.data;
  },

  // Получить таблицу лидеров
  getLeaderboard: async () => {
    const response = await api.get('/game/leaderboard');
    return response.data;
  }
};
