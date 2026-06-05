const CLOSED_ORDER_STATUSES = ['shipped', 'completed', 'cancelled'];

export function hasGeneratedLabel(order) {
  return Boolean(String(order.label_url || '').trim());
}

export function isNewOrder(order) {
  return order.payment_status === 'paid'
    && !hasGeneratedLabel(order)
    && !CLOSED_ORDER_STATUSES.includes(order.status);
}

export function isOrderToShip(order) {
  return order.payment_status === 'paid'
    && hasGeneratedLabel(order)
    && !CLOSED_ORDER_STATUSES.includes(order.status);
}
