// Covers migrations/0003_seed_achievements.sql against a real local D1 database.
// The migration seeds the achievement catalogue; running it again must not disturb earned achievements.

import { beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';
import { AchievementRepository } from '../repositories/achievement.repository.js';

const SEED_MIGRATION = '0003_seed_achievements.sql';

/** Runs the seed migration's statements again, as a re-seed would. */
async function runSeedAgain(db: D1Database) {
  const seed = env.TEST_MIGRATIONS.find((m) => m.name === SEED_MIGRATION);
  if (!seed) throw new Error(`${SEED_MIGRATION} is missing`);
  await db.batch(seed.queries.map((query: string) => db.prepare(query)));
}

describe('the achievement seed migration', () => {
  let db: D1Database;
  let repository: AchievementRepository;

  beforeAll(() => {
    db = env.DB;
    repository = new AchievementRepository(db);
  });

  it('seeds the catalogue: one active row per achievement key', async () => {
    const { results } = await db
      .prepare('SELECT key, is_active AS isActive FROM achievements')
      .all<{ key: string; isActive: number }>();

    expect(results).toHaveLength(44);
    expect(new Set(results.map((row) => row.key)).size).toBe(44);
    expect(results.every((row) => row.isActive === 1)).toBe(true);

    const firstHabit = await db
      .prepare(
        `SELECT key, name, description, icon, type, category,
                requirement_type AS requirementType,
                requirement_value AS requirementValue,
                requirement_data AS requirementData
         FROM achievements WHERE key = ?`
      )
      .bind('first_habit')
      .first();
    expect(firstHabit).toEqual({
      key: 'first_habit',
      name: 'First Step',
      description: 'Create your very first habit',
      icon: 'Sprout',
      type: 'habit_creation',
      category: 'getting_started',
      requirementType: 'count',
      requirementValue: 1,
      requirementData: null,
    });
  });

  it('keeps achievements users have already earned when the seed runs again', async () => {
    await db
      .prepare('INSERT INTO users (clerk_user_id) VALUES (?)')
      .bind('user_a')
      .run();
    const firstHabit = await db
      .prepare('SELECT id FROM achievements WHERE key = ?')
      .bind('first_habit')
      .first<{ id: number }>();
    await repository.earnAchievement('user_a', firstHabit!.id);

    await runSeedAgain(db);

    const earned = await repository.getUserAchievements('user_a');
    expect(earned.map((ua) => ua.achievement?.key)).toEqual(['first_habit']);
  });

  it('restores a catalogue row to its definition without changing its id', async () => {
    const before = await db
      .prepare('SELECT id FROM achievements WHERE key = ?')
      .bind('first_habit')
      .first<{ id: number }>();
    await db
      .prepare('UPDATE achievements SET name = ? WHERE key = ?')
      .bind('Edited by hand', 'first_habit')
      .run();

    await runSeedAgain(db);

    const after = await db
      .prepare('SELECT id, name FROM achievements WHERE key = ?')
      .bind('first_habit')
      .first<{ id: number; name: string }>();
    expect(after).toEqual({ id: before!.id, name: 'First Step' });
  });
});
