import { money } from '../utils/product.js';

export default function ShippingRates({ rates, selectedRateId, onSelect }) {
  if (!rates?.length) return null;

  return (
    <div className="rate-list">
      {rates.map((rate) => (
        <label key={rate.id} className={Number(selectedRateId) === Number(rate.id) ? 'rate rate--selected' : 'rate'}>
          <input
            type="radio"
            name="shipping_rate"
            value={rate.id}
            checked={Number(selectedRateId) === Number(rate.id)}
            onChange={() => onSelect(rate.id)}
          />
          <span>
            <strong>{rate.carrier}</strong>
            <small>{rate.service}{rate.estimated_days ? ` | ${rate.estimated_days} days` : ''}</small>
          </span>
          <b>{money(rate.amount, rate.currency || 'GBP')}</b>
        </label>
      ))}
    </div>
  );
}
