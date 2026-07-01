import * as fs from 'fs';
import * as path from 'path';

/**
 * Resolves the API package root (the directory containing package.json) by
 * walking up from the current module. This keeps path resolution stable whether
 * the code runs via ts-node (src/...) or compiled (dist/...), and regardless of
 * the process working directory.
 */
export function findApiRoot(start: string = __dirname): string {
  let dir = start;
  // Walk up until package.json is found or the filesystem root is reached.
  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error('Could not locate API root (package.json not found)');
    }
    dir = parent;
  }
  return dir;
}

const apiRoot = findApiRoot();

/** Absolute path to the mock-jsons directory used for seeding. */
export const MOCK_DIR = path.join(apiRoot, 'mock-jsons');

/** Absolute path to the SQL schema file. */
export const SCHEMA_PATH = path.join(apiRoot, 'database', 'schema.sql');

/** Absolute path to the repository-root .env (two levels above sources/api). */
export const ENV_PATH = path.resolve(apiRoot, '..', '..', '.env');

/**
 * Resolves the SQLite database file path from DB_PATH (relative paths are
 * resolved against the API root) with the POC default under the repo data dir.
 */
export function resolveDbPath(): string {
  const raw = process.env.DB_PATH ?? '../../data/exportwise.db';
  return path.isAbsolute(raw) ? raw : path.resolve(apiRoot, raw);
}
