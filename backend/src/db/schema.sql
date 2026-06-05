CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_type ENUM('single_card', 'sealed_product', 'code_card') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  description TEXT,
  sku VARCHAR(120) UNIQUE,
  barcode VARCHAR(120),
  tags JSON,
  image_url TEXT,
  `status` ENUM('draft', 'active', 'sold_out', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS code_card_details (
  product_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  code_card_name VARCHAR(255) NOT NULL,
  set_name VARCHAR(255),
  set_code VARCHAR(60),
  code_type VARCHAR(120) NOT NULL DEFAULT 'Pokemon TCG Live code',
  platform VARCHAR(120) NOT NULL DEFAULT 'Pokemon TCG Live',
  redemption_url VARCHAR(255) NOT NULL DEFAULT 'https://redeem.tcg.pokemon.com/',
  instructions TEXT,
  CONSTRAINT fk_code_card_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS code_card_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  code_ciphertext TEXT NOT NULL,
  code_iv VARCHAR(80) NOT NULL,
  code_auth_tag VARCHAR(80) NOT NULL,
  code_hash VARCHAR(64) NOT NULL UNIQUE,
  `status` ENUM('available', 'allocated', 'delivered', 'void') NOT NULL DEFAULT 'available',
  allocated_order_item_id BIGINT UNSIGNED,
  allocated_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_code_card_codes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS single_card_details (
  product_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  card_name VARCHAR(255) NOT NULL,
  set_name VARCHAR(255) NOT NULL,
  set_code VARCHAR(60),
  card_number VARCHAR(60),
  rarity VARCHAR(120),
  pokemon_type VARCHAR(120),
  `condition` ENUM('Mint', 'Near Mint', 'Light Play', 'Moderate Play', 'Heavy Play') NOT NULL,
  language VARCHAR(80) NOT NULL DEFAULT 'English',
  edition_or_variant VARCHAR(120),
  holo_type VARCHAR(120),
  grading_company VARCHAR(120),
  grade VARCHAR(60),
  is_graded BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_single_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sealed_product_details (
  product_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  brand VARCHAR(120) NOT NULL DEFAULT 'Pokemon',
  category VARCHAR(120) NOT NULL,
  set_name VARCHAR(255),
  release_year INT,
  sealed_condition ENUM('New', 'Seal Opened') NOT NULL,
  weight_grams DECIMAL(10, 2) NOT NULL,
  package_length_cm DECIMAL(10, 2) NOT NULL,
  package_width_cm DECIMAL(10, 2) NOT NULL,
  package_height_cm DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_sealed_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  cart_token VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_carts_user (user_id),
  UNIQUE KEY uq_carts_token (cart_token),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_product (cart_id, product_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(80),
  street1 VARCHAR(255) NOT NULL,
  street2 VARCHAR(255),
  city VARCHAR(120) NOT NULL,
  state VARCHAR(120) NOT NULL,
  postal_code VARCHAR(40) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'GB',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  cart_token VARCHAR(120),
  address_id BIGINT UNSIGNED NOT NULL,
  selected_shipping_rate_id BIGINT UNSIGNED,
  `status` ENUM('pending_shipping', 'pending_payment', 'paid', 'label_created', 'shipped', 'completed', 'cancelled', 'inventory_review') NOT NULL DEFAULT 'pending_shipping',
  payment_status ENUM('unpaid', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'unpaid',
  amount_subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'gbp',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_snapshot_name VARCHAR(255) NOT NULL,
  product_snapshot_image_url TEXT,
  product_snapshot_sku VARCHAR(120),
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS order_item_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_item_id BIGINT UNSIGNED NOT NULL,
  code_card_code_id BIGINT UNSIGNED NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_item_codes_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_item_codes_code FOREIGN KEY (code_card_code_id) REFERENCES code_card_codes(id)
);

CREATE TABLE IF NOT EXISTS shipping_rates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  shippo_shipment_id VARCHAR(120),
  carrier VARCHAR(120) NOT NULL,
  service VARCHAR(180) NOT NULL,
  rate_id VARCHAR(120) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'gbp',
  estimated_days INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_shipping_rate_id (rate_id),
  CONSTRAINT fk_shipping_rates_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shipments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL UNIQUE,
  shipment_id VARCHAR(120),
  transaction_id VARCHAR(120),
  carrier VARCHAR(120),
  service VARCHAR(180),
  rate_id VARCHAR(120),
  tracking_number VARCHAR(160),
  label_url TEXT,
  qr_code_url TEXT,
  shipment_status VARCHAR(120) NOT NULL DEFAULT 'created',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stripe_payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL UNIQUE,
  stripe_checkout_session_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  payment_status VARCHAR(80) NOT NULL DEFAULT 'unpaid',
  amount_subtotal DECIMAL(10, 2) NOT NULL,
  shipping_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'gbp',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stripe_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(60) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(120) NOT NULL,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_webhook_provider_event (provider, event_id)
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  source VARCHAR(120) NOT NULL DEFAULT 'homepage',
  marketing_consent BOOLEAN NOT NULL DEFAULT TRUE,
  unsubscribed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_type_status ON products(product_type, `status`);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_single_card_search ON single_card_details(card_name, set_name, set_code, card_number);
CREATE INDEX idx_sealed_search ON sealed_product_details(product_name, category, set_name);
CREATE INDEX idx_code_card_search ON code_card_details(code_card_name, set_name, set_code);
CREATE INDEX idx_code_card_codes_product_status ON code_card_codes(product_id, `status`);
CREATE INDEX idx_orders_user ON orders(user_id, created_at);
