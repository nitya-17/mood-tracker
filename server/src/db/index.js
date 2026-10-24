import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Return DATE (OID 1082) as pure 'YYYY-MM-DD' strings without timezone offset shifting
pg.types.setTypeParser(1082, (val) => val);

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️  DATABASE_URL environment variable is missing. Set it in .env to connect to Supabase.');
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('supabase.co') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const query = (text, params) => pool.query(text, params);
