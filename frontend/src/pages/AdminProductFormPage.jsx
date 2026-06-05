import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminProductApi } from '../api/productApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SealedProductForm from '../components/SealedProductForm.jsx';
import ProductImageUpload from '../components/ProductImageUpload.jsx';
import ProductGalleryUpload from '../components/ProductGalleryUpload.jsx';
import CodeCardProductForm from '../components/CodeCardProductForm.jsx';

const emptyProduct = {
  product_type: 'sealed_product',
  price: '',
  quantity: 1,
  status: 'draft',
  sku: '',
  barcode: '',
  tags: '',
  image_url: '',
  gallery_images: [],
  description: '',
  brand: 'Pokemon',
  sealed_condition: 'New',
  condition: 'Near Mint',
  language: 'English',
  is_graded: false,
  code_type: 'Pokemon TCG Live code',
  platform: 'Pokemon TCG Live',
  redemption_url: 'https://redeem.tcg.pokemon.com/',
  instructions: 'Redeem this one-time code in Pokemon TCG Live.',
  codes_text: ''
};

function generatedDescription(form) {
  if (form.product_type === 'code_card') {
    return `Pokemon TCG Live ${form.code_card_name || ''}. Digital code delivered after payment. Redeem at ${form.redemption_url || 'https://redeem.tcg.pokemon.com/'}.`;
  }

  if (form.product_type === 'single_card') {
    return `Pokemon TCG ${form.card_name || ''} from ${form.set_name || ''}, card number ${form.card_number || ''}. Condition: ${form.condition || ''}. Language: ${form.language || 'English'}. Please review photos before purchase.`;
  }

  return `Pokemon TCG ${form.product_name || ''}. Condition: ${form.sealed_condition || ''}. Please review photos and product details before purchase.`;
}

export default function AdminProductFormPage({ defaultType = 'sealed_product' }) {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...emptyProduct, product_type: defaultType });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!editing) return;

    adminProductApi.get(id)
      .then((data) => setForm({
        ...emptyProduct,
        ...data.product,
        tags: (data.product.tags || []).join(', '),
        gallery_images: data.product.gallery_images || []
      }))
      .catch(setError);
  }, [editing, id]);

  const title = useMemo(() => editing ? 'Edit product' : defaultType === 'code_card' ? 'New code card' : 'New product', [editing, defaultType]);

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setError(null);

    try {
      const payload = { ...form, tags: form.tags };
      if (editing) {
        await adminProductApi.update(id, payload);
      } else {
        await adminProductApi.create(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <main className="page narrow">
      <form className="admin-form" onSubmit={submit}>
        <div className="section-heading">
          <h1>{title}</h1>
          <button>Save product</button>
        </div>
        <ErrorMessage error={error} />

        <div className="form-grid">
          <label>
            Product type
            <select value={form.product_type} onChange={(event) => update('product_type', event.target.value)}>
              <option value="sealed_product">Sealed product</option>
              <option value="single_card">Single card</option>
              <option value="code_card">Code card</option>
            </select>
          </label>
          <label>
            Price
            <input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => update('price', event.target.value)} required />
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(event) => update('quantity', event.target.value)}
              disabled={form.product_type === 'code_card'}
              required
            />
            {form.product_type === 'code_card' && <small>Calculated from unused uploaded codes after save.</small>}
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => update('status', event.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="sold_out">Sold out</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            SKU
            <input value={form.sku || ''} onChange={(event) => update('sku', event.target.value)} />
          </label>
          <label>
            Barcode
            <input value={form.barcode || ''} onChange={(event) => update('barcode', event.target.value)} />
          </label>
          <label className="wide">
            Tags
            <input value={form.tags || ''} onChange={(event) => update('tags', event.target.value)} placeholder="booster box, sealed" />
          </label>
          <ProductImageUpload value={form.image_url || ''} onChange={(imageUrl) => update('image_url', imageUrl)} />
          <ProductGalleryUpload value={form.gallery_images || []} onChange={(images) => update('gallery_images', images)} />

          {form.product_type === 'single_card' ? (
            <>
              <label>
                Card name
                <input value={form.card_name || ''} onChange={(event) => update('card_name', event.target.value)} required />
              </label>
              <label>
                Set name
                <input value={form.set_name || ''} onChange={(event) => update('set_name', event.target.value)} required />
              </label>
              <label>
                Set code
                <input value={form.set_code || ''} onChange={(event) => update('set_code', event.target.value)} />
              </label>
              <label>
                Card number
                <input value={form.card_number || ''} onChange={(event) => update('card_number', event.target.value)} />
              </label>
              <label>
                Rarity
                <input value={form.rarity || ''} onChange={(event) => update('rarity', event.target.value)} />
              </label>
              <label>
                Pokemon type
                <input value={form.pokemon_type || ''} onChange={(event) => update('pokemon_type', event.target.value)} />
              </label>
              <label>
                Condition
                <select value={form.condition || 'Near Mint'} onChange={(event) => update('condition', event.target.value)}>
                  <option>Mint</option>
                  <option>Near Mint</option>
                  <option>Light Play</option>
                  <option>Moderate Play</option>
                  <option>Heavy Play</option>
                </select>
              </label>
              <label>
                Language
                <input value={form.language || 'English'} onChange={(event) => update('language', event.target.value)} />
              </label>
              <label>
                Variant
                <input value={form.edition_or_variant || ''} onChange={(event) => update('edition_or_variant', event.target.value)} />
              </label>
              <label>
                Holo type
                <input value={form.holo_type || ''} onChange={(event) => update('holo_type', event.target.value)} />
              </label>
              <label>
                Grading company
                <input value={form.grading_company || ''} onChange={(event) => update('grading_company', event.target.value)} />
              </label>
              <label>
                Grade
                <input value={form.grade || ''} onChange={(event) => update('grade', event.target.value)} />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={Boolean(form.is_graded)} onChange={(event) => update('is_graded', event.target.checked)} />
                Graded card
              </label>
            </>
          ) : form.product_type === 'code_card' ? (
            <CodeCardProductForm form={form} onChange={setForm} />
          ) : (
            <SealedProductForm form={form} onChange={setForm} />
          )}

          <label className="wide">
            Description
            <textarea value={form.description || ''} onChange={(event) => update('description', event.target.value)} rows="4" />
          </label>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={() => update('description', generatedDescription(form))}>
            Generate description
          </button>
          <button>Save product</button>
        </div>
      </form>
    </main>
  );
}
