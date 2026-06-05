import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi.js';
import { resolveImageUrl } from '../api/client.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import MailingListSignup from '../components/MailingListSignup.jsx';
import ProductBasketControls from '../components/ProductBasketControls.jsx';
import { money, productName, productSubtitle, statusLabel } from '../utils/product.js';
import heroMagicalRegionUrl from '../../images/hero-magical-region.png';

function countBy(products, keyGetter) {
  return products.reduce((items, product) => {
    const value = keyGetter(product);
    if (!value) return items;
    items.set(value, (items.get(value) || 0) + 1);
    return items;
  }, new Map());
}

function collectionUrl(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `/products?${query}` : '/products';
}

function productTypeLabel(product) {
  if (product.product_type === 'single_card') return 'Single';
  if (product.product_type === 'code_card') return 'Code card';
  return product.category || 'Sealed';
}

function HomeProductTools({ query, type, onQueryChange, onTypeChange, onReset }) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < 2 && !type) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      productApi.list({ search: trimmedQuery, type, limit: 6 })
        .then((data) => {
          setSuggestions(data.products || []);
          setOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 220);

    return () => clearTimeout(timer);
  }, [trimmedQuery, type]);

  function searchUrl() {
    const params = new URLSearchParams();
    if (trimmedQuery) params.set('search', trimmedQuery);
    if (type) params.set('type', type);
    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : '/products';
  }

  function submit(event) {
    event.preventDefault();
    navigate(searchUrl());
  }

  return (
    <div className="home-product-tools">
      <form className="home-search" onSubmit={submit}>
        <div className="home-search__field">
          <input
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search Charizard, VMAX, ETB, set name..."
            aria-label="Search products"
          />
          {open && (trimmedQuery.length >= 2 || type) && (
            <div className="home-search__suggestions">
              {loading && <div className="home-search__empty">Searching...</div>}
              {!loading && suggestions.length === 0 && <div className="home-search__empty">No matching stock found.</div>}
              {!loading && suggestions.map((product) => (
                <Link
                  className="home-search__suggestion"
                  key={product.id}
                  to={`/products/${product.id}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setOpen(false)}
                >
                  <span className="home-search__thumb">
                    {product.image_url && <img src={resolveImageUrl(product.image_url)} alt="" />}
                  </span>
                  <span>
                    <strong>{productName(product)}</strong>
                    <small>{productSubtitle(product)}</small>
                  </span>
                  <em>{money(product.price)}</em>
                </Link>
              ))}
              {!loading && suggestions.length > 0 && (
                <Link className="home-search__all" to={searchUrl()} onMouseDown={(event) => event.preventDefault()}>
                  View all matching stock
                </Link>
              )}
            </div>
          )}
        </div>
        <select value={type} onChange={(event) => onTypeChange(event.target.value)} aria-label="Product type">
          <option value="">All stock</option>
          <option value="single_card">Singles</option>
          <option value="sealed_product">Sealed</option>
          <option value="code_card">Code cards</option>
        </select>
        <button type="submit">View results</button>
        {(query || type) && (
          <button type="button" className="secondary" onClick={onReset}>Clear</button>
        )}
      </form>
    </div>
  );
}

function ProductStack({ products }) {
  return (
    <div className="home-product-stack">
      {products.slice(0, 4).map((product) => (
        <div key={product.id}>
          {product.image_url ? <img src={resolveImageUrl(product.image_url)} alt={productName(product)} /> : <span />}
        </div>
      ))}
    </div>
  );
}

function HomeProductCard({ product }) {
  return (
    <article className="home-product-card">
      <Link className="home-product-card__image" to={`/products/${product.id}`}>
        {product.image_url && <img src={resolveImageUrl(product.image_url)} alt={productName(product)} />}
      </Link>
      <div>
        <div className="home-product-card__meta">
          <span>{productTypeLabel(product)}</span>
          <b>{statusLabel(product)}</b>
        </div>
        <h3><Link to={`/products/${product.id}`}>{productName(product)}</Link></h3>
        <p>{productSubtitle(product)}</p>
        <div className="home-product-card__footer">
          <strong>{money(product.price)}</strong>
          <ProductBasketControls product={product} compact />
        </div>
      </div>
    </article>
  );
}

function CategoryPanel({ title, eyebrow, description, href, products, dark = false }) {
  return (
    <Link className={dark ? 'category-panel category-panel--dark' : 'category-panel'} to={href}>
      <ProductStack products={products} />
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [productSearch, setProductSearch] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const featuredPageSize = 8;

  useEffect(() => {
    productApi.list({ limit: 80 })
      .then((data) => setProducts(data.products))
      .catch(setError);
  }, []);

  useEffect(() => {
    setFeaturedPage(1);
  }, [products.length, productSearch, productTypeFilter]);

  const data = useMemo(() => {
    const sealed = products.filter((product) => product.product_type === 'sealed_product');
    const singles = products.filter((product) => product.product_type === 'single_card');
    const codeCards = products.filter((product) => product.product_type === 'code_card');
    const lowStock = products.filter((product) => product.quantity > 0 && product.quantity <= 3);
    const featured = [...lowStock, ...products.filter((product) => !lowStock.includes(product))];

    const sets = Array.from(countBy(products, (product) => product.set_name).entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const tags = Array.from(countBy(products.flatMap((product) => product.tags || []), (tag) => tag).entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      sealed,
      singles,
      codeCards,
      lowStock,
      featured,
      sets,
      tags,
      heroProducts: featured.length ? featured : products
    };
  }, [products]);

  const productSearchValue = productSearch.trim().toLowerCase();
  const filteredFeatured = data.featured.filter((product) => {
    if (productTypeFilter && product.product_type !== productTypeFilter) return false;
    if (!productSearchValue) return true;

    const searchable = [
      productName(product),
      productSubtitle(product),
      product.set_name,
      product.set_code,
      product.card_number,
      product.rarity,
      product.category,
      product.sku,
      product.barcode,
      ...(product.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();

    return searchable.includes(productSearchValue);
  });
  const totalFeaturedPages = Math.max(1, Math.ceil(filteredFeatured.length / featuredPageSize));
  const currentFeaturedPage = Math.min(featuredPage, totalFeaturedPages);
  const featuredStart = (currentFeaturedPage - 1) * featuredPageSize;
  const visibleFeatured = filteredFeatured.slice(featuredStart, featuredStart + featuredPageSize);

  return (
    <main className="home-page home-storefront">
      <section className="home-hero" style={{ '--hero-image': `url(${heroMagicalRegionUrl})` }}>
        <div className="home-hero__inner">
          <p className="eyebrow">Cannon Cards TCG</p>
          <h1>Step into the region.</h1>
          <p>Pokemon sealed stock, singles, and digital code cards for collectors across the UK.</p>
          <div className="home-hero__actions">
            <Link className="button" to="/products">Shop all products</Link>
            <Link className="button secondary" to={collectionUrl({ type: 'sealed_product' })}>Shop sealed</Link>
          </div>
        </div>
      </section>

      <section className="home-announcement">
        <span>Early access</span>
        <p>Join the mailing list for first dibs on pre-release allocations, restocks, and limited sealed drops.</p>
        <Link to="#mailing-list">Sign up</Link>
      </section>

      <div className="home-inner">
        <ErrorMessage error={error} />
        <section className="home-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Quick shop</p>
              <h2>Start with what you collect</h2>
            </div>
            <Link className="text-link" to="/products">Browse inventory</Link>
          </div>
          <div className="category-panel-grid">
            <CategoryPanel
              title="Sealed products"
              eyebrow="Booster boxes, ETBs, packs"
              description="Factory-sealed stock for ripping, collecting, or display."
              href={collectionUrl({ type: 'sealed_product' })}
              products={data.sealed}
              dark
            />
            <CategoryPanel
              title="Single cards"
              eyebrow="Raw and graded"
              description="Filter singles by set, condition, rarity, and price."
              href={collectionUrl({ type: 'single_card' })}
              products={data.singles}
            />
            <CategoryPanel
              title="Code cards"
              eyebrow="Digital delivery"
              description="Pokemon TCG Live codes delivered after payment."
              href={collectionUrl({ type: 'code_card' })}
              products={data.codeCards}
            />
            <CategoryPanel
              title="Low stock"
              eyebrow="Last few"
              description="Products with only a few left in inventory."
              href={collectionUrl({ stock_level: 'low' })}
              products={data.lowStock.length ? data.lowStock : data.featured}
              dark
            />
          </div>
        </section>

        <section className="home-section home-set-browser">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse expansions</p>
              <h2>Shop by set</h2>
            </div>
            <Link className="text-link" to="/products">All sets</Link>
          </div>
          <div className="set-chip-grid">
            {data.sets.map(([setName, count]) => (
              <Link to={collectionUrl({ set: setName })} key={setName}>
                <strong>{setName}</strong>
                <span>{count} item{count === 1 ? '' : 's'}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section featured-products-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured stock</p>
              <h2>Shop sealed products, singles, and code cards</h2>
            </div>
            <div className="actions">
              <Link className="text-link" to={collectionUrl({ search: productSearch.trim(), type: productTypeFilter })}>View all</Link>
            </div>
          </div>
          <HomeProductTools
            query={productSearch}
            type={productTypeFilter}
            onQueryChange={setProductSearch}
            onTypeChange={setProductTypeFilter}
            onReset={() => {
              setProductSearch('');
              setProductTypeFilter('');
            }}
          />
          <div className="home-featured-grid">
            {visibleFeatured.map((product) => <HomeProductCard product={product} key={product.id} />)}
          </div>
          {!visibleFeatured.length && (
            <div className="empty-state compact">No products match that homepage filter.</div>
          )}
          {totalFeaturedPages > 1 && (
            <div className="home-pagination" aria-label="Featured product pages">
              {Array.from({ length: totalFeaturedPages }, (_, index) => index + 1).map((page) => (
                <button
                  className={page === currentFeaturedPage ? 'is-active' : undefined}
                  key={page}
                  onClick={() => setFeaturedPage(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="home-section tag-collection-block">
          <div>
            <p className="eyebrow">Collection links</p>
            <h2>Popular tags</h2>
            <p>Tags work like sections, so the store can grow into pre-orders, Japanese stock, slabs, accessories, and set-specific drops.</p>
          </div>
          <div className="tag-rail">
            <Link to={collectionUrl({ type: 'sealed_product' })}>Sealed</Link>
            <Link to={collectionUrl({ type: 'single_card' })}>Singles</Link>
            {data.tags.map(([tag, count]) => (
              <Link to={collectionUrl({ tag })} key={tag}>
                <span>{tag}</span>
                <small>{count}</small>
              </Link>
            ))}
          </div>
        </section>

        <div id="mailing-list">
          <MailingListSignup />
        </div>
      </div>
    </main>
  );
}
