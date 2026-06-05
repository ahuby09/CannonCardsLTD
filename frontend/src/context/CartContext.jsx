import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../api/cartApi.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const data = await cartApi.get();
    setCart(data);
    return data;
  }

  useEffect(() => {
    refresh().catch(() => null).finally(() => setLoading(false));
  }, []);

  async function add(productId, quantity = 1) {
    const data = await cartApi.add(productId, quantity);
    setCart(data);
    return data;
  }

  async function update(itemId, quantity) {
    const data = await cartApi.update(itemId, quantity);
    setCart(data);
    return data;
  }

  async function remove(itemId) {
    const data = await cartApi.remove(itemId);
    setCart(data);
    return data;
  }

  async function clear() {
    await cartApi.clear();
    setCart({ items: [], subtotal: 0 });
  }

  const itemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity), 0);

  const value = useMemo(() => ({
    cart,
    loading,
    itemCount,
    refresh,
    add,
    update,
    remove,
    clear
  }), [cart, loading, itemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
