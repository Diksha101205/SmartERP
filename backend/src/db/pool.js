import pg from 'pg';

import { config } from '../config/env.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl
});

export async function query(text, params = []) {
  const startedAt = Date.now();
  const result = await pool.query(text, params);
  const durationMs = Date.now() - startedAt;

  if (config.nodeEnv === 'development') {
    console.log('db query', { text, durationMs, rows: result.rowCount });
  }

  return result;
}
