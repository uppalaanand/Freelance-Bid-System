import API from './api';

export const reviewService = {
  createReview: (data) => API.post('/reviews', data),
  getStudentReviews: (studentId) => API.get(`/reviews/student/${studentId}`),
  getProjectReview: (projectId) => API.get(`/reviews/project/${projectId}`),
};

export default reviewService;
