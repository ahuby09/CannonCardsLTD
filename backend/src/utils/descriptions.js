export function generateSingleCardDescription(product) {
  return `Pokémon TCG ${product.card_name} from ${product.set_name}, card number ${product.card_number}. Condition: ${product.condition}. Language: ${product.language}. Please review photos before purchase.`;
}

export function generateSealedProductDescription(product) {
  return `Pokémon TCG ${product.product_name}. Condition: ${product.sealed_condition}. Please review photos and product details before purchase.`;
}
