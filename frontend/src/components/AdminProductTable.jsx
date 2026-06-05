import { Link } from 'react-router-dom';
import { money, productName, productSubtitle } from '../utils/product.js';

export default function AdminProductTable({ products, onDelete }) {
  if (!products.length) {
    return <div className="empty-state">No products found.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Type</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className={product.quantity <= 3 ? 'low-stock-row' : ''}>
              <td>
                <strong>{productName(product)}</strong>
                <small>{productSubtitle(product)}</small>
              </td>
              <td>{product.product_type === 'single_card' ? 'Single' : product.product_type === 'code_card' ? 'Code card' : 'Sealed'}</td>
              <td>{money(product.price)}</td>
              <td>{product.quantity}</td>
              <td>{product.status}</td>
              <td className="row-actions">
                <Link className="button secondary" to={`/admin/products/${product.id}/edit`}>Edit</Link>
                <button className="danger" onClick={() => onDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
