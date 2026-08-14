// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    const rawDbUrl = process.env.DATABASE_URL || process.env.SQL_URL;
    const isRealPostgresUrl = Boolean(
      rawDbUrl && (rawDbUrl.startsWith('postgres://') || rawDbUrl.startsWith('postgresql://'))
    );
    
    if (isRealPostgresUrl && rawDbUrl) {
      console.log('[PostgreSQL] Connecting via DATABASE_URL connection string...');
      const needsSsl = rawDbUrl.includes('sslmode=require') || 
                       process.env.PGSSLMODE === 'require' || 
                       process.env.DATABASE_SSL === 'true';
      
      global._postgresPool = new Pool({
        connectionString: rawDbUrl,
        max: 15,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: needsSsl ? { rejectUnauthorized: false } : false,
      });
    } else {
      const isCloudSql = Boolean(process.env.SQL_HOST && process.env.SQL_USER);
      console.log('[PostgreSQL] Connecting via host/socket params:', process.env.SQL_HOST || '127.0.0.1');
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || '127.0.0.1',
        port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 5432,
        user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
        password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || 'postgres',
        database: process.env.SQL_DB_NAME || 'postgres',
        max: isCloudSql ? 20 : 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: false,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  }
  return global._postgresPool;
};

export const isDatabaseConfigured = (): boolean => {
  const url = process.env.DATABASE_URL || process.env.SQL_URL;
  const isRealUrl = Boolean(url && (url.startsWith('postgres://') || url.startsWith('postgresql://')));
  const isHostConfig = Boolean(process.env.SQL_HOST && (process.env.SQL_USER || process.env.SQL_ADMIN_USER));
  return isRealUrl || isHostConfig;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });
export * from './schema.ts';
