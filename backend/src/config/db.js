import mysql from 'mysql2/promise';
import { env } from './env.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...env.mysql,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      namedPlaceholders: false
    });
  }

  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function withTransaction(work) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function closePool() {
  if (!pool) return;

  const activePool = pool;
  pool = undefined;
  await activePool.end();
}
