import fs from 'fs';
import path from 'path';
import { db } from './db.js';
import { runMigrations } from './migrate.js';

export async function runSeeds(): Promise<void> {
  console.log('[Seed] Ensuring migrations have run...');
  await runMigrations();

  const seedsDir = path.resolve(__dirname, '../../../database/seeds');
  const seedFiles = ['001_faqs_and_errors.sql', '002_achievements_and_demo.sql'];

  for (const fileName of seedFiles) {
    const filePath = path.join(seedsDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`[Seed] Seed file not found: ${filePath}`);
      continue;
    }

    console.log(`[Seed] Running seed: ${fileName}...`);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Split on semicolon followed by newline/EOF, keeping multi-line statements intact
    const rawStatements = content
      .replace(/--.*$/gm, '')
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of rawStatements) {
      try {
        await db.query(stmt);
      } catch (err: any) {
        // If conflict error (already seeded), that's fine
        if (!err.message?.includes('UNIQUE constraint failed') && !err.message?.includes('duplicate key')) {
          console.warn(`[Seed] Notice on statement: ${stmt.substring(0, 50)}... -> ${err.message}`);
        }
      }
    }
  }

  // Verify FAQ count
  const faqCheck = await db.query('SELECT COUNT(*) as count FROM faqs');
  const count = faqCheck.rows[0]?.count || 0;
  console.log(`[Seed] Seeding completed. Active FAQs in database: ${count}`);

  const errCheck = await db.query('SELECT COUNT(*) as count FROM error_codes');
  const errCount = errCheck.rows[0]?.count || 0;
  console.log(`[Seed] Active Error Codes in database: ${errCount}`);
}

// Self-run when executed directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeeds()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
