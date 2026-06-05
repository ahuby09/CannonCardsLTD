import { query, withTransaction } from '../config/db.js';
import { conflict, notFound } from '../utils/errors.js';
import { encryptCodeValue, hashCodeValue } from '../utils/codeCrypto.js';

const PRODUCT_COLUMNS = `
  p.id, p.product_type, p.price, p.quantity, p.description, p.sku, p.barcode, p.tags, p.image_url, p.\`status\` AS status,
  p.created_at, p.updated_at,
  sc.card_name, sc.set_name AS single_set_name, sc.set_code, sc.card_number, sc.rarity, sc.pokemon_type,
  sc.condition, sc.language, sc.edition_or_variant, sc.holo_type, sc.grading_company, sc.grade, sc.is_graded,
  sp.product_name, sp.brand, sp.category, sp.set_name AS sealed_set_name, sp.release_year, sp.sealed_condition,
  sp.weight_grams, sp.package_length_cm, sp.package_width_cm, sp.package_height_cm,
  cc.code_card_name, cc.set_name AS code_set_name, cc.set_code AS code_set_code, cc.code_type, cc.platform,
  cc.redemption_url, cc.instructions
`;

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;

  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

export function mapProduct(row) {
  if (!row) return null;

  const product = {
    id: row.id,
    product_type: row.product_type,
    price: Number(row.price),
    quantity: row.quantity,
    description: row.description,
    sku: row.sku,
    barcode: row.barcode,
    tags: parseTags(row.tags),
    image_url: row.image_url,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };

  if (row.product_type === 'single_card') {
    return {
      ...product,
      card_name: row.card_name,
      set_name: row.single_set_name,
      set_code: row.set_code,
      card_number: row.card_number,
      rarity: row.rarity,
      pokemon_type: row.pokemon_type,
      condition: row.condition,
      language: row.language,
      edition_or_variant: row.edition_or_variant,
      holo_type: row.holo_type,
      grading_company: row.grading_company,
      grade: row.grade,
      is_graded: Boolean(row.is_graded),
      display_name: row.card_name
    };
  }

  if (row.product_type === 'code_card') {
    return {
      ...product,
      code_card_name: row.code_card_name,
      set_name: row.code_set_name,
      set_code: row.code_set_code,
      code_type: row.code_type,
      platform: row.platform,
      redemption_url: row.redemption_url,
      instructions: row.instructions,
      display_name: row.code_card_name
    };
  }

  return {
    ...product,
    product_name: row.product_name,
    brand: row.brand,
    category: row.category,
    set_name: row.sealed_set_name,
    release_year: row.release_year,
    sealed_condition: row.sealed_condition,
    weight_grams: Number(row.weight_grams),
    package_length_cm: Number(row.package_length_cm),
    package_width_cm: Number(row.package_width_cm),
    package_height_cm: Number(row.package_height_cm),
    display_name: row.product_name
  };
}

