import { env } from '../config/env.js';
import { getPool } from '../config/db.js';
import { upsertAdminUser } from '../services/auth.service.js';

const password = process.env.ADMIN_PASSWORD;

if (!process.env.ADMIN_EMAIL || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running npm run create-admin.');
  process.exit(1);
}

await upsertAdminUser({
  email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
  password,
  full_name: 'Store Admin'
});

console.log(`Admin user ready: ${process.env.ADMIN_EMAIL}`);
await getPool().end();
