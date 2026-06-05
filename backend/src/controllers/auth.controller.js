import { validateLoginPayload, validateRegisterPayload } from '../validators/auth.validators.js';
import { loginUser, registerCustomer } from '../services/auth.service.js';

export async function register(req, res) {
  const payload = validateRegisterPayload(req.body);
  const result = await registerCustomer(payload);
  res.status(201).json(result);
}

export async function login(req, res) {
  const payload = validateLoginPayload(req.body);
  const result = await loginUser(payload);
  res.json(result);
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function logout(req, res) {
  res.json({ ok: true });
}
