// Covers the migrations that reword, retarget and retire achievements, against a real local D1 database.
// Each achievement's description has to say what its metric actually counts.

import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';

describe('achievement descriptions', () => {
  it.each([
    ['perfect_week', 'Have 7 perfect days, when you complete every habit'],
    ['perfect_month', 'Have 30 perfect days, when you complete every habit'],
    ['time_traveler', 'Check in on 180 different days'],
    ['early_bird', 'Check off a habit before 8 AM on 7 days'],
    ['night_owl', 'Check off a habit at 10 PM or later on 7 days'],
    ['weekend_warrior', 'Check in on 8 weekend days'],
    ['habit_guru', 'Complete 90% of your habits over 30 days in a row'],
    ['habit_legend', 'Earn 30 achievements'],
  ])('describes %s by what it counts', async (key, description) => {
    const row = await env.DB.prepare(
      'SELECT description FROM achievements WHERE key = ?'
    )
      .bind(key)
      .first<{ description: string }>();

    expect(row?.description).toBe(description);
  });

  it('asks Habit Legend for 30 achievements', async () => {
    const row = await env.DB.prepare(
      'SELECT requirement_value AS value FROM achievements WHERE key = ?'
    )
      .bind('habit_legend')
      .first<{ value: number }>();

    expect(row?.value).toBe(30);
  });

  it('retires the achievements that repeat another or cannot be measured', async () => {
    const { results } = await env.DB.prepare(
      'SELECT key FROM achievements WHERE is_active = 0 ORDER BY key'
    ).all<{ key: string }>();

    expect(results.map((row) => row.key)).toEqual([
      'habit_architect_advanced',
      'habit_variety',
      'minimalist',
      'perfectionist',
    ]);
  });
});
