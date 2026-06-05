import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../api/productApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProductImageSlider from '../components/ProductImageSlider.jsx';
import ProductBasketControls from '../components/ProductBasketControls.jsx';
import { money, productName, productSubtitle } from '../utils/product.js';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    productApi.get(id)
      .then((data) => setProduct(data.product))
      .catch(setError);
  }, [id]);

  if (error) return <main className="page"><ErrorMessage error={error} /></main>;
  if (!product) return <main className="page"><div className="empty-state">Loading product...</div></main>;

  return (
    <main className="page product-detail">
      <ProductImageSlider product={product} />
      <section>
        <p className="eyebrow">{product.product_type === 'single_card' ? 'Single card' : product.product_type === 'code_card' ? 'Digital code card' : 'Sealed product'}</p>
        <h1>{productName(product)}</h1>
        <p>{productSubtitle(product)}</p>
        <strong className="price">{money(product.price)}</strong>
        <p>{product.description}</p>

        <div className="product-warning">
          <strong>Collector product warning</strong>
          <p>
            Trading card products are collectible goods. Sealed products do not guarantee specific pulls or resale value.
            Small parts and packaging are not suitable for children under 3. <Link to="/legal/product-warnings">Read product warnings</Link>.
          </p>
        </div>

        <dl className="details-list">
          {product.product_type === 'single_card' ? (
            <>
              <div><dt>Rarity</dt><dd>{product.rarity || '-'}</dd></div>
              <div><dt>Type</dt><dd>{product.pokemon_type || '-'}</dd></div>
              <div><dt>Language</dt><dd>{product.language}</dd></div>
              <div><dt>Variant</dt><dd>{product.edition_or_variant || '-'}</dd></div>
              <div><dt>Graded</dt><dd>{product.is_graded ? `${product.grading_company} ${product.grade}` : 'No'}</dd></div>
            </>
          ) : product.product_type === 'code_card' ? (
            <>
              <div><dt>Platform</dt><dd>{product.platform || 'Pokemon TCG Live'}</dd></div>
              <div><dt>Code type</dt><dd>{product.code_type || '-'}</dd></div>
              <div><dt>Set</dt><dd>{product.set_name || '-'}</dd></div>
              <div><dt>Delivery</dt><dd>Instant after payment</dd></div>
              <div><dt>Redeem</dt><dd>{product.redemption_url || '-'}</dd></div>
            </>
          ) : (
            <>
              <div><dt>Brand</dt><dd>{product.brand}</dd></div>
              <div><dt>Category</dt><dd>{product.category}</dd></div>
              <div><dt>Release year</dt><dd>{product.release_year || '-'}</dd></div>
              <div><dt>Condition</dt><dd>{product.sealed_condition}</dd></div>
            </>
          )}
          <div><dt>SKU</dt><dd>{product.sku || '-'}</dd></div>
          <div><dt>Stock</dt><dd>{product.quantity}</dd></div>
        </dl>

        <div className="actions">
          <ProductBasketControls product={product} />
          <Link className="button secondary" to="/cart">View basket</Link>
        </div>
      </section>
    </main>
  );
}
