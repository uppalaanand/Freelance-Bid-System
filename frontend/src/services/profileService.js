import API from './api';

export const profileService = {
  getStudentProfile: () => API.get('/profiles/student'),
  getStudentProfileById: (id) => API.get(`/profiles/student/${id}`),
  updateStudentProfile: (data) => API.put('/profiles/student', data),
  getClientProfile: () => API.get('/profiles/client'),
  getClientProfileById: (id) => API.get(`/profiles/client/${id}`),
  updateClientProfile: (data) => API.put('/profiles/client', data),
  uploadAvatar: (formData) => API.post('/profiles/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadResume: (formData) => API.post('/profiles/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getTopStudents: () => API.get('/profiles/top-students'),
};

export default profileService;
