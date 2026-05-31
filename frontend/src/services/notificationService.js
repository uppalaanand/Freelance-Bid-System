import API from './api';

export const notificationService = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  getUnreadCount: () => API.get('/notifications/unread-count'),
};

export default notificationService;
