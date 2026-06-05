INSERT INTO products (product_type, price, quantity, description, sku, barcode, tags, image_url, `status`)
VALUES (
  'sealed_product',
  149.99,
  8,
  'Pokémon TCG Scarlet & Violet Booster Box. Condition: New. Please review photos and product details before purchase.',
  'SEALED-SV-BOOSTER-BOX',
  '0820650853677',
  '["sealed","booster box","scarlet violet"]',
  NULL,
  'active'
);
SET @sealed1 = LAST_INSERT_ID();
INSERT INTO sealed_product_details (
  product_id, product_name, brand, category, set_name, release_year, sealed_condition,
  weight_grams, package_length_cm, package_width_cm, package_height_cm
) VALUES (
  @sealed1, 'Scarlet & Violet Booster Box', 'Pokemon', 'Booster Box', 'Scarlet & Violet', 2023, 'New',
  820, 13.8, 12.5, 7.5
);

INSERT INTO products (product_type, price, quantity, description, sku, barcode, tags, image_url, `status`)
VALUES (
  'sealed_product',
  54.99,
  12,
  'Pokémon TCG Paldea Evolved Elite Trainer Box. Condition: New. Please review photos and product details before purchase.',
  'SEALED-PE-ETB',
  '0820650853714',
  '["sealed","elite trainer box","paldea evolved"]',
  NULL,
  'active'
);
SET @sealed2 = LAST_INSERT_ID();
INSERT INTO sealed_product_details (
  product_id, product_name, brand, category, set_name, release_year, sealed_condition,
  weight_grams, package_length_cm, package_width_cm, package_height_cm
) VALUES (
  @sealed2, 'Paldea Evolved Elite Trainer Box', 'Pokemon', 'Elite Trainer Box', 'Paldea Evolved', 2023, 'New',
  720, 19.2, 17.1, 8.8
);

INSERT INTO products (product_type, price, quantity, description, sku, barcode, tags, image_url, `status`)
VALUES (
  'single_card',
  34.99,
  2,
  'Pokémon TCG Charizard ex from Obsidian Flames, card number 125/197. Condition: Near Mint. Language: English. Please review photos before purchase.',
  'SINGLE-OBF-125-CHARIZARD-EX',
  NULL,
  '["single","charizard","obsidian flames"]',
  NULL,
  'active'
);
SET @single1 = LAST_INSERT_ID();
INSERT INTO single_card_details (
  product_id, card_name, set_name, set_code, card_number, rarity, pokemon_type,
  `condition`, language, edition_or_variant, holo_type, grading_company, grade, is_graded
) VALUES (
  @single1, 'Charizard ex', 'Obsidian Flames', 'sv3', '125/197', 'Double Rare', 'Fire',
  'Near Mint', 'English', 'Standard', 'Holo', NULL, NULL, FALSE
);

INSERT INTO products (product_type, price, quantity, description, sku, barcode, tags, image_url, `status`)
VALUES (
  'single_card',
  19.99,
  3,
  'Pokémon TCG Pikachu from Crown Zenith, card number 160/159. Condition: Light Play. Language: English. Please review photos before purchase.',
  'SINGLE-CRZ-160-PIKACHU',
  NULL,
  '["single","pikachu","crown zenith"]',
  NULL,
  'active'
);
SET @single2 = LAST_INSERT_ID();
INSERT INTO single_card_details (
  product_id, card_name, set_name, set_code, card_number, rarity, pokemon_type,
  `condition`, language, edition_or_variant, holo_type, grading_company, grade, is_graded
) VALUES (
  @single2, 'Pikachu', 'Crown Zenith', 'swsh12pt5', '160/159', 'Secret Rare', 'Lightning',
  'Light Play', 'English', 'Galarian Gallery', 'Holo', NULL, NULL, FALSE
);
