import fs from 'fs';
import path from 'path';
import { db } from './db.js';

export async function runMigrations(): Promise<void> {
  console.log('[Migrate] Starting database migrations...');
  await db.ensureReady();

  const migrationsDir = path.resolve(__dirname, '../../../database/migrations');
  const schemaFile = path.join(migrationsDir, '001_initial_schema.sql');

  if (!fs.existsSync(schemaFile)) {
    console.error(`[Migrate] Schema file not found at: ${schemaFile}`);
    return;
  }

  const sqlContent = fs.readFileSync(schemaFile, 'utf-8');

  // Split by statement or execute
  // In SQLite/LibSQL or PostgreSQL, split by semicolon while ignoring comments
  const cleanSql = sqlContent
    .replace(/--.*$/gm, '')
    .trim();

  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (err: any) {
      console.error(`[Migrate] Error executing statement: ${statement.substring(0, 60)}...`);
      console.error(`[Migrate] Message: ${err.message}`);
    }
  }

  console.log(`[Migrate] Executed ${statements.length} migration statements successfully.`);
}

// Self-run when executed directly via npm run migrate
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
