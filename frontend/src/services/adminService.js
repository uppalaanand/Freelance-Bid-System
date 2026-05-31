import API from './api';

export const adminService = {
  getUsers: (params) => API.get('/admin/users', { params }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => API.put(`/admin/users/${id}/toggle-status`),
  getProjects: (params) => API.get('/admin/projects', { params }),
  deleteProject: (id) => API.delete(`/admin/projects/${id}`),
  getPayments: (params) => API.get('/admin/payments', { params }),
  getStats: () => API.get('/admin/stats'),
  getCategories: () => API.get('/admin/categories'),
  createCategory: (data) => API.post('/admin/categories', data),
  updateCategory: (id, data) => API.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),
};

export default adminService;
