import api from './api';

export const reviewService = {
  async getMovieReviews(tmdbId) {
    const res = await api.get(`/reviews/movie/${tmdbId}`);
    return res.data;
  },

  async createReview(data) {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  async updateReview(id, data) {
    const res = await api.put(`/reviews/${id}`, data);
    return res.data;
  },

  async deleteReview(id) {
    await api.delete(`/reviews/${id}`);
  },

  async toggleLike(id) {
    const res = await api.post(`/reviews/${id}/like`);
    return res.data;
  },

  async getComments(reviewId) {
    const res = await api.get(`/reviews/${reviewId}/comments`);
    return res.data;
  },

  async addComment(reviewId, commentText) {
    const res = await api.post(`/reviews/${reviewId}/comments`, { commentText });
    return res.data;
  },

  async rateMovie(data) {
    const res = await api.post('/ratings', data);
    return res.data;
  },

  async deleteRating(tmdbId) {
    await api.delete(`/ratings/${tmdbId}`);
  },
};
