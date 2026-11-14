// Starts a real local D1 database for tests and brings it to the current schema.
// The schema comes from the migration files, so tests run against what production runs.

import { readdirSync, readFileSync } from 'node:fs';
import { Miniflare } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';

export const MIGRATIONS_DIR = new URL('../../migrations/', import.meta.url);

/** Migration files in the order wrangler applies them: by file name. */
export function listMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

/**
 * Runs every migration file against the database, in order.
 *
 * Line comments are removed and statements are split on ';'. That is enough
 * for plain DDL and DML. A migration with ';' or '--' inside a string literal,
 * or with a trigger body, would need a real SQL splitter here.
 */
export async function applyMigrations(db: D1Database): Promise<void> {
  for (const file of listMigrationFiles()) {
    const statements = readFileSync(new URL(file, MIGRATIONS_DIR), 'utf8')
      .replace(/--.*$/gm, '')
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);

    await db.batch(statements.map((statement) => db.prepare(statement)));
  }
}

/**
 * Creates an empty in-memory D1 database and applies every migration to it.
 * Call dispose() when the tests are done to stop the local runtime.
 */
export async function createMigratedDatabase(): Promise<{
  db: D1Database;
  dispose: () => Promise<void>;
}> {
  const miniflare = new Miniflare({
    modules: true,
    script: 'export default { fetch: () => new Response(null) }',
    d1Databases: ['DB'],
  });
  const db = (await miniflare.getD1Database('DB')) as unknown as D1Database;

  await applyMigrations(db);

  return { db, dispose: () => miniflare.dispose() };
}
