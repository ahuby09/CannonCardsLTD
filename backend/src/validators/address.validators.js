import { badRequest } from '../utils/errors.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}

export function validateAddressPayload(payload) {
  const country = clean(payload.country || 'GB').toUpperCase();
  const address = {
    full_name: clean(payload.full_name || payload.name),
    email: clean(payload.email),
    phone: clean(payload.phone),
    street1: clean(payload.street1),
    street2: clean(payload.street2),
    city: clean(payload.city),
    state: clean(payload.state),
    postal_code: clean(payload.postal_code || payload.zip),
    country: country === 'UK' ? 'GB' : country
  };

  const missing = Object.entries(address)
    .filter(([key, value]) => ['full_name', 'email', 'street1', 'city', 'postal_code', 'country'].includes(key) && !value)
    .map(([key]) => key);

  if (missing.length) {
    throw badRequest(`Missing delivery address fields: ${missing.join(', ')}`);
  }

  if (!EMAIL_REGEX.test(address.email)) {
    throw badRequest('A valid delivery email is required');
  }

  if (address.country.length !== 2) {
    throw badRequest('country must be a two-letter country code');
  }

  if (address.country !== 'GB') {
    throw badRequest('We currently only ship to UK addresses');
  }

  return address;
}
