// Covers preloading the tab pages, so a first visit to a tab shows it at once instead of a spinner.
// Each page module is stubbed to record when it is loaded.

import { describe, it, expect, vi } from 'vitest';
import { preloadPages } from '@app/routes/pages';

const loaded = vi.hoisted(() => new Set<string>());

vi.mock('@/pages/DashboardPage', () => {
  loaded.add('Tracker');
  return { default: () => null };
});
vi.mock('@/pages/HabitsPage', () => {
  loaded.add('Habits');
  return { default: () => null };
});
vi.mock('@/pages/ProgressPage', () => {
  loaded.add('Progress');
  return { default: () => null };
});
vi.mock('@/pages/CoachPage', () => {
  loaded.add('Coach');
  return { default: () => null };
});

describe('preloadPages', () => {
  it('loads every tab page ahead of its first visit', async () => {
    expect(loaded.size).toBe(0);

    await preloadPages();

    expect([...loaded].sort()).toEqual(
      ['Coach', 'Habits', 'Progress', 'Tracker'].sort(),
    );
  });
});
