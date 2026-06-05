import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi.js';
import { adminProductApi } from '../api/productApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { isNewOrder, isOrderToShip } from '../utils/orderQueues.js';
import { money } from '../utils/product.js';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      adminProductApi.list({ limit: 100 }),
      adminApi.listOrders()
    ])
      .then(([productData, orderData]) => {
        setProducts(productData.products);
        setOrders(orderData.orders);
      })
      .catch(setError);
  }, []);

  const paidOrders = orders.filter((order) => order.payment_status === 'paid');
  const newOrders = orders.filter(isNewOrder);
  const toShip = orders.filter(isOrderToShip);
  const lowStock = products.filter((product) => product.quantity > 0 && product.quantity <= 3);
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  return (
    <main className="page">
      <div className="section-heading">
        <h1>Admin dashboard</h1>
        <div className="actions">
          <Link className="button" to="/admin/products/new">New product</Link>
          <Link className="button secondary" to="/admin/singles/new">New single</Link>
          <Link className="button secondary" to="/admin/orders">Orders</Link>
        </div>
      </div>
      <ErrorMessage error={error} />
      <section className="metrics">
        <div><span>Products</span><strong>{products.length}</strong></div>
        <div><span>New orders</span><strong>{newOrders.length}</strong></div>
        <div><span>To ship</span><strong>{toShip.length}</strong></div>
        <div><span>Low stock</span><strong>{lowStock.length}</strong></div>
      </section>
      <section className="admin-dashboard-actions">
        <Link to="/admin/orders/new-orders">
          <span>Process new paid orders</span>
          <strong>{newOrders.length} waiting for labels</strong>
        </Link>
        <Link to="/admin/orders/to-ship">
          <span>Dispatch labelled orders</span>
          <strong>{toShip.length} ready to ship</strong>
        </Link>
        <div>
          <span>Paid revenue</span>
          <strong>{money(revenue)}</strong>
        </div>
      </section>
    </main>
  );
}
