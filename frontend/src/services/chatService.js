import API from './api';

export const chatService = {
  getChats: () => API.get('/chat'),
  createChat: (data) => API.post('/chat', data),
  getMessages: (chatId) => API.get(`/chat/${chatId}/messages`),
  sendMessage: (chatId, data) => API.post(`/chat/${chatId}/messages`, data),
};

export default chatService;
