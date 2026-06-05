import { badRequest } from '../utils/errors.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateNewsletterPayload(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const fullName = String(payload.full_name || payload.fullName || '').trim();
  const source = String(payload.source || 'homepage').trim().slice(0, 120);

  if (!EMAIL_REGEX.test(email)) {
    throw badRequest('A valid email address is required');
  }

  return {
    email,
    full_name: fullName || null,
    source: source || 'homepage',
    marketing_consent: payload.marketing_consent !== false
  };
}
