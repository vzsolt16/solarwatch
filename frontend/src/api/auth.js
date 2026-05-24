import { request } from './client';

export const authApi = {
  register: (userData) => request('/Auth/Register', {
    method: 'POST',
    body: userData,
  }),
  
  login: (credentials) => request('/Auth/Login', {
    method: 'POST',
    body: credentials,
  }),

  logout: () => request('/Auth/Logout', {
    method: 'POST'
  }),
};
