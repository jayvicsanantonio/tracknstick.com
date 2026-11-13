// Runs achievement catalogue seeding against a real local D1 database.
// A stubbed D1 cannot show what a statement does to rows in other tables.
// @vitest-environment node

import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';
import { AchievementRepository } from '../achievement.repository.js';

const SCHEMA_PATH = new URL('../../../migrations/schema.sql', import.meta.url);

describe('AchievementRepository.initializeAchievements', () => {
  let miniflare: Miniflare;
  let db: D1Database;
  let repository: AchievementRepository;

  beforeAll(async () => {
    miniflare = new Miniflare({
      modules: true,
      script: 'export default { fetch: () => new Response(null) }',
      d1Databases: ['DB'],
    });
    db = (await miniflare.getD1Database('DB')) as unknown as D1Database;

    const statements = readFileSync(SCHEMA_PATH, 'utf8')
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);
    await db.batch(statements.map((statement) => db.prepare(statement)));

    repository = new AchievementRepository(db);
  });

  afterAll(async () => {
    await miniflare.dispose();
  });

  it('keeps achievements users have already earned when the catalogue is re-seeded', async () => {
    await repository.initializeAchievements();
    await db
      .prepare('INSERT INTO users (clerk_user_id) VALUES (?)')
      .bind('user_a')
      .run();
    const firstHabit = await db
      .prepare('SELECT id FROM achievements WHERE key = ?')
      .bind('first_habit')
      .first<{ id: number }>();
    await repository.earnAchievement('user_a', firstHabit!.id);

    await repository.initializeAchievements();

    const earned = await repository.getUserAchievements('user_a');
    expect(earned.map((ua) => ua.achievement?.key)).toEqual(['first_habit']);
  });

  it('restores a catalogue row to its definition without changing its id', async () => {
    await repository.initializeAchievements();
    const before = await db
      .prepare('SELECT id FROM achievements WHERE key = ?')
      .bind('first_habit')
      .first<{ id: number }>();
    await db
      .prepare('UPDATE achievements SET name = ? WHERE key = ?')
      .bind('Edited by hand', 'first_habit')
      .run();

    await repository.initializeAchievements();

    const after = await db
      .prepare('SELECT id, name FROM achievements WHERE key = ?')
      .bind('first_habit')
      .first<{ id: number; name: string }>();
    expect(after).toEqual({ id: before!.id, name: 'First Step' });
  });
});
