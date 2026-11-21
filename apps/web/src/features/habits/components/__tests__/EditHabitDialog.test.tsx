// Covers the Edit habit dialog's two tabs, the form and the habit's stats.
// Both panels stay laid out, so the dialog keeps one size when the tab changes.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditHabitDialog from '../EditHabitDialog';
import { Habit } from '@/features/habits/types/Habit';

const habit: Habit = {
  id: 'habit-1',
  name: 'Read',
  icon: 'BookOpen',
  frequency: ['Mon', 'Wed'],
  startDate: '2026-11-01T00:00:00.000Z',
  completed: false,
};

vi.mock('@/features/habits/hooks/useHabitsContext', () => ({
  useHabitsContext: () => ({
    editingHabit: habit,
    showEditHabitDialog: true,
    toggleShowEditHabitDialog: vi.fn(),
  }),
}));
vi.mock('@/features/habits/hooks/useHabitStats', () => ({
  default: () => ({ streak: 0, longestStreak: 0, totalCompletions: 0 }),
}));
// The form has tests of its own; here it only has to be there.
vi.mock('@/features/habits/components/HabitForm', () => ({
  default: () => <form aria-label="Habit form" />,
}));

describe('EditHabitDialog', () => {
  it('opens on the form', async () => {
    render(<EditHabitDialog />);

    const dialog = await screen.findByRole('dialog', { name: 'Read' });
    expect(
      await within(dialog).findByRole('form', { name: 'Habit form' }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('tab', { name: 'Edit' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('keeps the form and the stats laid out while either tab is shown', async () => {
    render(<EditHabitDialog />);
    const dialog = await screen.findByRole('dialog', { name: 'Read' });
    await within(dialog).findByRole('form', { name: 'Habit form' });

    // The stats are there, out of sight, behind the form.
    expect(
      within(dialog).getByLabelText('Habit Statistics', { selector: 'div' }),
    ).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('tab', { name: 'Stats' }));

    expect(within(dialog).getByRole('tab', { name: 'Stats' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    // The form stays behind the stats, out of sight.
    expect(
      within(dialog).getByRole('form', { name: 'Habit form' }),
    ).toBeInTheDocument();
  });
});
