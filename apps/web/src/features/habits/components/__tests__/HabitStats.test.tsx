// Covers the Stats tab of the edit dialog and how it words a habit's streaks.
// A one-day streak reads "1 day", in the figures and in the encouragement line.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HabitStats from '../HabitStats';
import useHabitStats from '@/features/habits/hooks/useHabitStats';
import type { Habit } from '@/features/habits/types/Habit';

vi.mock('@/features/habits/hooks/useHabitStats', () => ({ default: vi.fn() }));

const habit = {
  id: '1',
  name: 'Read',
  icon: 'BookOpen',
  frequency: ['Mon'],
  completed: false,
  startDate: '2026-11-01',
} as Habit;

describe('HabitStats', () => {
  it('words a one-day streak in the singular', () => {
    vi.mocked(useHabitStats).mockReturnValue({
      streak: 1,
      longestStreak: 1,
      totalCompletions: 1,
      lastCompleted: undefined,
    } as unknown as ReturnType<typeof useHabitStats>);

    render(<HabitStats habit={habit} />);

    expect(
      screen.getByText(/consistent with "Read" for 1 day\./),
    ).toBeInTheDocument();
    expect(screen.queryByText('days')).not.toBeInTheDocument();
  });
});
