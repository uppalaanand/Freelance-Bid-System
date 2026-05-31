import API from './api';

export const paymentService = {
  createOrder: (data) => API.post('/payments/create-order', data),
  verifyPayment: (data) => API.post('/payments/verify', data),
  getProjectPayments: (projectId) => API.get(`/payments/project/${projectId}`),
  releasePayment: (id) => API.put(`/payments/${id}/release`),
  getMyEarnings: () => API.get('/payments/my-earnings'),
  getMyPayments: () => API.get('/payments/my-payments'),
};

export default paymentService;
