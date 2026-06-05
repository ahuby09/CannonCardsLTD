import { getCartIdentity } from '../services/cart.service.js';
import { createOrderAndRates } from '../services/order.service.js';
import { validateAddressPayload } from '../validators/address.validators.js';

export async function getRates(req, res) {
  const identity = getCartIdentity(req);
  const address = validateAddressPayload(req.body.address || req.body);
  const result = await createOrderAndRates(identity, address);
  res.status(201).json(result);
}
