import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../api/client.js';
import { money, productName, productSubtitle, statusLabel } from '../utils/product.js';
import ProductBasketControls from './ProductBasketControls.jsx';

export default function ProductCard({ product }) {
  const soldOut = product.quantity === 0 || product.status === 'sold_out';

  return (
    <article className="product-card">
      <Link className="product-card__image" to={`/products/${product.id}`}>
        {product.image_url ? (
          <img src={resolveImageUrl(product.image_url)} alt={productName(product)} />
        ) : (
          <span>No image</span>
        )}
      </Link>
      <div className="product-card__body">
        <div className="product-card__type">
          {product.product_type === 'single_card' ? 'Single card' : product.product_type === 'code_card' ? 'Code card' : 'Sealed product'}
        </div>
        <h3><Link to={`/products/${product.id}`}>{productName(product)}</Link></h3>
        <p>{productSubtitle(product)}</p>
        <div className="product-card__meta">
          <strong>{money(product.price)}</strong>
          <span className={soldOut ? 'stock stock--out' : product.quantity <= 3 ? 'stock stock--low' : 'stock'}>
            {statusLabel(product)}
          </span>
        </div>
        <ProductBasketControls product={product} />
      </div>
    </article>
  );
}
