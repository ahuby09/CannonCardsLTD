import { addCartItem, clearCart, getCartIdentity, getCartWithItems, removeCartItem, updateCartItem } from '../services/cart.service.js';
import { badRequest } from '../utils/errors.js';

export async function getCart(req, res) {
  const cart = await getCartWithItems(getCartIdentity(req));
  res.json(cart);
}

export async function addItem(req, res) {
  const productId = Number(req.body.product_id);
  const quantity = Number(req.body.quantity || 1);

  if (!Number.isInteger(productId)) {
    throw badRequest('product_id is required');
  }

  const cart = await addCartItem(getCartIdentity(req), productId, quantity);
  res.status(201).json(cart);
}

export async function updateItem(req, res) {
  const quantity = Number(req.body.quantity);
  const cart = await updateCartItem(getCartIdentity(req), Number(req.params.id), quantity);
  res.json(cart);
}

export async function deleteItem(req, res) {
  const cart = await removeCartItem(getCartIdentity(req), Number(req.params.id));
  res.json(cart);
}

export async function deleteCart(req, res) {
  await clearCart(getCartIdentity(req));
  res.json({ ok: true });
}
