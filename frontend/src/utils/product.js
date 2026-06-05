export function productName(product) {
  if (!product) return '';
  if (product.product_type === 'single_card') return product.card_name;
  if (product.product_type === 'code_card') return product.code_card_name;
  return product.product_name;
}

export function productSubtitle(product) {
  if (!product) return '';
  if (product.product_type === 'single_card') {
    return [product.set_name, product.card_number, product.condition].filter(Boolean).join(' | ');
  }

  if (product.product_type === 'code_card') {
    return [product.platform, product.set_name, product.code_type].filter(Boolean).join(' | ');
  }

  return [product.category, product.set_name, product.sealed_condition].filter(Boolean).join(' | ');
}

export function money(value, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(Number(value || 0));
}

export function statusLabel(product) {
  if (product.quantity === 0 || product.status === 'sold_out') return 'Sold out';
  if (product.quantity <= 3) return 'Low stock';
  return 'In stock';
}
