export default function AddressForm({ value, onChange }) {
  function update(key, nextValue) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <div className="form-grid">
      <label>
        Full name
        <input value={value.full_name || ''} onChange={(event) => update('full_name', event.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={value.email || ''} onChange={(event) => update('email', event.target.value)} required />
      </label>
      <label>
        Phone
        <input value={value.phone || ''} onChange={(event) => update('phone', event.target.value)} />
      </label>
      <label className="wide">
        Street address
        <input value={value.street1 || ''} onChange={(event) => update('street1', event.target.value)} required />
      </label>
      <label className="wide">
        Address line 2
        <input value={value.street2 || ''} onChange={(event) => update('street2', event.target.value)} />
      </label>
      <label>
        City
        <input value={value.city || ''} onChange={(event) => update('city', event.target.value)} required />
      </label>
      <label>
        County
        <input value={value.state || ''} onChange={(event) => update('state', event.target.value)} placeholder="Optional" />
      </label>
      <label>
        Postcode
        <input value={value.postal_code || ''} onChange={(event) => update('postal_code', event.target.value)} required />
      </label>
      <label>
        Country
        <select value={value.country || 'GB'} onChange={(event) => update('country', event.target.value)} required>
          <option value="GB">United Kingdom</option>
        </select>
      </label>
    </div>
  );
}
