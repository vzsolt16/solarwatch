import { request } from './client';

export const profileApi = {
  getProfile: (token) => request('/api/profile', { token }),

  updateFavoriteCity: (city, token) => request('/api/profile/favorite-city', {
    method: 'PUT',
    body: { city },
    token,
  }),

  deleteFavoriteCity: (token) => request('/api/profile/favorite-city', {
    method: 'DELETE',
    token,
  }),
};
