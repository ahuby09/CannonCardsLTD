import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminProductApi } from '../api/productApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SingleCardAutocomplete from '../components/SingleCardAutocomplete.jsx';
import ProductImageUpload from '../components/ProductImageUpload.jsx';
import ProductGalleryUpload from '../components/ProductGalleryUpload.jsx';

const initialForm = {
  product_type: 'single_card',
  card_name: '',
  set_name: '',
  set_code: '',
  card_number: '',
  rarity: '',
  pokemon_type: '',
  image_url: '',
  gallery_images: [],
  condition: 'Near Mint',
  language: 'English',
  edition_or_variant: '',
  holo_type: '',
  grading_company: '',
  grade: '',
  is_graded: false,
  price: '',
  quantity: 1,
  description: '',
  sku: '',
  barcode: '',
  tags: '',
  status: 'draft'
};

function description(form) {
  return `Pokémon TCG ${form.card_name} from ${form.set_name}, card number ${form.card_number}. Condition: ${form.condition}. Language: ${form.language}. Please review photos before purchase.`;
}

export default function AdminSinglesListingPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  function selectCard(card) {
    setForm({
      ...form,
      card_name: card.card_name || '',
      set_name: card.set_name || '',
      set_code: card.set_code || '',
      card_number: card.card_number || '',
      rarity: card.rarity || '',
      pokemon_type: card.pokemon_type || '',
      image_url: card.image_url || form.image_url,
      price: card.suggested_market_price || form.price,
      description: card.draft_description || form.description
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError(null);

    try {
      const payload = {
        ...form,
        description: form.description || description(form)
      };
      await adminProductApi.create(payload);
      navigate('/admin/products');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <main className="page narrow">
      <form className="admin-form" onSubmit={submit}>
        <div className="section-heading">
          <h1>List Pokemon single</h1>
          <button>Create listing</button>
        </div>
        <SingleCardAutocomplete onSelect={selectCard} />
        <ErrorMessage error={error} />

        <div className="form-grid">
          <label>
            Card name
            <input value={form.card_name} onChange={(event) => update('card_name', event.target.value)} required />
          </label>
          <label>
            Set name
            <input value={form.set_name} onChange={(event) => update('set_name', event.target.value)} required />
          </label>
          <label>
            Set code
            <input value={form.set_code} onChange={(event) => update('set_code', event.target.value)} />
          </label>
          <label>
            Card number
            <input value={form.card_number} onChange={(event) => update('card_number', event.target.value)} />
          </label>
          <label>
            Rarity
            <input value={form.rarity} onChange={(event) => update('rarity', event.target.value)} />
          </label>
          <label>
            Pokemon type
            <input value={form.pokemon_type} onChange={(event) => update('pokemon_type', event.target.value)} />
          </label>
          <label>
            Condition
            <select value={form.condition} onChange={(event) => update('condition', event.target.value)}>
              <option>Mint</option>
              <option>Near Mint</option>
              <option>Light Play</option>
              <option>Moderate Play</option>
              <option>Heavy Play</option>
            </select>
          </label>
          <label>
            Language
            <input value={form.language} onChange={(event) => update('language', event.target.value)} />
          </label>
          <label>
            Variant
            <input value={form.edition_or_variant} onChange={(event) => update('edition_or_variant', event.target.value)} />
          </label>
          <label>
            Holo type
            <input value={form.holo_type} onChange={(event) => update('holo_type', event.target.value)} />
          </label>
          <label>
            Grading company
            <input value={form.grading_company} onChange={(event) => update('grading_company', event.target.value)} />
          </label>
          <label>
            Grade
            <input value={form.grade} onChange={(event) => update('grade', event.target.value)} />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.is_graded} onChange={(event) => update('is_graded', event.target.checked)} />
            Graded card
          </label>
          <label>
            Price
            <input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => update('price', event.target.value)} required />
          </label>
          <label>
            Quantity
            <input type="number" min="0" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} required />
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
            <input value={form.sku} onChange={(event) => update('sku', event.target.value)} />
          </label>
          <ProductImageUpload value={form.image_url} onChange={(imageUrl) => update('image_url', imageUrl)} />
          <ProductGalleryUpload value={form.gallery_images} onChange={(images) => update('gallery_images', images)} />
          <label className="wide">
            Tags
            <input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="charizard, single, obsidian flames" />
          </label>
          <label className="wide">
            Description
            <textarea rows="4" value={form.description} onChange={(event) => update('description', event.target.value)} />
          </label>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={() => update('description', description(form))}>Generate description</button>
          <button>Create listing</button>
        </div>
      </form>
    </main>
  );
}
