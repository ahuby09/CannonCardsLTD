import { badRequest } from '../utils/errors.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterPayload(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const fullName = String(payload.full_name || payload.fullName || '').trim();

  if (!EMAIL_REGEX.test(email)) {
    throw badRequest('A valid email is required');
  }

  if (password.length < 8) {
    throw badRequest('Password must be at least 8 characters');
  }

  if (!fullName) {
    throw badRequest('full_name is required');
  }

  return { email, password, full_name: fullName };
}

export function validateLoginPayload(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  if (!EMAIL_REGEX.test(email) || !password) {
    throw badRequest('Email and password are required');
  }

  return { email, password };
}
