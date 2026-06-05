import { apiRequest } from './client.js';

export const orderApi = {
  list() {
    return apiRequest('/orders');
  },
  get(id) {
    return apiRequest(`/orders/${id}`);
  },
  confirmation(sessionId) {
    return apiRequest(`/orders/confirmation/${encodeURIComponent(sessionId)}`);
  }
};
