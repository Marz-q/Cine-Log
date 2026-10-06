import api from './api';

export const movieService = {
  async getPopular() {
    const res = await api.get('/movies/popular');
    return res.data;
  },

  async getTrending() {
    const res = await api.get('/movies/trending');
    return res.data;
  },

  async getRecent() {
    const res = await api.get('/movies/recent');
    return res.data;
  },

  async searchMovies(query) {
    const res = await api.get(`/movies/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  async getByGenre(genre) {
    const res = await api.get(`/movies/genre/${encodeURIComponent(genre)}`);
    return res.data;
  },

  async getGenres() {
    const res = await api.get('/movies/genres');
    return res.data;
  },

  async getMovieDetails(tmdbId) {
    const res = await api.get(`/movies/${tmdbId}`);
    return res.data;
  },

  async getRecommendations() {
    const res = await api.get('/recommendations');
    return res.data;
  },

  async getTasteProfile() {
    const res = await api.get('/recommendations/taste-profile');
    return res.data;
  },
};
