import { apiRequest } from './client.js';

export const uploadApi = {
  productImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return apiRequest('/admin/uploads/product-image', {
      method: 'POST',
      body: formData
    });
  },
  productImages(files) {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));

    return apiRequest('/admin/uploads/product-images', {
      method: 'POST',
      body: formData
    });
  }
};
