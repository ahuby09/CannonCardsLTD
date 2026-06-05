import {
  createOrderLabel,
  deleteOrder,
  getOrderDetails,
  listOrders,
  markOrderPaidForLocalTesting,
  updateOrderAndShipmentStatus
} from '../services/order.service.js';

export async function listAdminOrders(req, res) {
  const orders = await listOrders({ admin: true });
  res.json({ orders });
}

export async function getAdminOrder(req, res) {
  const order = await getOrderDetails(req.params.id, { admin: true });
  res.json({ order });
}

export async function generateLabel(req, res) {
  const order = await createOrderLabel(req.params.id);
  res.status(201).json({ order });
}

export async function updateStatus(req, res) {
  const order = await updateOrderAndShipmentStatus(req.params.id, req.body);
  res.json({ order });
}

export async function markPaidLocalTest(req, res) {
  const order = await markOrderPaidForLocalTesting(req.params.id);
  res.json({ order });
}

export async function deleteAdminOrder(req, res) {
  const result = await deleteOrder(req.params.id);
  res.json(result);
}
