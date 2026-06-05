import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { orderApi } from '../api/orderApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import OrderCodeDelivery, { hasCodeCardItems, orderCodes } from '../components/OrderCodeDelivery.jsx';
import { money } from '../utils/product.js';

export default function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const codes = orderCodes(order);

  useEffect(() => {
    if (!sessionId) return;
    orderApi.confirmation(sessionId)
      .then((data) => setOrder(data.order))
      .catch(setError);
  }, [sessionId]);

  return (
    <main className="page narrow">
      <h1>Order confirmation</h1>
      {!sessionId && <div className="empty-state">Missing Stripe session id.</div>}
      <ErrorMessage error={error} />
      {order && (
        <div className="panel">
          <h2>Order #{order.id}</h2>
          <p>Payment status: <strong>{order.payment_status}</strong></p>
          <p>Total: <strong>{money(order.total_amount, order.currency)}</strong></p>
          {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
          <OrderCodeDelivery order={order} />
          {hasCodeCardItems(order) && codes.length === 0 && (
            <p>Digital codes will appear here as soon as the Stripe webhook confirms payment.</p>
          )}
          {order.user_id && <Link className="button secondary" to={`/orders/${order.id}`}>View order</Link>}
          <Link className="button secondary" to="/products">Continue shopping</Link>
        </div>
      )}
    </main>
  );
}
