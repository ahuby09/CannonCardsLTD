import { Link } from 'react-router-dom';
import CartSummary from '../components/CartSummary.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function CartPage() {
  const { cart } = useCart();

  return (
    <main className="page narrow">
      <div className="section-heading">
        <h1>Basket</h1>
        {cart.items.length > 0 && <Link className="button" to="/checkout">Checkout</Link>}
      </div>
      <CartSummary />
    </main>
  );
}
