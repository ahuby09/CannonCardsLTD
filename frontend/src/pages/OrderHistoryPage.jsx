import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { money } from '../utils/product.js';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderApi.list()
      .then((data) => setOrders(data.orders))
      .catch(setError);
  }, []);

  return (
    <main className="page narrow">
      <h1>Order history</h1>
      <ErrorMessage error={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Tracking</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.status}</td>
                <td>{order.payment_status}</td>
                <td>{money(order.total_amount, order.currency)}</td>
                <td>{order.tracking_number || '-'}</td>
                <td className="row-actions">
                  <Link className="button secondary" to={`/orders/${order.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
