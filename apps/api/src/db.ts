import { Pool } from 'pg';
import { env } from './config.js';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}
