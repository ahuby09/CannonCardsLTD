import { apiRequest } from './client.js';

export const checkoutApi = {
  rates(address) {
    return apiRequest('/shipping/rates', {
      method: 'POST',
      body: { address }
    });
  },
  digitalOrder(contact) {
    return apiRequest('/checkout/digital-order', {
      method: 'POST',
      body: { contact }
    });
  },
  createSession(orderId, shippingRateId) {
    return apiRequest('/checkout/create-session', {
      method: 'POST',
      body: {
        order_id: orderId,
        shipping_rate_id: shippingRateId
      }
    });
  }
};
