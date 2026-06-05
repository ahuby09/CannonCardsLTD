import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlPath = path.resolve(__dirname, '../db/newsletter_subscribers.sql');

const sql = await readFile(sqlPath, 'utf8');
const statements = sql
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

const pool = getPool();

for (const statement of statements) {
  await pool.execute(statement);
}

await pool.end();
console.log('Newsletter subscribers table is ready.');
