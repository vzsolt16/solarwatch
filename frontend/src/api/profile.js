import { request } from './client';

export const profileApi = {
  getProfile: () => request('/api/profile'),

  updateFavoriteCity: (city) => request('/api/profile/favorite-city', {
    method: 'PUT',
    body: { city },
  }),

  deleteFavoriteCity: () => request('/api/profile/favorite-city', {
    method: 'DELETE',
  }),
};
