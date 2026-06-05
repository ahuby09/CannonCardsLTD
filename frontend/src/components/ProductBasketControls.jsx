import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function ProductBasketControls({ product, compact = false }) {
  const { cart, add, update, remove } = useCart();
  const [busy, setBusy] = useState(false);
  const stock = Number(product.quantity || 0);
  const cartItem = cart.items.find((item) => Number(item.product.id) === Number(product.id));
  const quantityInBasket = Number(cartItem?.quantity || 0);
  const soldOut = stock <= 0 || product.status === 'sold_out';
  const atStockLimit = quantityInBasket >= stock;

  async function run(action) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  function addOne(event) {
    event.preventDefault();
    event.stopPropagation();
    if (soldOut || atStockLimit) return;
    run(() => add(product.id, 1));
  }

  function removeOne(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!cartItem) return;

    if (quantityInBasket <= 1) {
      run(() => remove(cartItem.id));
    } else {
      run(() => update(cartItem.id, quantityInBasket - 1));
    }
  }

  if (!quantityInBasket) {
    return (
      <button className={compact ? 'basket-add basket-add--compact' : 'basket-add'} disabled={soldOut || busy} onClick={addOne}>
        {soldOut ? 'Sold out' : compact ? 'Add' : 'Add to basket'}
      </button>
    );
  }

  return (
    <div className={compact ? 'basket-control basket-control--compact' : 'basket-control'} aria-label="Basket quantity">
      <button className="basket-control__step" disabled={busy} onClick={removeOne} aria-label="Remove one from basket">-</button>
      <span className="basket-control__quantity">{quantityInBasket}</span>
      <button
        className="basket-control__step"
        disabled={busy || atStockLimit}
        onClick={addOne}
        aria-label={atStockLimit ? 'No more stock available' : 'Add one more to basket'}
        title={atStockLimit ? 'No more stock available' : 'Add one more'}
      >
        +
      </button>
    </div>
  );
}
