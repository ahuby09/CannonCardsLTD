import { query, withTransaction } from '../config/db.js';
import { env } from '../config/env.js';
import { getStripe } from '../config/stripe.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/errors.js';
import { decryptCodeValue } from '../utils/codeCrypto.js';
import { validateAddressPayload } from '../validators/address.validators.js';
import { getCartWithItems } from './cart.service.js';
import { createShippoLabel, createShippoRates } from './shippo.service.js';

const ORDER_STATUSES = [
  'pending_shipping',
  'pending_payment',
  'paid',
  'label_created',
  'shipped',
  'completed',
  'cancelled',
  'inventory_review'
];

const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'refunded'];

const SHIPMENT_FIELDS = ['carrier', 'service', 'tracking_number', 'label_url', 'qr_code_url', 'shipment_status'];

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

function stripeAmount(value) {
  return Math.round(Number(value) * 100);
}

function displayName(product) {
  if (product.product_type === 'single_card') return product.card_name;
  if (product.product_type === 'code_card') return product.code_card_name;
  return product.product_name;
}

function isPhysicalProduct(product) {
  return product.product_type !== 'code_card';
}

async function insertAddress(connection, userId, address) {
  const [result] = await connection.execute(
    `
      INSERT INTO addresses (user_id, full_name, email, phone, street1, street2, city, state, postal_code, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      address.full_name,
      address.email,
      address.phone || null,
      address.street1,
      address.street2 || null,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ]
  );

  return result.insertId;
}

async function getOrderItemsWithProducts(connection, orderId) {
  const [rows] = await connection.execute(
    `
      SELECT
        oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
        p.price AS current_price, p.quantity AS stock_quantity, p.\`status\` AS product_status,
        p.product_type
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
      FOR UPDATE
    `,
    [orderId]
  );

  return rows;
}

async function validateOrderStockAndRefreshTotals(connection, orderId) {
  const items = await getOrderItemsWithProducts(connection, orderId);
  if (!items.length) {
    throw badRequest('Order has no items');
  }

  let subtotal = 0;
  for (const item of items) {
    if (item.product_status !== 'active') {
      throw conflict(`Product ${item.product_id} is no longer active`);
    }

    if (item.stock_quantity < item.quantity) {
      throw conflict(`Insufficient stock for product ${item.product_id}`);
    }

    subtotal += Number(item.current_price) * Number(item.quantity);
    if (Number(item.unit_price) !== Number(item.current_price)) {
      await connection.execute('UPDATE order_items SET unit_price = ? WHERE id = ?', [item.current_price, item.id]);
    }
  }

  subtotal = money(subtotal);
  await connection.execute('UPDATE orders SET amount_subtotal = ?, total_amount = ? + shipping_amount WHERE id = ?', [subtotal, subtotal, orderId]);
  return subtotal;
}

export async function createOrderAndRates(identity, address) {
  const cart = await getCartWithItems(identity);
  if (!cart.items.length) {
    throw badRequest('Cart is empty');
  }

  for (const item of cart.items) {
    if (item.product.status !== 'active') {
      throw conflict(`${displayName(item.product)} is not available`);
    }

    if (item.quantity > item.product.quantity) {
      throw conflict(`Only ${item.product.quantity} available for ${displayName(item.product)}`);
    }
  }

  const physicalItems = cart.items.filter((item) => isPhysicalProduct(item.product));
  if (!physicalItems.length) {
    throw badRequest('This basket contains digital code cards only. Use digital checkout.');
  }

  const subtotal = money(cart.subtotal);
  const userId = identity.userId || null;

  const orderId = await withTransaction(async (connection) => {
    const addressId = await insertAddress(connection, userId, address);
    const [orderResult] = await connection.execute(
      `
        INSERT INTO orders (user_id, cart_token, address_id, \`status\`, payment_status, amount_subtotal, shipping_amount, total_amount, currency)
        VALUES (?, ?, ?, 'pending_shipping', 'unpaid', ?, 0, ?, ?)
      `,
      [userId, identity.cartToken || null, addressId, subtotal, subtotal, env.storeCurrency]
    );

    for (const item of cart.items) {
      await connection.execute(
        `
          INSERT INTO order_items (
            order_id, product_id, product_snapshot_name, product_snapshot_image_url, product_snapshot_sku, unit_price, quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderResult.insertId,
          item.product.id,
          displayName(item.product),
          item.product.image_url,
          item.product.sku,
          item.product.price,
          item.quantity
        ]
      );
    }

    return orderResult.insertId;
  });

  const shippo = await createShippoRates(address, physicalItems);

  const insertedRates = await withTransaction(async (connection) => {
    await connection.execute('DELETE FROM shipping_rates WHERE order_id = ?', [orderId]);

    const rows = [];
    for (const rate of shippo.rates) {
      const [result] = await connection.execute(
        `
          INSERT INTO shipping_rates (
            order_id, shippo_shipment_id, carrier, service, rate_id, amount, currency, estimated_days
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          rate.shippo_shipment_id,
          rate.carrier,
          rate.service,
          rate.rate_id,
          rate.amount,
          rate.currency,
          rate.estimated_days
        ]
      );

      rows.push({ id: result.insertId, ...rate });
    }

    return rows;
  });

  return {
    order_id: orderId,
    amount_subtotal: subtotal,
    rates: insertedRates
  };
}

