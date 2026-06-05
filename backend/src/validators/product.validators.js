import { badRequest } from '../utils/errors.js';
import { generateSealedProductDescription, generateSingleCardDescription } from '../utils/descriptions.js';

export const PRODUCT_TYPES = ['single_card', 'sealed_product', 'code_card'];
export const PRODUCT_STATUSES = ['draft', 'active', 'sold_out', 'archived'];
export const SINGLE_CONDITIONS = ['Mint', 'Near Mint', 'Light Play', 'Moderate Play', 'Heavy Play'];
export const SEALED_CONDITIONS = ['New', 'Seal Opened'];

function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function toPositiveNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw badRequest(`${field} must be a positive number`);
  }

  return number;
}

function toNonNegativeInteger(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw badRequest(`${field} must be zero or more`);
  }

  return number;
}

function optionalNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return normalizeTags(parsed);
      }
    } catch {
      return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    }
  }

  return [];
}

function normalizePrimaryImageUrl(value) {
  const imageUrl = value ? String(value).trim() : null;
  if (!imageUrl) return null;

  if (!imageUrl.startsWith('/uploads/products/') && !imageUrl.startsWith('/api/pokewallet/images/')) {
    throw badRequest('Primary product image must be an uploaded image or a server-proxied PokeWallet image');
  }

  return imageUrl;
}

function normalizeGalleryImages(value) {
  const images = Array.isArray(value) ? value : [];

  return images
    .map((imageUrl) => String(imageUrl || '').trim())
    .filter(Boolean)
    .map((imageUrl) => {
      if (!imageUrl.startsWith('/uploads/products/')) {
        throw badRequest('Gallery images must be uploaded through the admin image uploader');
      }

      return imageUrl;
    });
}

function normalizeCodeLines(value) {
  if (!value) return [];
  const rawCodes = Array.isArray(value) ? value : String(value).split(/\r?\n|,/);

  return [...new Set(rawCodes.map((code) => String(code).trim().toUpperCase()).filter(Boolean))];
}

export function validateProductPayload(payload) {
  const productType = payload.product_type;
  if (!PRODUCT_TYPES.includes(productType)) {
    throw badRequest('product_type must be single_card, sealed_product, or code_card');
  }

  const normalized = {
    product_type: productType,
    price: toPositiveNumber(payload.price, 'price'),
    quantity: toNonNegativeInteger(payload.quantity, 'quantity'),
    sku: payload.sku ? String(payload.sku).trim() : null,
    barcode: payload.barcode ? String(payload.barcode).trim() : null,
    image_url: normalizePrimaryImageUrl(payload.image_url),
    gallery_images: normalizeGalleryImages(payload.gallery_images),
    tags: normalizeTags(payload.tags),
    status: payload.status || 'draft'
  };

  if (!PRODUCT_STATUSES.includes(normalized.status)) {
    throw badRequest(`status must be one of: ${PRODUCT_STATUSES.join(', ')}`);
  }

  if (productType === 'single_card') {
    if (!required(payload.card_name)) throw badRequest('card_name is required');
    if (!required(payload.set_name)) throw badRequest('set_name is required');
    if (!required(payload.condition)) throw badRequest('condition is required');
    if (!SINGLE_CONDITIONS.includes(payload.condition)) {
      throw badRequest(`condition must be one of: ${SINGLE_CONDITIONS.join(', ')}`);
    }

    const details = {
      card_name: String(payload.card_name).trim(),
      set_name: String(payload.set_name).trim(),
      set_code: payload.set_code ? String(payload.set_code).trim() : null,
      card_number: payload.card_number ? String(payload.card_number).trim() : null,
      rarity: payload.rarity ? String(payload.rarity).trim() : null,
      pokemon_type: payload.pokemon_type ? String(payload.pokemon_type).trim() : null,
      condition: payload.condition,
      language: payload.language ? String(payload.language).trim() : 'English',
      edition_or_variant: payload.edition_or_variant ? String(payload.edition_or_variant).trim() : null,
      holo_type: payload.holo_type ? String(payload.holo_type).trim() : null,
      grading_company: payload.grading_company ? String(payload.grading_company).trim() : null,
      grade: payload.grade ? String(payload.grade).trim() : null,
      is_graded: Boolean(payload.is_graded)
    };

    normalized.description = payload.description?.trim() || generateSingleCardDescription(details);
    normalized.details = details;
    return normalized;
  }

  if (productType === 'code_card') {
    if (!required(payload.code_card_name)) throw badRequest('code_card_name is required');

    const details = {
      code_card_name: String(payload.code_card_name).trim(),
      set_name: payload.set_name ? String(payload.set_name).trim() : null,
      set_code: payload.set_code ? String(payload.set_code).trim() : null,
      code_type: payload.code_type ? String(payload.code_type).trim() : 'Pokemon TCG Live code',
      platform: payload.platform ? String(payload.platform).trim() : 'Pokemon TCG Live',
      redemption_url: payload.redemption_url ? String(payload.redemption_url).trim() : 'https://redeem.tcg.pokemon.com/',
      instructions: payload.instructions ? String(payload.instructions).trim() : 'Redeem this one-time code in Pokemon TCG Live.'
    };

    normalized.description = payload.description?.trim() || `Pokemon TCG Live ${details.code_card_name}. Digital code delivered after payment.`;
    normalized.details = details;
    normalized.new_codes = normalizeCodeLines(payload.codes_text || payload.new_codes);
    return normalized;
  }

  if (!required(payload.product_name)) throw badRequest('product_name is required');
  if (!required(payload.category)) throw badRequest('category is required');
  if (!required(payload.sealed_condition)) throw badRequest('sealed_condition is required');
  if (!SEALED_CONDITIONS.includes(payload.sealed_condition)) {
    throw badRequest(`sealed_condition must be one of: ${SEALED_CONDITIONS.join(', ')}`);
  }

  const details = {
    product_name: String(payload.product_name).trim(),
    brand: payload.brand ? String(payload.brand).trim() : 'Pokemon',
    category: String(payload.category).trim(),
    set_name: payload.set_name ? String(payload.set_name).trim() : null,
    release_year: payload.release_year ? Number(payload.release_year) : null,
    sealed_condition: payload.sealed_condition,
    weight_grams: toPositiveNumber(payload.weight_grams, 'weight_grams'),
    package_length_cm: toPositiveNumber(payload.package_length_cm, 'package_length_cm'),
    package_width_cm: toPositiveNumber(payload.package_width_cm, 'package_width_cm'),
    package_height_cm: toPositiveNumber(payload.package_height_cm, 'package_height_cm')
  };

  normalized.description = payload.description?.trim() || generateSealedProductDescription(details);
  normalized.details = details;
  return normalized;
}

export function parseProductFilters(query) {
  return {
    search: query.search?.trim(),
    type: query.type,
    set: query.set?.trim(),
    condition: query.condition,
    sealed_condition: query.sealed_condition,
    rarity: query.rarity?.trim(),
    category: query.category?.trim(),
    tag: query.tag?.trim(),
    status: query.status,
    stock_level: query.stock_level,
    min_price: optionalNumber(query.min_price),
    max_price: optionalNumber(query.max_price),
    limit: Math.min(Number(query.limit || 60), 100),
    offset: Math.max(Number(query.offset || 0), 0)
  };
}
