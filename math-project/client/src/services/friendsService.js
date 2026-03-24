import api from '/api';

export const friendsService = {
  // Отправить заявку
  sendRequest: async (friendName) => {
    const response = await api.post('/friends/request', { friendName });
    return response.data;
  },

  // Принять заявку
  acceptRequest: async (requestId) => {
    const response = await api.post(`/friends/accept/${requestId}`);
    return response.data;
  },

  // Отклонить заявку
  rejectRequest: async (requestId) => {
    const response = await api.post(`/friends/reject/${requestId}`);
    return response.data;
  },

  // Получить заявки
  getRequests: async () => {
    const response = await api.get('/friends/requests');
    return response.data;
  },

  // Получить список друзей
  getFriends: async () => {
    const response = await api.get('/friends/list');
    return response.data;
  },

  // Удалить друга
  removeFriend: async (friendId) => {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  }
};
