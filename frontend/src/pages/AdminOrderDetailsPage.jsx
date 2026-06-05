import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/adminApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { money } from '../utils/product.js';

function badgeClass(value) {
  if (['paid', 'label_created', 'shipped', 'completed'].includes(value)) return 'badge success';
  if (['pending_shipping', 'pending_payment', 'unpaid'].includes(value)) return 'badge warning';
  if (['cancelled', 'failed', 'inventory_review', 'refunded'].includes(value)) return 'badge danger-badge';
  return 'badge';
}

function cleanStatus(value) {
  return String(value || '-').replaceAll('_', ' ');
}

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [labelError, setLabelError] = useState(null);
  const [labelLoading, setLabelLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [shipmentStatus, setShipmentStatus] = useState('');
  const [shipmentForm, setShipmentForm] = useState({
    carrier: '',
    service: '',
    tracking_number: '',
    label_url: '',
    qr_code_url: ''
  });
  const [address, setAddress] = useState({
    full_name: '',
    email: '',
    phone: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'GB'
  });

  async function load() {
    const data = await adminApi.getOrder(id);
    setOrder(data.order);
    setStatus(data.order.status);
    setPaymentStatus(data.order.payment_status);
    setShipmentStatus(data.order.shipment_status || '');
    setShipmentForm({
      carrier: data.order.shipment_carrier || '',
      service: data.order.shipment_service || '',
      tracking_number: data.order.tracking_number || '',
      label_url: data.order.label_url || '',
      qr_code_url: data.order.qr_code_url || ''
    });
    setAddress({
      full_name: data.order.full_name || '',
      email: data.order.email || '',
      phone: data.order.phone || '',
      street1: data.order.street1 || '',
      street2: data.order.street2 || '',
      city: data.order.city || '',
      state: data.order.state || '',
      postal_code: data.order.postal_code || '',
      country: data.order.country || 'GB'
    });
  }

  useEffect(() => {
    load().catch(setError);
  }, [id]);

  async function generateLabel() {
    setError(null);
    setLabelError(null);
    setLabelLoading(true);
    try {
      const data = await adminApi.generateLabel(id);
      setOrder(data.order);
      setStatus(data.order.status);
      setPaymentStatus(data.order.payment_status);
      setShipmentStatus(data.order.shipment_status || '');
      setShipmentForm({
        carrier: data.order.shipment_carrier || '',
        service: data.order.shipment_service || '',
        tracking_number: data.order.tracking_number || '',
        label_url: data.order.label_url || '',
        qr_code_url: data.order.qr_code_url || ''
      });
    } catch (err) {
      setError(err);
      setLabelError(err);
    } finally {
      setLabelLoading(false);
    }
  }

  async function markPaidForTesting() {
    setError(null);
    setLabelError(null);
    try {
      const data = await adminApi.markPaidForTesting(id);
      setOrder(data.order);
      setStatus(data.order.status);
      setPaymentStatus(data.order.payment_status);
      setShipmentStatus(data.order.shipment_status || '');
    } catch (err) {
      setError(err);
    }
  }

  async function saveOrder() {
    setError(null);
    setSaving(true);
    try {
      const data = await adminApi.updateOrderStatus(id, {
        status,
        payment_status: paymentStatus,
        shipment_status: shipmentStatus,
        ...shipmentForm,
        address
      });
      setOrder(data.order);
      setStatus(data.order.status);
      setPaymentStatus(data.order.payment_status);
      setShipmentStatus(data.order.shipment_status || '');
      setShipmentForm({
        carrier: data.order.shipment_carrier || '',
        service: data.order.shipment_service || '',
        tracking_number: data.order.tracking_number || '',
        label_url: data.order.label_url || '',
        qr_code_url: data.order.qr_code_url || ''
      });
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrder() {
    if (!confirm(`Delete order #${id}? This removes the order record, items, rates, payments, and shipment rows.`)) return;
    setError(null);
    try {
      await adminApi.deleteOrder(id);
      navigate('/admin/orders');
    } catch (err) {
      setError(err);
    }
  }

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function updateShipment(field, value) {
    setShipmentForm((current) => ({ ...current, [field]: value }));
  }

  if (!order) return <main className="page"><ErrorMessage error={error} /></main>;

  return (
    <main className="page order-edit-page">
      <div className="admin-page-header">
        <div>
          <Link className="admin-back-link" to="/admin/orders">Back to orders</Link>
          <h1>Order #{order.id}</h1>
          <div className="admin-status-row">
            <span className={badgeClass(order.status)}>{cleanStatus(order.status)}</span>
            <span className={badgeClass(order.payment_status)}>{cleanStatus(order.payment_status)}</span>
          </div>
        </div>
        <div className="actions">
          <button className="secondary" onClick={load}>Refresh</button>
          <button onClick={saveOrder} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
          <button className="danger" onClick={deleteOrder}>Delete</button>
        </div>
      </div>

      <ErrorMessage error={error} />

      <div className="order-edit-grid">
        <section className="admin-edit-stack">
          <div className="panel">
            <h2>Delivery details</h2>
            <div className="form-grid">
              <label>
                Full name
                <input value={address.full_name} onChange={(event) => updateAddress('full_name', event.target.value)} />
              </label>
              <label>
                Email
                <input value={address.email} onChange={(event) => updateAddress('email', event.target.value)} />
              </label>
              <label>
                Phone
                <input value={address.phone} onChange={(event) => updateAddress('phone', event.target.value)} />
              </label>
              <label>
                Postcode
                <input value={address.postal_code} onChange={(event) => updateAddress('postal_code', event.target.value)} />
              </label>
              <label className="wide">
                Address line 1
                <input value={address.street1} onChange={(event) => updateAddress('street1', event.target.value)} />
              </label>
              <label className="wide">
                Address line 2
                <input value={address.street2} onChange={(event) => updateAddress('street2', event.target.value)} />
              </label>
              <label>
                Town / city
                <input value={address.city} onChange={(event) => updateAddress('city', event.target.value)} />
              </label>
              <label>
                County
                <input value={address.state} onChange={(event) => updateAddress('state', event.target.value)} />
              </label>
              <label>
                Country
                <select value={address.country} onChange={(event) => updateAddress('country', event.target.value)}>
                  <option value="GB">United Kingdom</option>
                </select>
              </label>
            </div>
          </div>

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
        </section>

        <aside className="admin-edit-stack">
          <div className="panel">
            <h2>Order state</h2>
            <div className="form-grid form-grid--single">
              <label>
                Order status
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="pending_shipping">Pending shipping</option>
                  <option value="pending_payment">Pending payment</option>
                  <option value="paid">Paid</option>
                  <option value="label_created">Label created</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="inventory_review">Inventory review</option>
                </select>
              </label>
              <label>
                Payment status
                <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>
              {order.payment_status !== 'paid' && (
                <button className="secondary" onClick={markPaidForTesting}>Mark paid for local test</button>
              )}
            </div>
          </div>

          <div className="panel">
            <h2>Shipment</h2>
            <ErrorMessage error={labelError} />
            <div className="form-grid form-grid--single">
              <label>
                Carrier
                <input value={shipmentForm.carrier} onChange={(event) => updateShipment('carrier', event.target.value)} />
              </label>
              <label>
                Service
                <input value={shipmentForm.service} onChange={(event) => updateShipment('service', event.target.value)} />
              </label>
              <label>
                Tracking number
                <input value={shipmentForm.tracking_number} onChange={(event) => updateShipment('tracking_number', event.target.value)} />
              </label>
              <label>
                Shipment status
                <input value={shipmentStatus} onChange={(event) => setShipmentStatus(event.target.value)} />
              </label>
              <label>
                Label URL
                <input value={shipmentForm.label_url} onChange={(event) => updateShipment('label_url', event.target.value)} />
              </label>
              <label>
                QR code URL
                <input value={shipmentForm.qr_code_url} onChange={(event) => updateShipment('qr_code_url', event.target.value)} />
              </label>
            </div>

            <div className="shipment-links">
              <div>
                <span>Label URL</span>
                {order.label_url ? <a href={order.label_url} target="_blank" rel="noreferrer">{order.label_url}</a> : <p>Generate a Shippo label to create this.</p>}
              </div>
              <div>
                <span>QR code URL</span>
                {order.qr_code_url ? <a href={order.qr_code_url} target="_blank" rel="noreferrer">{order.qr_code_url}</a> : <p>Only appears if the selected carrier/service supports QR codes.</p>}
              </div>
            </div>

            <div className="actions">
              {order.label_url && <a className="button secondary" href={order.label_url} target="_blank" rel="noreferrer">Download label</a>}
              {order.qr_code_url && <a className="button secondary" href={order.qr_code_url} target="_blank" rel="noreferrer">View QR code</a>}
              <button onClick={generateLabel} disabled={order.payment_status !== 'paid' || labelLoading}>
                {labelLoading ? 'Generating label...' : 'Generate Shippo label'}
              </button>
            </div>
            {order.payment_status !== 'paid' && (
              <small className="shipment-note">Labels can only be generated after payment is marked paid.</small>
            )}
          </div>

          <div className="panel">
            <h2>Stripe reference</h2>
            <p>Status: <strong>{order.payment_status}</strong></p>
            <p>Stripe session: {order.stripe_checkout_session_id || '-'}</p>
            <p>Payment intent: {order.stripe_payment_intent_id || '-'}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
