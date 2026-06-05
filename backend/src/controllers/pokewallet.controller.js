import { fetchPokeWalletImage, searchPokeWalletCards } from '../services/pokewallet.service.js';
import { badRequest } from '../utils/errors.js';

const MIN_SEARCH_LENGTH = 7;

export async function autocomplete(req, res) {
  const query = String(req.query.q || '').trim();
  if (query.length < MIN_SEARCH_LENGTH) {
    throw badRequest(`q must be at least ${MIN_SEARCH_LENGTH} characters`);
  }

  const suggestions = await searchPokeWalletCards(query);
  res.json({ suggestions });
}

export async function imageProxy(req, res) {
  const response = await fetchPokeWalletImage(req.params.id, req.query.size || 'high');
  res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const buffer = Buffer.from(await response.arrayBuffer());
  res.send(buffer);
}
