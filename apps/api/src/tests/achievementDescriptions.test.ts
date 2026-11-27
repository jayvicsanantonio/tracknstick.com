// Covers migrations 0004 and 0005, which reword achievement descriptions, against a real local D1 database.
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
  ])('describes %s by what it counts', async (key, description) => {
    const row = await env.DB.prepare(
      'SELECT description FROM achievements WHERE key = ?'
    )
      .bind(key)
      .first<{ description: string }>();

    expect(row?.description).toBe(description);
  });
});