export async function createDigitalOrder(identity, contact) {
  const cart = await getCartWithItems(identity);
  if (!cart.items.length) {
    throw badRequest('Cart is empty');
  }

  if (cart.items.some((item) => isPhysicalProduct(item.product))) {
    throw badRequest('Digital checkout can only be used for code-card-only baskets');
  }

  for (const item of cart.items) {
    if (item.product.status !== 'active') {
      throw conflict(`${displayName(item.product)} is not available`);
    }

    if (item.quantity > item.product.quantity) {
      throw conflict(`Only ${item.product.quantity} available for ${displayName(item.product)}`);
    }
  }

  const fullName = String(contact.full_name || contact.name || '').trim();
  const email = String(contact.email || '').trim();
  if (!fullName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw badRequest('A valid name and email are required for digital delivery');
  }

  const subtotal = money(cart.subtotal);
  const userId = identity.userId || null;

  const orderId = await withTransaction(async (connection) => {
    const addressId = await insertAddress(connection, userId, {
      full_name: fullName,
      email,
      phone: null,
      street1: 'Digital delivery',
      street2: null,
      city: 'Digital delivery',
      state: '',
      postal_code: 'DIGITAL',
      country: 'GB'
    });

    const [orderResult] = await connection.execute(
      `
        INSERT INTO orders (user_id, cart_token, address_id, \`status\`, payment_status, amount_subtotal, shipping_amount, total_amount, currency)
        VALUES (?, ?, ?, 'pending_payment', 'unpaid', ?, 0, ?, ?)
      `,
      [userId, identity.cartToken || null, addressId, subtotal, subtotal, env.storeCurrency]
    );

    for (const item of cart.items) {
      await connection.execute(
        `
          INSERT INTO order_items (
            order_id, product_id, product_snapshot_name, product_snapshot_image_url, product_snapshot_sku, unit_price, quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderResult.insertId,
          item.product.id,
          displayName(item.product),
          item.product.image_url,
          item.product.sku,
          item.product.price,
          item.quantity
        ]
      );
    }

    return orderResult.insertId;
  });

  return {
    order_id: orderId,
    amount_subtotal: subtotal,
    rates: [],
    digital_only: true
  };
}

function assertOrderOwner(order, identity) {
  if (order.user_id && Number(order.user_id) !== Number(identity.userId)) {
    throw notFound('Order not found');
  }

  if (!order.user_id && order.cart_token && order.cart_token !== identity.cartToken) {
    throw notFound('Order not found');
  }
}

export async function createStripeCheckoutSession(orderId, shippingRateId, identity) {
  const result = await withTransaction(async (connection) => {
    const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    const order = orders[0];
    if (!order) {
      throw notFound('Order not found');
    }

    assertOrderOwner(order, identity);

    if (order.payment_status === 'paid') {
      throw conflict('Order is already paid');
    }

    const items = await getOrderItemsWithProducts(connection, orderId);
    const hasPhysicalItems = items.some((item) => item.product_type !== 'code_card');
    let rate = null;

    if (hasPhysicalItems) {
      if (!shippingRateId) {
        throw badRequest('shipping_rate_id is required for orders containing physical products');
      }

      const [rates] = await connection.execute('SELECT * FROM shipping_rates WHERE id = ? AND order_id = ?', [shippingRateId, orderId]);
      rate = rates[0];
      if (!rate) {
        throw badRequest('Selected shipping rate does not belong to this order');
      }
    } else if (shippingRateId) {
      throw badRequest('shipping_rate_id is not used for digital-only orders');
    }

    const subtotal = await validateOrderStockAndRefreshTotals(connection, orderId);
    const shippingAmount = money(rate?.amount || 0);
    const totalAmount = money(subtotal + shippingAmount);

    await connection.execute(
      `
        UPDATE orders
        SET selected_shipping_rate_id = ?, \`status\` = 'pending_payment', shipping_amount = ?, total_amount = ?, currency = ?
        WHERE id = ?
      `,
      [shippingRateId || null, shippingAmount, totalAmount, env.storeCurrency, orderId]
    );

    return {
      order: {
        ...order,
        amount_subtotal: subtotal,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        currency: env.storeCurrency
      },
      rate
    };
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: env.clientSuccessUrl,
    cancel_url: env.clientCancelUrl,
    metadata: {
      order_id: String(orderId)
    },
    payment_intent_data: {
      metadata: {
        order_id: String(orderId)
      }
    },
    line_items: [
      {
        price_data: {
          currency: env.storeCurrency,
          product_data: {
            name: `Pokemon TCG order #${orderId}`
          },
          unit_amount: stripeAmount(result.order.amount_subtotal)
        },
        quantity: 1
      },
      ...(result.rate ? [{
        price_data: {
          currency: env.storeCurrency,
          product_data: {
            name: `Shipping - ${result.rate.carrier} ${result.rate.service}`
          },
          unit_amount: stripeAmount(result.order.shipping_amount)
        },
        quantity: 1
      }] : [])
    ]
  });

  await query(
    `
      INSERT INTO stripe_payments (
        order_id, stripe_checkout_session_id, stripe_payment_intent_id, payment_status,
        amount_subtotal, shipping_amount, total_amount, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        stripe_checkout_session_id = VALUES(stripe_checkout_session_id),
        stripe_payment_intent_id = VALUES(stripe_payment_intent_id),
        payment_status = VALUES(payment_status),
        amount_subtotal = VALUES(amount_subtotal),
        shipping_amount = VALUES(shipping_amount),
        total_amount = VALUES(total_amount),
        currency = VALUES(currency)
    `,
    [
      orderId,
      session.id,
      session.payment_intent || null,
      session.payment_status || 'unpaid',
      result.order.amount_subtotal,
      result.order.shipping_amount,
      result.order.total_amount,
      env.storeCurrency
    ]
  );

  return {
    checkout_url: session.url,
    stripe_checkout_session_id: session.id,
    order_id: orderId
  };
}

async function markOrderPaid(connection, session) {
  const orderId = Number(session.metadata?.order_id);
  if (!orderId) {
    throw badRequest('Stripe session is missing order_id metadata');
  }

  const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
  const order = orders[0];
  if (!order) {
    throw notFound('Order not found for Stripe session');
  }

  await connection.execute(
    `
      UPDATE stripe_payments
      SET stripe_payment_intent_id = ?, payment_status = ?, amount_subtotal = ?, shipping_amount = ?, total_amount = ?
      WHERE order_id = ?
    `,
    [
      session.payment_intent || null,
      session.payment_status || 'paid',
      money((session.amount_subtotal || 0) / 100),
      order.shipping_amount,
      money((session.amount_total || 0) / 100),
      orderId
    ]
  );

  if (order.payment_status === 'paid') {
    return;
  }

  const items = await getOrderItemsWithProducts(connection, orderId);
  for (const item of items) {
    const [updateResult] = await connection.execute(
      "UPDATE products SET quantity = quantity - ?, `status` = CASE WHEN quantity - ? = 0 THEN 'sold_out' ELSE `status` END WHERE id = ? AND quantity >= ?",
      [item.quantity, item.quantity, item.product_id, item.quantity]
    );

    if (updateResult.affectedRows !== 1) {
      await connection.execute("UPDATE orders SET `status` = 'inventory_review', payment_status = 'paid' WHERE id = ?", [orderId]);
      throw conflict(`Insufficient stock while finalizing product ${item.product_id}`);
    }

    if (item.product_type === 'code_card') {
      await allocateCodeCardsForOrderItem(connection, item);
    }
  }

  await connection.execute("UPDATE orders SET `status` = 'paid', payment_status = 'paid' WHERE id = ?", [orderId]);
}

async function allocateCodeCardsForOrderItem(connection, item) {
  const [codes] = await connection.execute(
    `
      SELECT id
      FROM code_card_codes
      WHERE product_id = ? AND \`status\` = 'available'
      ORDER BY id ASC
      LIMIT ${Number(item.quantity)}
      FOR UPDATE
    `,
    [item.product_id]
  );

  if (codes.length < Number(item.quantity)) {
    throw conflict(`Insufficient unused code cards for product ${item.product_id}`);
  }

  for (const code of codes) {
    await connection.execute(
      `
        UPDATE code_card_codes
        SET \`status\` = 'delivered', allocated_order_item_id = ?, allocated_at = CURRENT_TIMESTAMP, delivered_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [item.id, code.id]
    );

    await connection.execute(
      'INSERT INTO order_item_codes (order_item_id, code_card_code_id) VALUES (?, ?)',
      [item.id, code.id]
    );
  }
}

export async function processStripeEvent(event) {
  await withTransaction(async (connection) => {
    try {
      await connection.execute(
        'INSERT INTO webhook_events (provider, event_id, event_type) VALUES (?, ?, ?)',
        ['stripe', event.id, event.type]
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return;
      }
      throw error;
    }

    if (event.type === 'checkout.session.completed') {
      await markOrderPaid(connection, event.data.object);
    }

    await connection.execute('UPDATE webhook_events SET processed_at = CURRENT_TIMESTAMP WHERE provider = ? AND event_id = ?', ['stripe', event.id]);
  });
}

export async function listOrders({ userId = null, admin = false } = {}) {
  const params = [];
  const where = [];

  if (!admin) {
    where.push('o.user_id = ?');
    params.push(userId);
  }

  const rows = await query(
    `
      SELECT
        o.*, a.full_name, a.email, a.city, a.state, a.country,
        sp.stripe_checkout_session_id, sp.stripe_payment_intent_id,
        sh.carrier AS shipment_carrier, sh.service AS shipment_service,
        sh.tracking_number, sh.label_url, sh.qr_code_url, sh.shipment_status
      FROM orders o
      JOIN addresses a ON a.id = o.address_id
      LEFT JOIN stripe_payments sp ON sp.order_id = o.id
      LEFT JOIN shipments sh ON sh.order_id = o.id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY o.created_at DESC
      LIMIT 100
    `,
    params
  );

  return rows;
}

export async function getOrderDetails(orderId, { userId = null, admin = false } = {}) {
  const params = [orderId];
  const userClause = admin ? '' : 'AND o.user_id = ?';
  if (!admin) params.push(userId);

  const orders = await query(
    `
      SELECT o.*, a.full_name, a.email, a.phone, a.street1, a.street2, a.city, a.state, a.postal_code, a.country,
        sp.stripe_checkout_session_id, sp.stripe_payment_intent_id,
        sh.shipment_id, sh.transaction_id, sh.carrier AS shipment_carrier, sh.service AS shipment_service,
        sh.rate_id AS shipment_rate_id, sh.tracking_number, sh.label_url, sh.qr_code_url, sh.shipment_status
      FROM orders o
      JOIN addresses a ON a.id = o.address_id
      LEFT JOIN stripe_payments sp ON sp.order_id = o.id
      LEFT JOIN shipments sh ON sh.order_id = o.id
      WHERE o.id = ? ${userClause}
      LIMIT 1
    `,
    params
  );

  const order = orders[0];
  if (!order) {
    throw notFound('Order not found');
  }

  const items = await query(
    `
      SELECT oi.*, p.product_type
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `,
    [orderId]
  );
  const rates = await query('SELECT * FROM shipping_rates WHERE order_id = ? ORDER BY amount ASC', [orderId]);

  if (order.payment_status === 'paid') {
    const codeRows = await query(
      `
        SELECT oic.order_item_id, ccc.code_ciphertext, ccc.code_iv, ccc.code_auth_tag
        FROM order_item_codes oic
        JOIN code_card_codes ccc ON ccc.id = oic.code_card_code_id
        JOIN order_items oi ON oi.id = oic.order_item_id
        WHERE oi.order_id = ?
        ORDER BY oic.id ASC
      `,
      [orderId]
    );

    const codesByItem = codeRows.reduce((groups, row) => {
      const code = decryptCodeValue({
        ciphertext: row.code_ciphertext,
        iv: row.code_iv,
        authTag: row.code_auth_tag
      });

      groups.set(row.order_item_id, [...(groups.get(row.order_item_id) || []), code]);
      return groups;
    }, new Map());

    for (const item of items) {
      item.delivered_codes = codesByItem.get(item.id) || [];
    }
  }

  return {
    ...order,
    items,
    rates
  };
}

export async function getOrderByStripeSession(sessionId) {
  const rows = await query('SELECT order_id FROM stripe_payments WHERE stripe_checkout_session_id = ?', [sessionId]);
  if (!rows.length) {
    throw notFound('Order not found for this Stripe session');
  }

  return getOrderDetails(rows[0].order_id, { admin: true });
}

export async function createOrderLabel(orderId) {
  const order = await getOrderDetails(orderId, { admin: true });

  if (order.payment_status !== 'paid') {
    throw badRequest('Shipping labels can only be generated for paid orders');
  }

  const selectedRate = order.rates.find((rate) => Number(rate.id) === Number(order.selected_shipping_rate_id));
  if (!selectedRate) {
    throw badRequest('Order does not have a selected shipping rate');
  }

  const label = await createShippoLabel(selectedRate.rate_id);

  await query(
    `
      INSERT INTO shipments (
        order_id, shipment_id, transaction_id, carrier, service, rate_id,
        tracking_number, label_url, qr_code_url, shipment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        shipment_id = VALUES(shipment_id),
        transaction_id = VALUES(transaction_id),
        carrier = VALUES(carrier),
        service = VALUES(service),
        rate_id = VALUES(rate_id),
        tracking_number = VALUES(tracking_number),
        label_url = VALUES(label_url),
        qr_code_url = VALUES(qr_code_url),
        shipment_status = VALUES(shipment_status)
    `,
    [
      orderId,
      selectedRate.shippo_shipment_id,
      label.transaction_id,
      selectedRate.carrier,
      selectedRate.service,
      selectedRate.rate_id,
      label.tracking_number,
      label.label_url,
      label.qr_code_url,
      label.shipment_status
    ]
  );

  await query("UPDATE orders SET `status` = 'label_created' WHERE id = ?", [orderId]);
  return getOrderDetails(orderId, { admin: true });
}

export async function markOrderPaidForLocalTesting(orderId) {
  if (env.nodeEnv === 'production') {
    throw forbidden('Local test payment override is disabled in production');
  }

  await withTransaction(async (connection) => {
    const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    const order = orders[0];
    if (!order) {
      throw notFound('Order not found');
    }

    await markOrderPaid(connection, {
      metadata: { order_id: String(orderId) },
      payment_intent: `local_test_${orderId}`,
      payment_status: 'paid',
      amount_subtotal: Math.round(Number(order.amount_subtotal || 0) * 100),
      amount_total: Math.round(Number(order.total_amount || 0) * 100)
    });
  });

  return getOrderDetails(orderId, { admin: true });
}

export async function updateOrderAndShipmentStatus(orderId, payload) {
  await withTransaction(async (connection) => {
    const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    const order = orders[0];
    if (!order) {
      throw notFound('Order not found');
    }

    const orderUpdates = [];
    const orderParams = [];

    if (payload.status !== undefined) {
      if (!ORDER_STATUSES.includes(payload.status)) {
        throw badRequest('Invalid order status');
      }
      orderUpdates.push('`status` = ?');
      orderParams.push(payload.status);
    }

    if (payload.payment_status !== undefined) {
      if (!PAYMENT_STATUSES.includes(payload.payment_status)) {
        throw badRequest('Invalid payment status');
      }
      orderUpdates.push('payment_status = ?');
      orderParams.push(payload.payment_status);
    }

    if (orderUpdates.length) {
      await connection.execute(`UPDATE orders SET ${orderUpdates.join(', ')} WHERE id = ?`, [...orderParams, orderId]);
    }

    if (payload.address) {
      const address = validateAddressPayload(payload.address);
      await connection.execute(
        `
          UPDATE addresses
          SET full_name = ?, email = ?, phone = ?, street1 = ?, street2 = ?, city = ?, state = ?, postal_code = ?, country = ?
          WHERE id = ?
        `,
        [
          address.full_name,
          address.email,
          address.phone || null,
          address.street1,
          address.street2 || null,
          address.city,
          address.state || '',
          address.postal_code,
          address.country,
          order.address_id
        ]
      );
    }

    const shipmentPayload = {};
    for (const field of SHIPMENT_FIELDS) {
      if (payload[field] !== undefined && payload[field] !== null && String(payload[field]).trim() !== '') {
        shipmentPayload[field] = String(payload[field]).trim();
      }
    }

    if (Object.keys(shipmentPayload).length) {
      const [shipments] = await connection.execute('SELECT id FROM shipments WHERE order_id = ? FOR UPDATE', [orderId]);
      const fields = Object.keys(shipmentPayload);
      const values = fields.map((field) => shipmentPayload[field]);

      if (shipments.length) {
        await connection.execute(
          `UPDATE shipments SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE order_id = ?`,
          [...values, orderId]
        );
      } else {
        const insertFields = ['order_id', ...fields];
        const insertValues = [orderId, ...values];
        await connection.execute(
          `INSERT INTO shipments (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
          insertValues
        );
      }
    }
  });

  return getOrderDetails(orderId, { admin: true });
}

export async function deleteOrder(orderId) {
  const order = await getOrderDetails(orderId, { admin: true });
  await query('DELETE FROM orders WHERE id = ?', [orderId]);
  return { id: order.id };
}
