import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { isNewOrder, isOrderToShip } from '../utils/orderQueues.js';
import { money } from '../utils/product.js';

const queueCopy = {
  all: {
    title: 'All orders',
    text: 'Every checkout, payment state, label, and shipment in one place.'
  },
  new: {
    title: 'New orders',
    text: 'Paid orders that have not had a shipping label generated yet.'
  },
  to_ship: {
    title: 'Orders to ship',
    text: 'Orders with a generated label that still need dispatching.'
  }
};

function orderMatchesQueue(order, queue) {
  if (queue === 'new') return isNewOrder(order);
  if (queue === 'to_ship') return isOrderToShip(order);
  return true;
}

function matchesSearch(order, search) {
  if (!search) return true;
  const text = [
    order.id,
    order.full_name,
    order.email,
    order.status,
    order.payment_status,
    order.tracking_number
  ].join(' ').toLowerCase();

  return text.includes(search.toLowerCase());
}

function badgeClass(value) {
  if (['paid', 'label_created', 'shipped', 'completed'].includes(value)) return 'badge success';
  if (['pending_shipping', 'pending_payment', 'unpaid'].includes(value)) return 'badge warning';
  if (['cancelled', 'failed', 'inventory_review', 'refunded'].includes(value)) return 'badge danger-badge';
  return 'badge';
}

function cleanStatus(value) {
  return String(value || '-').replaceAll('_', ' ');
}

export default function AdminOrdersPage({ queue = 'all' }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [busyOrderId, setBusyOrderId] = useState(null);

  async function load() {
    setError(null);
    const data = await adminApi.listOrders();
    setOrders(data.orders);
  }

  useEffect(() => {
    load().catch(setError);
  }, []);

  const counts = useMemo(() => ({
    all: orders.length,
    new: orders.filter(isNewOrder).length,
    to_ship: orders.filter(isOrderToShip).length,
    unpaid: orders.filter((order) => order.payment_status !== 'paid').length
  }), [orders]);

  const visibleOrders = useMemo(
    () => orders.filter((order) => orderMatchesQueue(order, queue)).filter((order) => matchesSearch(order, search)),
    [orders, queue, search]
  );

  async function deleteOrder(id) {
    if (!confirm(`Delete order #${id}? This removes the order record, items, rates, payments, and shipment rows.`)) return;
    setError(null);
    setBusyOrderId(id);
    try {
      await adminApi.deleteOrder(id);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusyOrderId(null);
    }
  }

  async function markShipped(id) {
    setError(null);
    setBusyOrderId(id);
    try {
      await adminApi.updateOrderStatus(id, {
        status: 'shipped',
        shipment_status: 'shipped'
      });
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusyOrderId(null);
    }
  }

  const copy = queueCopy[queue] || queueCopy.all;

  return (
    <main className="page admin-orders-page">
      <div className="section-heading">
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.text}</p>
        </div>
        <div className="actions">
          <Link className="button secondary" to="/admin/orders/new-orders">New orders</Link>
          <Link className="button secondary" to="/admin/orders/to-ship">To ship</Link>
          <Link className="button" to="/admin/orders">All orders</Link>
        </div>
      </div>

      <ErrorMessage error={error} />

      <section className="admin-queue-cards" aria-label="Order queue counts">
        <Link to="/admin/orders/new-orders">
          <span>New orders</span>
          <strong>{counts.new}</strong>
        </Link>
        <Link to="/admin/orders/to-ship">
          <span>Orders to ship</span>
          <strong>{counts.to_ship}</strong>
        </Link>
        <Link to="/admin/orders">
          <span>All orders</span>
          <strong>{counts.all}</strong>
        </Link>
        <div>
          <span>Unpaid / review</span>
          <strong>{counts.unpaid}</strong>
        </div>
      </section>

      <div className="admin-toolbar">
        <label>
          Search orders
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number, customer, email, tracking..."
          />
        </label>
        <button className="secondary" onClick={load}>Refresh</button>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="empty-state">No orders match this queue.</div>
      ) : (
        <div className="table-wrap admin-orders-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Order state</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Shipping</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                    <small>{order.shipment_status || 'No shipment yet'}</small>
                  </td>
                  <td>
                    <strong>{order.full_name}</strong>
                    <small>{order.email}</small>
                  </td>
                  <td><span className={badgeClass(order.status)}>{cleanStatus(order.status)}</span></td>
                  <td><span className={badgeClass(order.payment_status)}>{cleanStatus(order.payment_status)}</span></td>
                  <td>{money(order.total_amount, order.currency)}</td>
                  <td>
                    {order.tracking_number ? <strong>{order.tracking_number}</strong> : '-'}
                    <small>{order.shipment_carrier || order.shipment_service || ''}</small>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="row-actions">
                    <Link className="button secondary" to={`/admin/orders/${order.id}`}>View</Link>
                    <Link className="button secondary" to={`/admin/orders/${order.id}`}>Edit</Link>
                    {isOrderToShip(order) && (
                      <button className="secondary" disabled={busyOrderId === order.id} onClick={() => markShipped(order.id)}>
                        Ship
                      </button>
                    )}
                    <button className="danger" disabled={busyOrderId === order.id} onClick={() => deleteOrder(order.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
