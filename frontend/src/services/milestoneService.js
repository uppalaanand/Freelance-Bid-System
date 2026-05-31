import API from './api';

export const milestoneService = {
  getProjectMilestones: (projectId) => API.get(`/milestones/project/${projectId}`),
  createMilestone: (data) => API.post('/milestones', data),
  updateMilestone: (id, data) => API.put(`/milestones/${id}`, data),
  submitMilestone: (id, data) => API.put(`/milestones/${id}/submit`, data),
  approveMilestone: (id) => API.put(`/milestones/${id}/approve`),
};

export default milestoneService;
