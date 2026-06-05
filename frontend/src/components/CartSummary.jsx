import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { money, productName, productSubtitle } from '../utils/product.js';

export default function CartSummary({ editable = true }) {
  const { cart, update, remove } = useCart();

  if (!cart.items.length) {
    return <div className="empty-state">Your basket is empty.</div>;
  }

  return (
    <div className="cart-list">
      {cart.items.map((item) => (
        <div className="cart-row" key={item.id}>
          <img src={resolveImageUrl(item.product.image_url)} alt={productName(item.product)} />
          <div>
            <Link to={`/products/${item.product.id}`}>{productName(item.product)}</Link>
            <p>{productSubtitle(item.product)}</p>
            <strong>{money(item.product.price)}</strong>
          </div>
          {editable ? (
            <div className="cart-row__controls">
              <input
                type="number"
                min="1"
                max={item.product.quantity}
                value={item.quantity}
                onChange={(event) => update(item.id, Number(event.target.value))}
              />
              <button className="secondary" onClick={() => remove(item.id)}>Remove</button>
            </div>
          ) : (
            <span>Qty {item.quantity}</span>
          )}
        </div>
      ))}
      <div className="cart-total">
        <span>Subtotal</span>
        <strong>{money(cart.subtotal)}</strong>
      </div>
    </div>
  );
}
