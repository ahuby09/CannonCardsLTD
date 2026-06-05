import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminProductApi } from '../api/productApi.js';
import AdminProductTable from '../components/AdminProductTable.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProductFilters from '../components/ProductFilters.jsx';

export default function AdminProductsPage() {
  const [filters, setFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    const data = await adminProductApi.list(filters);
    setProducts(data.products);
  }

  useEffect(() => {
    load().catch(setError);
  }, [filters]);

  async function remove(id) {
    if (!confirm('Delete this product? Products with order history should be archived instead.')) return;
    try {
      await adminProductApi.remove(id);
      await load();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <main className="page page--split">
      <aside>
        <ProductFilters filters={filters} onChange={setFilters} admin />
      </aside>
      <section>
        <div className="section-heading">
          <h1>Products</h1>
          <div className="actions">
            <Link className="button" to="/admin/products/new">New product</Link>
            <Link className="button secondary" to="/admin/singles/new">Autocomplete single</Link>
            <Link className="button secondary" to="/admin/code-cards/new">New code card</Link>
          </div>
        </div>
        <ErrorMessage error={error} />
        <AdminProductTable products={products} onDelete={remove} />
      </section>
    </main>
  );
}
