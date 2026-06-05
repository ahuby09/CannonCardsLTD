import { query, withTransaction } from '../config/db.js';
import { badRequest, notFound } from '../utils/errors.js';
import { mapProduct } from './product.service.js';

const CART_PRODUCT_COLUMNS = `
  p.id, p.product_type, p.price, p.quantity, p.description, p.sku, p.barcode, p.tags, p.image_url, p.\`status\` AS status,
  p.created_at, p.updated_at,
  sc.card_name, sc.set_name AS single_set_name, sc.set_code, sc.card_number, sc.rarity, sc.pokemon_type,
  sc.condition, sc.language, sc.edition_or_variant, sc.holo_type, sc.grading_company, sc.grade, sc.is_graded,
  sp.product_name, sp.brand, sp.category, sp.set_name AS sealed_set_name, sp.release_year, sp.sealed_condition,
  sp.weight_grams, sp.package_length_cm, sp.package_width_cm, sp.package_height_cm,
  cc.code_card_name, cc.set_name AS code_set_name, cc.set_code AS code_set_code, cc.code_type, cc.platform,
  cc.redemption_url, cc.instructions
`;

export function getCartIdentity(req) {
  if (req.user) {
    return { userId: req.user.id, cartToken: null };
  }

  const cartToken = req.headers['x-cart-token'];
  if (!cartToken || String(cartToken).length < 12) {
    throw badRequest('X-Cart-Token header is required for guest carts');
  }

  return { userId: null, cartToken: String(cartToken) };
}

async function findCart(identity) {
  if (identity.userId) {
    const rows = await query('SELECT * FROM carts WHERE user_id = ?', [identity.userId]);
    return rows[0] || null;
  }

  const rows = await query('SELECT * FROM carts WHERE cart_token = ?', [identity.cartToken]);
  return rows[0] || null;
}

export async function getOrCreateCart(identity) {
  const existing = await findCart(identity);
  if (existing) {
    return existing;
  }

  const result = await query('INSERT INTO carts (user_id, cart_token) VALUES (?, ?)', [identity.userId, identity.cartToken]);
  const rows = await query('SELECT * FROM carts WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function getCartWithItems(identity) {
  const cart = await getOrCreateCart(identity);
  const rows = await query(
    `
      SELECT ci.id AS cart_item_id, ci.quantity AS cart_quantity, ${CART_PRODUCT_COLUMNS}
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      LEFT JOIN single_card_details sc ON sc.product_id = p.id
      LEFT JOIN sealed_product_details sp ON sp.product_id = p.id
      LEFT JOIN code_card_details cc ON cc.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC
    `,
    [cart.id]
  );

  const items = rows.map((row) => {
    const product = mapProduct(row);
    return {
      id: row.cart_item_id,
      quantity: row.cart_quantity,
      product,
      line_total: Number(product.price) * Number(row.cart_quantity)
    };
  });

  return {
    cart,
    items,
    subtotal: items.reduce((sum, item) => sum + item.line_total, 0)
  };
}

export async function addCartItem(identity, productId, quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw badRequest('quantity must be greater than zero');
  }

  const productRows = await query('SELECT id, quantity, `status` AS status FROM products WHERE id = ?', [productId]);
  const product = productRows[0];
  if (!product || product.status !== 'active') {
    throw notFound('Active product not found');
  }

  const cart = await getOrCreateCart(identity);

  await withTransaction(async (connection) => {
    const [existingRows] = await connection.execute('SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [cart.id, productId]);
    const existingQuantity = existingRows[0]?.quantity || 0;
    const nextQuantity = existingQuantity + quantity;

    if (nextQuantity > product.quantity) {
      throw badRequest(`Only ${product.quantity} available in stock`);
    }

    if (existingRows.length) {
      await connection.execute('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?', [nextQuantity, cart.id, productId]);
    } else {
      await connection.execute('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cart.id, productId, quantity]);
    }
  });

  return getCartWithItems(identity);
}

export async function updateCartItem(identity, cartItemId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw badRequest('quantity must be zero or more');
  }

  const cart = await getOrCreateCart(identity);

  if (quantity === 0) {
    await query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [cartItemId, cart.id]);
    return getCartWithItems(identity);
  }

  const rows = await query(
    `
      SELECT ci.product_id, p.quantity AS stock_quantity
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.id = ? AND ci.cart_id = ?
    `,
    [cartItemId, cart.id]
  );

  if (!rows.length) {
    throw notFound('Cart item not found');
  }

  if (quantity > rows[0].stock_quantity) {
    throw badRequest(`Only ${rows[0].stock_quantity} available in stock`);
  }

  await query('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?', [quantity, cartItemId, cart.id]);
  return getCartWithItems(identity);
}

export async function removeCartItem(identity, cartItemId) {
  const cart = await getOrCreateCart(identity);
  await query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [cartItemId, cart.id]);
  return getCartWithItems(identity);
}

export async function clearCart(identity, connection = null) {
  const cart = await getOrCreateCart(identity);
  const runner = connection || { execute: (sql, params) => query(sql, params) };
  await runner.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
  return { ok: true };
}
