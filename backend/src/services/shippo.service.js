import { env, requireConfig } from '../config/env.js';
import { AppError } from '../utils/errors.js';

function requireShipFrom() {
  const required = ['name', 'street1', 'city', 'zip', 'country', 'phone', 'email'];
  const missing = required.filter((key) => !env.shipFrom[key]);

  if (missing.length) {
    const error = new Error(`Missing server configuration for Shippo sender address: ${missing.map((key) => `SHIP_FROM_${key.toUpperCase()}`).join(', ')}`);
    error.statusCode = 500;
    error.code = 'CONFIG_MISSING';
    throw error;
  }

  return {
    name: env.shipFrom.name,
    company: env.shipFrom.company,
    street1: env.shipFrom.street1,
    city: env.shipFrom.city,
    state: env.shipFrom.state || undefined,
    zip: env.shipFrom.zip,
    country: env.shipFrom.country === 'UK' ? 'GB' : env.shipFrom.country,
    phone: env.shipFrom.phone,
    email: env.shipFrom.email
  };
}

async function shippoRequest(path, options = {}) {
  const token = requireConfig(env.shippoApiToken, 'SHIPPO_API_TOKEN');
  const response = await fetch(`https://api.goshippo.com${path}`, {
    ...options,
    headers: {
      Authorization: `ShippoToken ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new AppError(
      data?.detail || data?.message || 'Shippo API request failed',
      response.status,
      'SHIPPO_API_ERROR',
      data
    );
  }

  return data;
}

function toShippoAddress(address) {
  return {
    name: address.full_name,
    street1: address.street1,
    street2: address.street2 || undefined,
    city: address.city,
    state: address.state || undefined,
    zip: address.postal_code,
    country: address.country,
    phone: address.phone || undefined,
    email: address.email,
    validate: true
  };
}

function parcelForProduct(product) {
  if (product.product_type === 'sealed_product') {
    return {
      weight: Number(product.weight_grams || env.defaults.sealedWeightGrams),
      length: Number(product.package_length_cm || env.defaults.sealedLengthCm),
      width: Number(product.package_width_cm || env.defaults.sealedWidthCm),
      height: Number(product.package_height_cm || env.defaults.sealedHeightCm)
    };
  }

  return {
    weight: env.defaults.singleWeightGrams,
    length: env.defaults.singleLengthCm,
    width: env.defaults.singleWidthCm,
    height: env.defaults.singleHeightCm
  };
}

function buildParcel(items) {
  const totals = items.reduce(
    (acc, item) => {
      const parcel = parcelForProduct(item.product);
      acc.weight += parcel.weight * item.quantity;
      acc.length = Math.max(acc.length, parcel.length);
      acc.width = Math.max(acc.width, parcel.width);
      acc.height += parcel.height * item.quantity;
      return acc;
    },
    { weight: 0, length: 0, width: 0, height: 0 }
  );

  return {
    length: Math.max(totals.length, 1).toFixed(2),
    width: Math.max(totals.width, 1).toFixed(2),
    height: Math.max(totals.height, 1).toFixed(2),
    distance_unit: 'cm',
    weight: Math.max(totals.weight, 1).toFixed(2),
    mass_unit: 'g'
  };
}

function normalizeRate(rate, shipmentId) {
  return {
    shippo_shipment_id: shipmentId,
    carrier: rate.provider || rate.carrier_account || 'Unknown carrier',
    service: rate.servicelevel?.name || rate.servicelevel?.token || rate.service || 'Shipping service',
    rate_id: rate.object_id,
    amount: Number(rate.amount),
    currency: String(rate.currency || 'GBP').toLowerCase(),
    estimated_days: rate.estimated_days ?? null
  };
}

export async function createShippoRates(address, items) {
  const shipment = await shippoRequest('/shipments/', {
    method: 'POST',
    body: JSON.stringify({
      address_from: requireShipFrom(),
      address_to: toShippoAddress(address),
      parcels: [buildParcel(items)],
      async: false
    })
  });

  const rates = (shipment.rates || [])
    .filter((rate) => rate.object_id && rate.amount)
    .map((rate) => normalizeRate(rate, shipment.object_id));

  if (!rates.length) {
    throw new AppError('Shippo returned no shipping rates for this delivery address', 502, 'NO_SHIPPING_RATES', shipment);
  }

  return {
    shipment_id: shipment.object_id,
    rates
  };
}

export async function createShippoLabel(rateId) {
  const transaction = await shippoRequest('/transactions/', {
    method: 'POST',
    body: JSON.stringify({
      rate: rateId,
      label_file_type: 'PDF',
      qr_code_requested: true,
      async: false
    })
  });

  const objectState = transaction.object_state || null;
  const status = transaction.status || null;
  const failed = [objectState, status].some((value) => String(value || '').toUpperCase() === 'ERROR');

  if (failed) {
    throw new AppError('Shippo could not create the label', 502, 'SHIPPO_LABEL_ERROR', transaction.messages || transaction);
  }

  if (!transaction.label_url) {
    throw new AppError('Shippo created a transaction but did not return a label URL', 502, 'SHIPPO_LABEL_MISSING', transaction.messages || transaction);
  }

  return {
    transaction_id: transaction.object_id,
    tracking_number: transaction.tracking_number,
    label_url: transaction.label_url,
    qr_code_url: transaction.qr_code_url || transaction.object_qr_code_url || transaction.label_qr_code_url || null,
    shipment_status: status || objectState || 'created',
    raw: transaction
  };
}
