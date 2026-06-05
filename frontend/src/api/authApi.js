import { apiRequest } from './client.js';

export const authApi = {
  register(payload) {
    return apiRequest('/auth/register', { method: 'POST', body: payload });
  },
  login(payload) {
    return apiRequest('/auth/login', { method: 'POST', body: payload });
  },
  me() {
    return apiRequest('/auth/me');
  },
  logout() {
    return apiRequest('/auth/logout', { method: 'POST' });
  }
};
