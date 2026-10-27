import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '3000', 10),
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '10000', 10),
});

db.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log(`[Database] Connected successfully. Database Time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    return false;
  }
}
