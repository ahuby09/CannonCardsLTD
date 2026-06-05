const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? 'https://cannoncardsltd.onrender.com/api'
  : 'http://localhost:4000/api';

export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const TOKEN_KEY = 'pokemon_store_token';
const CART_TOKEN_KEY = 'pokemon_store_cart_token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getCartToken() {
  let token = localStorage.getItem(CART_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(CART_TOKEN_KEY, token);
  }

  return token;
}

export function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('/api/') || url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
}

export async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  headers['X-Cart-Token'] = getCartToken();

  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with ${response.status}`);
    error.details = data?.details;
    error.code = data?.code;
    throw error;
  }

  return data;
}
