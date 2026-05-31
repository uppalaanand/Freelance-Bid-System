import API from './api';

export const projectService = {
  getProjects: (params) => API.get('/projects', { params }),
  getProject: (id) => API.get(`/projects/${id}`),
  createProject: (data) => API.post('/projects', data),
  updateProject: (id, data) => API.put(`/projects/${id}`, data),
  deleteProject: (id) => API.delete(`/projects/${id}`),
  getMyProjects: () => API.get('/projects/my-projects'),
  assignStudent: (projectId, studentId) => API.put(`/projects/${projectId}/assign/${studentId}`),
  getAssignedProjects: () => API.get('/projects/assigned'),
  completeProject: (id) => API.put(`/projects/${id}/complete`),
};

export default projectService;
