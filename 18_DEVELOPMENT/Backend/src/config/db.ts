import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
