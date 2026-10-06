import api from './api';

export const userService = {
  async getProfile(username) {
    const res = await api.get(`/users/${username}`);
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  async getUserWatched(username) {
    const res = await api.get(`/users/${username}/watched`);
    return res.data;
  },

  async getUserWatchlist(username) {
    const res = await api.get(`/users/${username}/watchlist`);
    return res.data;
  },

  async getUserReviews(username) {
    const res = await api.get(`/users/${username}/reviews`);
    return res.data;
  },

  async getUserRatings(username) {
    const res = await api.get(`/users/${username}/ratings`);
    return res.data;
  },

  async getUserActivity(username) {
    const res = await api.get(`/users/${username}/activity`);
    return res.data;
  },

  async getUserLists(username) {
    const res = await api.get(`/users/${username}/lists`);
    return res.data;
  },

  async toggleWatchlist(movieData) {
    const res = await api.post('/watchlist/toggle', movieData);
    return res.data;
  },

  async toggleWatched(movieData) {
    const res = await api.post('/watched/toggle', movieData);
    return res.data;
  },

  async toggleFollow(username) {
    const res = await api.post(`/social/follow/${username}`);
    return res.data;
  },

  async getSocialFeed() {
    const res = await api.get('/social/feed');
    return res.data;
  },

  async getFollowers(username) {
    const res = await api.get(`/social/followers/${username}`);
    return res.data;
  },

  async getFollowing(username) {
    const res = await api.get(`/social/following/${username}`);
    return res.data;
  },
};
