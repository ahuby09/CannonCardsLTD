import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderApi } from '../api/orderApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import OrderCodeDelivery, { hasCodeCardItems, orderCodes } from '../components/OrderCodeDelivery.jsx';
import { money } from '../utils/product.js';

function cleanStatus(value) {
  return String(value || '-').replaceAll('_', ' ');
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderApi.get(id)
      .then((data) => setOrder(data.order))
      .catch(setError);
  }, [id]);

  if (!order) {
    return (
      <main className="page narrow">
        <Link className="back-link" to="/orders">Back to orders</Link>
        <ErrorMessage error={error} />
      </main>
    );
  }

  const codes = orderCodes(order);

  return (
    <main className="page">
      <Link className="back-link" to="/orders">Back to orders</Link>
      <div className="section-heading">
        <div>
          <h1>Order #{order.id}</h1>
          <p>{cleanStatus(order.status)} | Payment {cleanStatus(order.payment_status)}</p>
        </div>
      </div>

      <ErrorMessage error={error} />

      <div className="order-detail">
        <section>
          <div className="panel">
            <h2>Items</h2>
            {order.items.map((item) => (
              <div className="line-item" key={item.id}>
                <span>{item.product_snapshot_name}</span>
                <span>Qty {item.quantity}</span>
                <strong>{money(Number(item.unit_price) * Number(item.quantity), order.currency)}</strong>
              </div>
            ))}
            <div className="order-totals">
              <div><span>Subtotal</span><strong>{money(order.amount_subtotal, order.currency)}</strong></div>
              <div><span>Shipping</span><strong>{money(order.shipping_amount, order.currency)}</strong></div>
              <div><span>Total</span><strong>{money(order.total_amount, order.currency)}</strong></div>
            </div>
          </div>

          <div className="panel">
            <h2>Digital delivery</h2>
            <OrderCodeDelivery order={order} />
            {hasCodeCardItems(order) && codes.length === 0 && (
              <p>Your code-card download will appear here once payment has been confirmed.</p>
            )}
            {!hasCodeCardItems(order) && (
              <p>This order does not include digital code cards.</p>
            )}
          </div>
        </section>

        <aside>
          <div className="panel">
            <h2>Delivery</h2>
            <p>{order.full_name}</p>
            <p>{order.email}</p>
            {order.street1 && (
              <>
                <p>{order.street1}</p>
                {order.street2 && <p>{order.street2}</p>}
                <p>{[order.city, order.state, order.postal_code].filter(Boolean).join(', ')}</p>
                <p>{order.country}</p>
              </>
            )}
          </div>

          <div className="panel">
            <h2>Shipment</h2>
            <p>Carrier: {order.shipment_carrier || '-'}</p>
            <p>Service: {order.shipment_service || '-'}</p>
            <p>Tracking: {order.tracking_number || '-'}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
