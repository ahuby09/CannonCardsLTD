export default function ProductFilters({ filters, onChange, admin = false }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <form className="filters" onSubmit={(event) => event.preventDefault()}>
      <label>
        Search
        <input value={filters.search || ''} onChange={(event) => update('search', event.target.value)} placeholder="Charizard, ETB, set..." />
      </label>

      <label>
        Type
        <select value={filters.type || ''} onChange={(event) => update('type', event.target.value)}>
          <option value="">All</option>
          <option value="single_card">Singles</option>
          <option value="sealed_product">Sealed</option>
          <option value="code_card">Code cards</option>
        </select>
      </label>

      <label>
        Set
        <input value={filters.set || ''} onChange={(event) => update('set', event.target.value)} />
      </label>

      <label>
        Singles condition
        <select value={filters.condition || ''} onChange={(event) => update('condition', event.target.value)}>
          <option value="">Any</option>
          <option>Mint</option>
          <option>Near Mint</option>
          <option>Light Play</option>
          <option>Moderate Play</option>
          <option>Heavy Play</option>
        </select>
      </label>

      <label>
        Sealed condition
        <select value={filters.sealed_condition || ''} onChange={(event) => update('sealed_condition', event.target.value)}>
          <option value="">Any</option>
          <option>New</option>
          <option>Seal Opened</option>
        </select>
      </label>

      <label>
        Rarity
        <input value={filters.rarity || ''} onChange={(event) => update('rarity', event.target.value)} />
      </label>

      <label>
        Category
        <input value={filters.category || ''} onChange={(event) => update('category', event.target.value)} />
      </label>

      <label>
        Tag
        <input value={filters.tag || ''} onChange={(event) => update('tag', event.target.value)} />
      </label>

      <label>
        Min price
        <input type="number" min="0" step="0.01" value={filters.min_price || ''} onChange={(event) => update('min_price', event.target.value)} />
      </label>

      <label>
        Max price
        <input type="number" min="0" step="0.01" value={filters.max_price || ''} onChange={(event) => update('max_price', event.target.value)} />
      </label>

      {admin && (
        <>
          <label>
            Status
            <select value={filters.status || ''} onChange={(event) => update('status', event.target.value)}>
              <option value="">Any</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="sold_out">Sold out</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label>
            Stock
            <select value={filters.stock_level || ''} onChange={(event) => update('stock_level', event.target.value)}>
              <option value="">Any</option>
              <option value="in_stock">In stock</option>
              <option value="low">Low stock</option>
              <option value="sold_out">Sold out</option>
            </select>
          </label>
        </>
      )}

      <button type="button" className="secondary" onClick={() => onChange({})}>Reset</button>
    </form>
  );
}
