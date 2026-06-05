import { useState } from 'react';
import { Link } from 'react-router-dom';
import AddressForm from '../components/AddressForm.jsx';
import CartSummary from '../components/CartSummary.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ShippingRates from '../components/ShippingRates.jsx';
import { checkoutApi } from '../api/checkoutApi.js';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../utils/product.js';

const initialAddress = {
  full_name: '',
  email: '',
  phone: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'GB'
};

export default function CheckoutPage() {
  const { cart } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [digitalContact, setDigitalContact] = useState({ full_name: '', email: '' });
  const [rates, setRates] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [selectedRateId, setSelectedRateId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const hasPhysicalItems = cart.items.some((item) => item.product.product_type !== 'code_card');
  const digitalOnly = cart.items.length > 0 && !hasPhysicalItems;

  async function fetchRates(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setRates([]);

    try {
      const data = await checkoutApi.rates(address);
      setOrderId(data.order_id);
      setRates(data.rates);
      setSelectedRateId(data.rates[0]?.id || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function createDigitalOrder(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await checkoutApi.digitalOrder(digitalContact);
      setOrderId(data.order_id);
      setRates([]);
      setSelectedRateId(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function pay() {
    setLoading(true);
    setError(null);

    try {
      const data = await checkoutApi.createSession(orderId, selectedRateId);
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  const selectedRate = rates.find((rate) => Number(rate.id) === Number(selectedRateId));

  return (
    <main className="page checkout">
      <section>
        <h1>Checkout</h1>
        <CartSummary editable={false} />
      </section>

      <section>
        {digitalOnly ? (
          <form className="panel" onSubmit={createDigitalOrder}>
            <h2>Digital delivery</h2>
            <p>Code cards are delivered on the order confirmation page after payment. No shipping is required.</p>
            <label>
              Full name
              <input value={digitalContact.full_name} onChange={(event) => setDigitalContact({ ...digitalContact, full_name: event.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={digitalContact.email} onChange={(event) => setDigitalContact({ ...digitalContact, email: event.target.value })} required />
            </label>
            <button disabled={loading || cart.items.length === 0}>{loading ? 'Working...' : 'Continue to payment'}</button>
          </form>
        ) : (
          <form className="panel" onSubmit={fetchRates}>
            <h2>Delivery address</h2>
            <AddressForm value={address} onChange={setAddress} />
            {cart.items.some((item) => item.product.product_type === 'code_card') && (
              <p>Code cards in this basket will be delivered digitally after payment. Shipping applies only to physical items.</p>
            )}
            <button disabled={loading || cart.items.length === 0}>{loading ? 'Working...' : 'Get shipping rates'}</button>
          </form>
        )}

        <ErrorMessage error={error} />

        {(rates.length > 0 || (digitalOnly && orderId)) && (
          <div className="panel">
            <h2>{digitalOnly ? 'Payment' : 'Shipping'}</h2>
            {!digitalOnly && <ShippingRates rates={rates} selectedRateId={selectedRateId} onSelect={setSelectedRateId} />}
            <div className="checkout-total">
              <span>Total</span>
              <strong>{money(Number(cart.subtotal) + Number(digitalOnly ? 0 : selectedRate?.amount || 0), selectedRate?.currency || 'GBP')}</strong>
            </div>
            <label className="checkbox-label checkout-terms">
              <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span>
                I have read the <Link to="/legal/terms">Terms of Sale</Link>, <Link to="/legal/returns">Returns and Refunds</Link>, <Link to="/legal/shipping">Shipping Policy</Link>, and <Link to="/legal/privacy">Privacy Policy</Link>.
              </span>
            </label>
            <button disabled={(!digitalOnly && !selectedRateId) || loading || !termsAccepted} onClick={pay}>
              {loading ? 'Redirecting...' : 'Pay with Stripe'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
