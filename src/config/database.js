import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '#models/user.model.js';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const databaseHost = (() => {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return '';
  }
})();

const isNeonLocalHost = ['neon-local', 'localhost', '127.0.0.1'].includes(
  databaseHost,
);
const useNeonLocal =
  process.env.USE_NEON_LOCAL === 'true' ||
  (process.env.NODE_ENV !== 'production' && isNeonLocalHost);

if (useNeonLocal) {
  neonConfig.fetchEndpoint =
    process.env.NEON_LOCAL_FETCH_ENDPOINT ||
    `http://${databaseHost || 'neon-local'}:5432/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

export { db, sql };
