import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env, requireConfig } from '../config/env.js';
import { conflict, unauthorized } from '../utils/errors.js';

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

function signUserToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    requireConfig(env.jwtSecret, 'JWT_SECRET'),
    { expiresIn: env.jwtExpiresIn }
  );
}

export async function registerCustomer(payload) {
  const existing = await query('SELECT id FROM users WHERE email = ?', [payload.email]);
  if (existing.length) {
    throw conflict('An account already exists for this email');
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const result = await query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
    [payload.email, passwordHash, payload.full_name, 'customer']
  );

  const [user] = await query('SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = ?', [result.insertId]);
  return {
    user: publicUser(user),
    token: signUserToken(user)
  };
}

export async function loginUser(payload) {
  const [user] = await query('SELECT * FROM users WHERE email = ?', [payload.email]);
  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(payload.password, user.password_hash);
  if (!valid) {
    throw unauthorized('Invalid email or password');
  }

  return {
    user: publicUser(user),
    token: signUserToken(user)
  };
}

export async function upsertAdminUser({ email, password, full_name }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);

  if (existing.length) {
    await query(
      'UPDATE users SET password_hash = ?, full_name = ?, role = ? WHERE email = ?',
      [passwordHash, full_name, 'admin', email]
    );
  } else {
    await query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, full_name, 'admin']
    );
  }
}
