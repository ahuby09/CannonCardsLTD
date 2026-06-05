import { getCartIdentity } from '../services/cart.service.js';
import { createDigitalOrder, createStripeCheckoutSession } from '../services/order.service.js';
import { badRequest } from '../utils/errors.js';

export async function createSession(req, res) {
  const orderId = Number(req.body.order_id);
  const shippingRateId = req.body.shipping_rate_id === undefined || req.body.shipping_rate_id === null || req.body.shipping_rate_id === ''
    ? null
    : Number(req.body.shipping_rate_id);

  if (!Number.isInteger(orderId) || (shippingRateId !== null && !Number.isInteger(shippingRateId))) {
    throw badRequest('order_id is required and shipping_rate_id must be valid when supplied');
  }

  const result = await createStripeCheckoutSession(orderId, shippingRateId, getCartIdentity(req));
  res.status(201).json(result);
}

export async function createDigital(req, res) {
  const result = await createDigitalOrder(getCartIdentity(req), req.body.contact || req.body);
  res.status(201).json(result);
}
