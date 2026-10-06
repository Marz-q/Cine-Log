import api from './api';

export const listService = {
  async getPublicLists() {
    const res = await api.get('/lists');
    return res.data;
  },

  async getMyLists() {
    const res = await api.get('/lists/my');
    return res.data;
  },

  async getListById(id) {
    const res = await api.get(`/lists/${id}`);
    return res.data;
  },

  async createList(data) {
    const res = await api.post('/lists', data);
    return res.data;
  },

  async addMovieToList(listId, movieData) {
    const res = await api.post(`/lists/${listId}/movies`, movieData);
    return res.data;
  },

  async removeMovieFromList(listId, tmdbId) {
    await api.delete(`/lists/${listId}/movies/${tmdbId}`);
  },

  async deleteList(id) {
    await api.delete(`/lists/${id}`);
  },
};
