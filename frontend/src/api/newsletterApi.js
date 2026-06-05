import { apiRequest } from './client.js';

export const newsletterApi = {
  subscribe(payload) {
    return apiRequest('/newsletter/subscribe', {
      method: 'POST',
      body: payload
    });
  }
};
