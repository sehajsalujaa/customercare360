import axiosClient from './axiosClient';

export const notificationsApi = {
  // GET /notifications/me?sort=DESC
  // Returns notifications for logged-in user from token context
  getMine: (sort = 'DESC') =>
    axiosClient.get('/notifications/me', { params: { sort } }),

  // GET /notifications/user/{userId}?sort=DESC
  // Returns List<NotificationResponseDto>: {message, category, status, createdAt}
  getForUser: (userId, sort = 'DESC') =>
    userId ? axiosClient.get(`/notifications/user/${encodeURIComponent(userId)}`, { params: { sort } }) : axiosClient.get('/notifications/me', { params: { sort } }),

  // GET /notifications/unread-count/me
  getMyUnreadCount: () =>
    axiosClient.get('/notifications/unread-count/me'),

  // GET /notifications/unread-count/user/{userId} — returns long
  getUnreadCount: (userId) =>
    userId ? axiosClient.get(`/notifications/unread-count/user/${encodeURIComponent(userId)}`) : axiosClient.get('/notifications/unread-count/me'),

  // PUT /notifications/mark-read/me
  markMyRead: () => axiosClient.put('/notifications/mark-read/me'),

  // PUT /notifications/mark-read/user/{userId}
  markAllRead: (userId) => userId ? axiosClient.put(`/notifications/mark-read/user/${encodeURIComponent(userId)}`) : axiosClient.put('/notifications/mark-read/me'),

  // PUT /notifications/dismiss/{notificationId}
  dismiss: (notificationId) => axiosClient.put(`/notifications/dismiss/${notificationId}`),
};