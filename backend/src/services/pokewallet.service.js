import { env, requireConfig } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { generateSingleCardDescription } from '../utils/descriptions.js';

const searchCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function pokewalletRequest(path) {
  const apiKey = requireConfig(env.pokewalletApiKey, 'POKEWALLET_API_KEY');
  const response = await fetch(`${env.pokewalletApiBaseUrl}${path}`, {
    headers: {
      'X-API-Key': apiKey
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError('PokeWallet API request failed', response.status, 'POKEWALLET_API_ERROR', text);
  }

  return response.json();
}

function firstAvailable(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') || null;
}

function nestedCardInfo(card) {
  return card.card_info || card.cardInfo || card.card || {};
}

function extractMarketPrice(card) {
  const tcgPrices = Array.isArray(card.tcgplayer?.prices) ? card.tcgplayer.prices : [];
  const candidates = [
    card.market_price,
    card.marketPrice,
    card.price,
    card.prices?.market,
    card.prices?.usd,
    ...tcgPrices.flatMap((price) => [price.market_price, price.marketPrice, price.mid_price, price.low_price]),
    card.tcgplayer?.prices?.holofoil?.market,
    card.tcgplayer?.prices?.normal?.market,
    card.tcgplayer?.prices?.reverseHolofoil?.market,
    card.cardmarket?.prices?.averageSellPrice,
    card.cardmarket?.prices?.trendPrice
  ];

  const value = candidates.find((candidate) => Number.isFinite(Number(candidate)));
  return value === undefined ? null : Number(value);
}

function extractPokemonType(card) {
  const info = nestedCardInfo(card);
  const type = firstAvailable(card.pokemon_type, card.type, card.supertype, info.card_type, info.pokemon_type, info.type);
  if (type) return type;
  if (Array.isArray(card.types)) return card.types.join(', ');
  if (Array.isArray(info.types)) return info.types.join(', ');
  return null;
}

function cardImageUrl(card) {
  if (card.id) {
    return `/api/pokewallet/images/${encodeURIComponent(card.id)}?size=high`;
  }

  return firstAvailable(card.image_url, card.imageUrl, card.images?.large, card.images?.small);
}

function normalizeCard(card) {
  const info = nestedCardInfo(card);
  const cardName = firstAvailable(card.card_name, card.name, card.clean_name, card.title, info.name, info.clean_name);
  const setName = firstAvailable(card.set_name, card.setName, card.set?.name, info.set_name, info.setName, info.set?.name);
  const setCode = firstAvailable(card.set_code, card.setCode, card.set?.code, card.set?.id, info.set_code, info.setCode, info.set_id);
  const cardNumber = firstAvailable(card.card_number, card.number, card.collector_number, info.card_number, info.number, info.collector_number);
  const rarity = firstAvailable(card.rarity, card.card_rarity, info.rarity, info.card_rarity);
  const suggestedMarketPrice = extractMarketPrice(card);

  const normalized = {
    id: firstAvailable(card.id, card.card_id, card.uuid),
    card_name: cardName,
    set_name: setName,
    set_code: setCode,
    card_number: cardNumber,
    rarity,
    pokemon_type: extractPokemonType(card),
    image_url: cardImageUrl(card),
    suggested_market_price: suggestedMarketPrice,
    draft_description: generateSingleCardDescription({
      card_name: cardName || '',
      set_name: setName || '',
      card_number: cardNumber || '',
      condition: 'Near Mint',
      language: 'English'
    })
  };

  return normalized;
}

function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.cards)) return data.cards;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export async function searchPokeWalletCards(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const cached = searchCache.get(normalizedQuery);

  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.results;
  }

  const data = await pokewalletRequest(`/search?q=${encodeURIComponent(query)}`);
  const results = extractItems(data).slice(0, 8).map(normalizeCard);
  searchCache.set(normalizedQuery, {
    createdAt: Date.now(),
    results
  });

  return results;
}

export async function fetchPokeWalletImage(cardId, size = 'high') {
  const apiKey = requireConfig(env.pokewalletApiKey, 'POKEWALLET_API_KEY');
  const response = await fetch(`${env.pokewalletApiBaseUrl}/images/${encodeURIComponent(cardId)}?size=${encodeURIComponent(size)}`, {
    headers: {
      'X-API-Key': apiKey
    }
  });

  if (!response.ok) {
    const error = new AppError('PokeWallet image request failed', response.status, 'POKEWALLET_IMAGE_ERROR');
    throw error;
  }

  return response;
}
