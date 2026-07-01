/**
 * init-db.ts — ExportWise database initializer
 * Usage: npm run db:init  (from sources/api/)
 * Idempotent: safe to re-run at any time (schema uses CREATE TABLE IF NOT EXISTS).
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import { ENV_PATH, SCHEMA_PATH, resolveDbPath } from '../src/config/paths';

dotenv.config({ path: ENV_PATH });

const DB_PROVIDER = process.env.DB_PROVIDER ?? 'sqlite';
if (DB_PROVIDER !== 'sqlite') {
  console.error('DB_PROVIDER is not sqlite. Only sqlite is supported here.');
  process.exit(1);
}

const dbPath = resolveDbPath();
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created directory: ' + dbDir);
}

console.log('Initializing SQLite database at: ' + dbPath);

const db = new Database(dbPath);
try {
  db.pragma('foreign_keys = ON');
  db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  console.log('Schema applied.');

  const expectedTables = ['Country', 'Manufacturer', 'Product', 'CommitteeDecision'];
  const actualTables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((r) => (r as { name: string }).name);

  console.log('\nTables:');
  actualTables.forEach((t) => console.log('  OK ' + t));

  const missing = expectedTables.filter((t) => !actualTables.includes(t));
  if (missing.length > 0) {
    console.error('Missing tables: ' + missing.join(', '));
    process.exit(1);
  }

  console.log('\nDatabase ready at: ' + dbPath);
} finally {
  db.close();
}
