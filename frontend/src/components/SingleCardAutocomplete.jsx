import { useState } from 'react';
import { adminApi } from '../api/adminApi.js';
import { resolveImageUrl } from '../api/client.js';
import { money } from '../utils/product.js';
import ErrorMessage from './ErrorMessage.jsx';

const MIN_SEARCH_LENGTH = 7;

export default function SingleCardAutocomplete({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  function updateQuery(value) {
    setQuery(value);
    setError(null);
    setHasSearched(false);

    if (value.trim().length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
    }
  }

  async function search() {
    const value = query.trim();

    if (value.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setError(new Error(`Enter at least ${MIN_SEARCH_LENGTH} characters before searching.`));
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await adminApi.searchPokeWallet(value);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function searchOnEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      search();
    }
  }

  return (
    <div className="autocomplete">
      <div className="autocomplete-search">
        <label>
          PokeWallet autocomplete
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={searchOnEnter}
            placeholder="Type full card number, set code, or card name"
          />
        </label>
        <button type="button" onClick={search} disabled={loading || query.trim().length < MIN_SEARCH_LENGTH}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <small>Search only after entering at least {MIN_SEARCH_LENGTH} characters, for example a full card number like 026/182.</small>
      {loading && <small>Searching...</small>}
      <ErrorMessage error={error} />
      {hasSearched && !loading && !error && suggestions.length === 0 && (
        <div className="empty-state compact">No PokeWallet matches found for this search.</div>
      )}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((card) => (
            <button key={`${card.id}-${card.card_number}`} type="button" onClick={() => onSelect(card)}>
              {card.image_url && <img src={resolveImageUrl(card.image_url)} alt={card.card_name} />}
              <span>
                <strong>{card.card_name}</strong>
                <small>{[card.set_name, card.set_code, card.card_number, card.rarity].filter(Boolean).join(' | ')}</small>
              </span>
              {card.suggested_market_price && <b>{money(card.suggested_market_price)}</b>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
