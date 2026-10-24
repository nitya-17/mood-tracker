import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const schemaPath = path.resolve(__dirname, '../../../db/schema.sql');
  console.log(`Reading schema from: ${schemaPath}`);

  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Running database schema migration on Supabase...');
    await query(schemaSql);
    console.log('✅ Database schema applied successfully!');
  } catch (error) {
    console.error('❌ Failed to run schema migration:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setupDatabase();
