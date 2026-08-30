import API from './api';

export const reviewService = {
  createReview: (data) => API.post('/reviews', data),
  getWorkerReviews: (workerId, params) =>
    API.get(`/reviews/worker/${workerId}`, { params }),
  replyToReview: (reviewId, reply) =>
    API.post(`/reviews/${reviewId}/reply`, { reply }),
};

export default reviewService;
