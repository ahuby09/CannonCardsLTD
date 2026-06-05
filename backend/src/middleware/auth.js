import jwt from 'jsonwebtoken';
import { env, requireConfig } from '../config/env.js';
import { query } from '../config/db.js';
import { forbidden, unauthorized } from '../utils/errors.js';

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length);
}

async function attachUserFromToken(req) {
  const token = extractBearerToken(req);
  if (!token) {
    return null;
  }

  const payload = jwt.verify(token, requireConfig(env.jwtSecret, 'JWT_SECRET'));
  const users = await query(
    'SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = ?',
    [payload.sub]
  );

  if (!users.length) {
    throw unauthorized('Invalid authentication token');
  }

  req.user = users[0];
  return req.user;
}

export async function optionalAuth(req, res, next) {
  try {
    await attachUserFromToken(req);
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(req, res, next) {
  try {
    const user = await attachUserFromToken(req);
    if (!user) {
      throw unauthorized();
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    next(forbidden());
    return;
  }

  next();
}
