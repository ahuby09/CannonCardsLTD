import { getOrderByStripeSession, getOrderDetails, listOrders } from '../services/order.service.js';
import { badRequest } from '../utils/errors.js';

export async function getCustomerOrders(req, res) {
  const orders = await listOrders({ userId: req.user.id });
  res.json({ orders });
}

export async function getCustomerOrder(req, res) {
  const order = await getOrderDetails(req.params.id, { userId: req.user.id });
  res.json({ order });
}

export async function getConfirmationOrder(req, res) {
  const sessionId = req.params.sessionId;
  if (!sessionId) {
    throw badRequest('session id is required');
  }

  const order = await getOrderByStripeSession(sessionId);
  res.json({ order });
}
