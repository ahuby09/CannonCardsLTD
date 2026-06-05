import { apiRequest } from './client.js';

export const adminApi = {
  searchPokeWallet(query) {
    return apiRequest(`/admin/pokewallet/search?q=${encodeURIComponent(query)}`);
  },
  listOrders() {
    return apiRequest('/admin/orders');
  },
  getOrder(id) {
    return apiRequest(`/admin/orders/${id}`);
  },
  generateLabel(id) {
    return apiRequest(`/admin/orders/${id}/shippo/label`, { method: 'POST' });
  },
  markPaidForTesting(id) {
    return apiRequest(`/admin/orders/${id}/test-mark-paid`, { method: 'PATCH' });
  },
  updateOrderStatus(id, payload) {
    return apiRequest(`/admin/orders/${id}/status`, { method: 'PATCH', body: payload });
  },
  deleteOrder(id) {
    return apiRequest(`/admin/orders/${id}`, { method: 'DELETE' });
  }
};
