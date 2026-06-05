import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi.js';
import ProductFilters from '../components/ProductFilters.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const FILTER_KEYS = [
  'search',
  'type',
  'set',
  'condition',
  'sealed_condition',
  'rarity',
  'category',
  'tag',
  'stock_level',
  'min_price',
  'max_price'
];

function filtersFromParams(searchParams) {
  return FILTER_KEYS.reduce((filters, key) => {
    const value = searchParams.get(key);
    if (value) filters[key] = value;
    return filters;
  }, {});
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    productApi.list(filters)
      .then((data) => setProducts(data.products))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [filters]);

  function updateFilters(nextFilters) {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }

  return (
    <main className="page page--split">
      <aside>
        <ProductFilters filters={filters} onChange={updateFilters} />
      </aside>
      <section>
        <div className="section-heading">
          <h1>Products</h1>
          {loading && <span>Loading...</span>}
        </div>
        <ErrorMessage error={error} />
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
