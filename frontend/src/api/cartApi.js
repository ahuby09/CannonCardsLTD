import { apiRequest } from './client.js';

export const cartApi = {
  get() {
    return apiRequest('/cart');
  },
  add(productId, quantity = 1) {
    return apiRequest('/cart/items', {
      method: 'POST',
      body: { product_id: productId, quantity }
    });
  },
  update(itemId, quantity) {
    return apiRequest(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: { quantity }
    });
  },
  remove(itemId) {
    return apiRequest(`/cart/items/${itemId}`, { method: 'DELETE' });
  },
  clear() {
    return apiRequest('/cart', { method: 'DELETE' });
  }
};
