import { apiRequest } from './client.js';

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

export const productApi = {
  list(params) {
    return apiRequest(`/products${toQuery(params)}`);
  },
  get(id) {
    return apiRequest(`/products/${id}`);
  }
};

export const adminProductApi = {
  list(params) {
    return apiRequest(`/admin/products${toQuery(params)}`);
  },
  get(id) {
    return apiRequest(`/admin/products/${id}`);
  },
  create(payload) {
    return apiRequest('/admin/products', { method: 'POST', body: payload });
  },
  update(id, payload) {
    return apiRequest(`/admin/products/${id}`, { method: 'PUT', body: payload });
  },
  remove(id) {
    return apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
  },
  updateInventory(id, payload) {
    return apiRequest(`/admin/products/${id}/inventory`, { method: 'PATCH', body: payload });
  }
};
