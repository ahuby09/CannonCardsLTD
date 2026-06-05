import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlPath = path.resolve(__dirname, '../db/clear_external_product_images.sql');
const sql = await readFile(sqlPath, 'utf8');

const pool = getPool();
await pool.execute(sql);
await pool.end();

console.log('External product image URLs cleared.');