async function getGalleryImages(productId) {
  return query(
    `
      SELECT id, image_url, alt_text, sort_order
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [productId]
  );
}

async function attachImages(product) {
  const galleryRows = await getGalleryImages(product.id);
  const galleryImages = galleryRows.map((image) => image.image_url);
  const images = [];

  if (product.image_url) {
    images.push({
      image_url: product.image_url,
      alt_text: product.display_name || 'Product image',
      primary: true
    });
  }

  for (const image of galleryRows) {
    if (image.image_url === product.image_url) continue;
    images.push({
      id: image.id,
      image_url: image.image_url,
      alt_text: image.alt_text,
      sort_order: image.sort_order,
      primary: false
    });
  }

  return {
    ...product,
    gallery_images: galleryImages,
    images
  };
}

async function replaceGalleryImages(connection, productId, imageUrls = []) {
  await connection.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);

  for (const [index, imageUrl] of imageUrls.entries()) {
    await connection.execute(
      'INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES (?, ?, ?, ?)',
      [productId, imageUrl, null, index]
    );
  }
}

async function addCodeInventory(connection, productId, codes = []) {
  for (const code of codes) {
    const encrypted = encryptCodeValue(code);
    const codeHash = hashCodeValue(code);

    try {
      await connection.execute(
        `
          INSERT INTO code_card_codes (product_id, code_ciphertext, code_iv, code_auth_tag, code_hash)
          VALUES (?, ?, ?, ?, ?)
        `,
        [productId, encrypted.ciphertext, encrypted.iv, encrypted.authTag, codeHash]
      );
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') {
        throw error;
      }
    }
  }
}

async function refreshCodeProductQuantity(connection, productId) {
  const [rows] = await connection.execute(
    "SELECT COUNT(*) AS count FROM code_card_codes WHERE product_id = ? AND `status` = 'available'",
    [productId]
  );
  const quantity = Number(rows[0]?.count || 0);
  await connection.execute(
    "UPDATE products SET quantity = ?, `status` = CASE WHEN ? = 0 AND `status` = 'active' THEN 'sold_out' ELSE `status` END WHERE id = ?",
    [quantity, quantity, productId]
  );
}

function addWhere(where, params, clause, ...values) {
  where.push(clause);
  params.push(...values);
}

export async function listProducts(filters = {}, { admin = false } = {}) {
  const where = [];
  const params = [];

  if (!admin) {
    addWhere(where, params, 'p.`status` = ?', 'active');
  } else if (filters.status) {
    addWhere(where, params, 'p.`status` = ?', filters.status);
  }

  if (filters.type) {
    addWhere(where, params, 'p.product_type = ?', filters.type);
  }

  if (filters.search) {
    const value = `%${filters.search}%`;
    addWhere(
      where,
      params,
      '(sc.card_name LIKE ? OR sp.product_name LIKE ? OR cc.code_card_name LIKE ? OR sc.set_name LIKE ? OR sp.set_name LIKE ? OR cc.set_name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)',
      value,
      value,
      value,
      value,
      value,
      value,
      value,
      value
    );
  }

  if (filters.set) {
    const value = `%${filters.set}%`;
    addWhere(where, params, '(sc.set_name LIKE ? OR sc.set_code LIKE ? OR sp.set_name LIKE ? OR cc.set_name LIKE ? OR cc.set_code LIKE ?)', value, value, value, value, value);
  }

  if (filters.condition) {
    addWhere(where, params, 'sc.condition = ?', filters.condition);
  }

  if (filters.sealed_condition) {
    addWhere(where, params, 'sp.sealed_condition = ?', filters.sealed_condition);
  }

  if (filters.rarity) {
    addWhere(where, params, 'sc.rarity LIKE ?', `%${filters.rarity}%`);
  }

  if (filters.category) {
    addWhere(where, params, 'sp.category LIKE ?', `%${filters.category}%`);
  }

  if (filters.tag) {
    addWhere(where, params, "JSON_SEARCH(p.tags, 'one', ?) IS NOT NULL", filters.tag);
  }

  if (filters.min_price !== null && filters.min_price !== undefined) {
    addWhere(where, params, 'p.price >= ?', filters.min_price);
  }

  if (filters.max_price !== null && filters.max_price !== undefined) {
    addWhere(where, params, 'p.price <= ?', filters.max_price);
  }

  if (filters.stock_level === 'low') {
    addWhere(where, params, 'p.quantity > 0 AND p.quantity <= 3');
  } else if (filters.stock_level === 'sold_out') {
    addWhere(where, params, '(p.quantity = 0 OR p.`status` = ?)', 'sold_out');
  } else if (filters.stock_level === 'in_stock') {
    addWhere(where, params, 'p.quantity > 0');
  }

  const limit = Math.min(Math.max(Number.parseInt(filters.limit || 60, 10) || 60, 1), 100);
  const offset = Math.max(Number.parseInt(filters.offset || 0, 10) || 0, 0);

  const sql = `
    SELECT ${PRODUCT_COLUMNS}
    FROM products p
    LEFT JOIN single_card_details sc ON sc.product_id = p.id
    LEFT JOIN sealed_product_details sp ON sp.product_id = p.id
    LEFT JOIN code_card_details cc ON cc.product_id = p.id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const rows = await query(sql, params);
  return rows.map(mapProduct);
}

export async function getProductById(id, { admin = false } = {}) {
  const rows = await query(
    `
      SELECT ${PRODUCT_COLUMNS}
      FROM products p
      LEFT JOIN single_card_details sc ON sc.product_id = p.id
      LEFT JOIN sealed_product_details sp ON sp.product_id = p.id
      LEFT JOIN code_card_details cc ON cc.product_id = p.id
      WHERE p.id = ? ${admin ? '' : "AND p.`status` = 'active'"}
      LIMIT 1
    `,
    [id]
  );

  const product = mapProduct(rows[0]);
  if (!product) {
    throw notFound('Product not found');
  }

  return attachImages(product);
}

async function insertDetails(connection, productId, product) {
  if (product.product_type === 'single_card') {
    const details = product.details;
    await connection.execute(
      `
        INSERT INTO single_card_details (
          product_id, card_name, set_name, set_code, card_number, rarity, pokemon_type, \`condition\`,
          language, edition_or_variant, holo_type, grading_company, grade, is_graded
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        productId,
        details.card_name,
        details.set_name,
        details.set_code,
        details.card_number,
        details.rarity,
        details.pokemon_type,
        details.condition,
        details.language,
        details.edition_or_variant,
        details.holo_type,
        details.grading_company,
        details.grade,
        details.is_graded
      ]
    );
    return;
  }

  if (product.product_type === 'code_card') {
    const details = product.details;
    await connection.execute(
      `
        INSERT INTO code_card_details (
          product_id, code_card_name, set_name, set_code, code_type, platform, redemption_url, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        productId,
        details.code_card_name,
        details.set_name,
        details.set_code,
        details.code_type,
        details.platform,
        details.redemption_url,
        details.instructions
      ]
    );
    return;
  }

  const details = product.details;
  await connection.execute(
    `
      INSERT INTO sealed_product_details (
        product_id, product_name, brand, category, set_name, release_year, sealed_condition,
        weight_grams, package_length_cm, package_width_cm, package_height_cm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      productId,
      details.product_name,
      details.brand,
      details.category,
      details.set_name,
      details.release_year,
      details.sealed_condition,
      details.weight_grams,
      details.package_length_cm,
      details.package_width_cm,
      details.package_height_cm
    ]
  );
}

export async function createProduct(product) {
  const productId = await withTransaction(async (connection) => {
    const [result] = await connection.execute(
      `
        INSERT INTO products (product_type, price, quantity, description, sku, barcode, tags, image_url, \`status\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        product.product_type,
        product.price,
        product.quantity,
        product.description,
        product.sku,
        product.barcode,
        JSON.stringify(product.tags),
        product.image_url,
        product.status
      ]
    );

    await insertDetails(connection, result.insertId, product);
    await replaceGalleryImages(connection, result.insertId, product.gallery_images);
    if (product.product_type === 'code_card') {
      await addCodeInventory(connection, result.insertId, product.new_codes);
      await refreshCodeProductQuantity(connection, result.insertId);
    }
    return result.insertId;
  });

  return getProductById(productId, { admin: true });
}

export async function updateProduct(id, product) {
  await getProductById(id, { admin: true });

  await withTransaction(async (connection) => {
    await connection.execute(
      `
        UPDATE products
        SET product_type = ?, price = ?, quantity = ?, description = ?, sku = ?, barcode = ?,
            tags = ?, image_url = ?, \`status\` = ?
        WHERE id = ?
      `,
      [
        product.product_type,
        product.price,
        product.quantity,
        product.description,
        product.sku,
        product.barcode,
        JSON.stringify(product.tags),
        product.image_url,
        product.status,
        id
      ]
    );

    await connection.execute('DELETE FROM single_card_details WHERE product_id = ?', [id]);
    await connection.execute('DELETE FROM sealed_product_details WHERE product_id = ?', [id]);
    await connection.execute('DELETE FROM code_card_details WHERE product_id = ?', [id]);
    await insertDetails(connection, id, product);
    await replaceGalleryImages(connection, id, product.gallery_images);
    if (product.product_type === 'code_card') {
      await addCodeInventory(connection, id, product.new_codes);
      await refreshCodeProductQuantity(connection, id);
    }
  });

  return getProductById(id, { admin: true });
}

export async function deleteProduct(id) {
  const orders = await query('SELECT COUNT(*) AS count FROM order_items WHERE product_id = ?', [id]);
  if (orders[0].count > 0) {
    throw conflict('This product has order history. Archive it instead of deleting it.');
  }

  const result = await query('DELETE FROM products WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw notFound('Product not found');
  }

  return { ok: true };
}

export async function updateInventory(id, { quantity, status }) {
  const current = await getProductById(id, { admin: true });
  const nextStatus = status || (quantity === 0 ? 'sold_out' : current.status === 'sold_out' ? 'active' : current.status);

  await query('UPDATE products SET quantity = ?, `status` = ? WHERE id = ?', [quantity, nextStatus, id]);
  return getProductById(id, { admin: true });
}
