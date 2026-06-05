export default function CodeCardProductForm({ form, onChange }) {
  function update(key, value) {
    onChange({ ...form, [key]: value });
  }

  return (
    <>
      <label>
        Code card name
        <input value={form.code_card_name || ''} onChange={(event) => update('code_card_name', event.target.value)} placeholder="Scarlet & Violet Booster Pack Code" required />
      </label>
      <label>
        Set name
        <input value={form.set_name || ''} onChange={(event) => update('set_name', event.target.value)} />
      </label>
      <label>
        Set code
        <input value={form.set_code || ''} onChange={(event) => update('set_code', event.target.value)} />
      </label>
      <label>
        Code type
        <input value={form.code_type || 'Pokemon TCG Live code'} onChange={(event) => update('code_type', event.target.value)} />
      </label>
      <label>
        Platform
        <input value={form.platform || 'Pokemon TCG Live'} onChange={(event) => update('platform', event.target.value)} />
      </label>
      <label>
        Redemption URL
        <input value={form.redemption_url || 'https://redeem.tcg.pokemon.com/'} onChange={(event) => update('redemption_url', event.target.value)} />
      </label>
      <label className="wide">
        Delivery instructions
        <textarea rows="3" value={form.instructions || 'Redeem this one-time code in Pokemon TCG Live.'} onChange={(event) => update('instructions', event.target.value)} />
      </label>
      <label className="wide">
        Add new codes
        <textarea rows="8" value={form.codes_text || ''} onChange={(event) => update('codes_text', event.target.value)} placeholder="Paste one code per line. Existing delivered codes are never removed." />
      </label>
    </>
  );
}
