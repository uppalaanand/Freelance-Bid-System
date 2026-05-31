import API from './api';

export const bidService = {
  submitBid: (data) => API.post('/bids', data),
  getProjectBids: (projectId) => API.get(`/bids/project/${projectId}`),
  getMyBids: () => API.get('/bids/my-bids'),
  acceptBid: (id) => API.put(`/bids/${id}/accept`),
  rejectBid: (id) => API.put(`/bids/${id}/reject`),
  withdrawBid: (id) => API.put(`/bids/${id}/withdraw`),
};

export default bidService;
