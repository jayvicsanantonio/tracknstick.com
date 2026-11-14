// Checks the migration files themselves, using a real local D1 database.
// Wrangler applies every .sql file in migrations/ to production, in file-name order.
// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import {
  applyMigrations,
  createMigratedDatabase,
  listMigrationFiles,
} from './realD1.js';

async function namesOf(db: D1Database, type: 'table' | 'index') {
  const { results } = await db
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type = ?
         AND name NOT LIKE 'sqlite_%'
         AND name NOT LIKE '_cf_%'
         AND name NOT LIKE 'd1_%'
       ORDER BY name`
    )
    .bind(type)
    .all<{ name: string }>();

  return results.map((row) => row.name);
}

describe('migration files', () => {
  it('are all numbered migrations', () => {
    // Wrangler treats every .sql file in this folder as a migration. A helper
    // script left here, such as one that drops tables, would be run against
    // production on the next deploy.
    for (const file of listMigrationFiles()) {
      expect(file).toMatch(/^\d{4}_[a-z0-9_]+\.sql$/);
    }
  });

  it('are numbered consecutively from 0001', () => {
    const numbers = listMigrationFiles().map((file) =>
      Number(file.slice(0, 4))
    );

    expect(numbers.length).toBeGreaterThan(0);
    expect(numbers).toEqual(numbers.map((_, index) => index + 1));
  });
});

describe('migrated database', () => {
  let db: D1Database;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ db, dispose } = await createMigratedDatabase());
  });

  afterAll(async () => {
    await dispose();
  });

  it('has the tables the API queries', async () => {
    expect(await namesOf(db, 'table')).toEqual([
      'achievements',
      'habits',
      'trackers',
      'user_achievements',
      'users',
    ]);
  });

  it('has the indexes the queries rely on', async () => {
    const indexes = await namesOf(db, 'index');

    expect(indexes.filter((name) => name.startsWith('idx_'))).toEqual([
      'idx_achievements_category',
      'idx_achievements_key',
      'idx_achievements_type',
      'idx_habits_deleted_at',
      'idx_habits_user_id',
      'idx_trackers_deleted_at',
      'idx_trackers_habit_id',
      'idx_trackers_timestamp',
      'idx_trackers_user_id',
      'idx_user_achievements_achievement_id',
      'idx_user_achievements_earned_at',
      'idx_user_achievements_user_id',
      'idx_users_clerk_user_id',
    ]);
  });

  it('keeps existing data when the baseline is applied to a database that already has the schema', async () => {
    // The first production run looks like this: the tables already exist and
    // hold data, and the baseline migration must change nothing.
    await db
      .prepare('INSERT INTO users (clerk_user_id) VALUES (?)')
      .bind('user_existing')
      .run();

    await applyMigrations(db);

    const user = await db
      .prepare('SELECT clerk_user_id FROM users WHERE clerk_user_id = ?')
      .bind('user_existing')
      .first<{ clerk_user_id: string }>();
    expect(user).toEqual({ clerk_user_id: 'user_existing' });
  });
});
