import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPath = path.resolve(__dirname, '../migrations/001_initial_schema.sql');

try {
  const sql = await fs.readFile(migrationPath, 'utf8');
  await pool.query(sql);
  console.log('Database migration completed');
} catch (error) {
  console.error('Database migration failed');
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
