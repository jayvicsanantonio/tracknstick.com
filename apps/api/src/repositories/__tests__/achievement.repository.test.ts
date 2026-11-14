// Runs achievement catalogue seeding against a real local D1 database.
// A stubbed D1 cannot show what a statement does to rows in other tables.
// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { createMigratedDatabase } from '../../tests/realD1.js';
import { AchievementRepository } from '../achievement.repository.js';

describe('AchievementRepository.initializeAchievements', () => {
  let db: D1Database;
  let dispose: () => Promise<void>;
  let repository: AchievementRepository;

  beforeAll(async () => {
    ({ db, dispose } = await createMigratedDatabase());
    repository = new AchievementRepository(db);
  });

  afterAll(async () => {
    await dispose();
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
