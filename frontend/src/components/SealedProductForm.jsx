export default function SealedProductForm({ form, onChange }) {
  function update(key, value) {
    onChange({ ...form, [key]: value });
  }

  return (
    <>
      <label>
        Product name
        <input value={form.product_name || ''} onChange={(event) => update('product_name', event.target.value)} required />
      </label>
      <label>
        Brand
        <input value={form.brand || 'Pokemon'} onChange={(event) => update('brand', event.target.value)} />
      </label>
      <label>
        Category
        <input value={form.category || ''} onChange={(event) => update('category', event.target.value)} placeholder="Booster Box, ETB, Tin" required />
      </label>
      <label>
        Set name
        <input value={form.set_name || ''} onChange={(event) => update('set_name', event.target.value)} />
      </label>
      <label>
        Release year
        <input type="number" value={form.release_year || ''} onChange={(event) => update('release_year', event.target.value)} />
      </label>
      <label>
        Sealed condition
        <select value={form.sealed_condition || 'New'} onChange={(event) => update('sealed_condition', event.target.value)}>
          <option>New</option>
          <option>Seal Opened</option>
        </select>
      </label>
      <label>
        Weight grams
        <input type="number" min="1" step="0.01" value={form.weight_grams || ''} onChange={(event) => update('weight_grams', event.target.value)} required />
      </label>
      <label>
        Length cm
        <input type="number" min="1" step="0.01" value={form.package_length_cm || ''} onChange={(event) => update('package_length_cm', event.target.value)} required />
      </label>
      <label>
        Width cm
        <input type="number" min="1" step="0.01" value={form.package_width_cm || ''} onChange={(event) => update('package_width_cm', event.target.value)} required />
      </label>
      <label>
        Height cm
        <input type="number" min="1" step="0.01" value={form.package_height_cm || ''} onChange={(event) => update('package_height_cm', event.target.value)} required />
      </label>
    </>
  );
}
