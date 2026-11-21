// Covers the Edit habit dialog's two tabs, the form and the habit's stats.
// The stats load only once their tab opens; the form stays laid out, so the dialog keeps one size.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditHabitDialog from '../EditHabitDialog';
import useHabitStats from '@/features/habits/hooks/useHabitStats';
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
  default: vi.fn(() => ({ streak: 0, longestStreak: 0, totalCompletions: 0 })),
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

  it('asks for the stats only once the Stats tab opens', async () => {
    vi.mocked(useHabitStats).mockClear();
    render(<EditHabitDialog />);
    const dialog = await screen.findByRole('dialog', { name: 'Read' });
    await within(dialog).findByRole('form', { name: 'Habit form' });

    expect(useHabitStats).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('tab', { name: 'Stats' }));

    expect(useHabitStats).toHaveBeenCalledWith('habit-1');
    expect(
      within(dialog).getByLabelText('Habit Statistics', { selector: 'div' }),
    ).toBeInTheDocument();
  });

  it('keeps the form laid out behind the stats, and the stats once opened', async () => {
    render(<EditHabitDialog />);
    const dialog = await screen.findByRole('dialog', { name: 'Read' });
    await within(dialog).findByRole('form', { name: 'Habit form' });

    await userEvent.click(within(dialog).getByRole('tab', { name: 'Stats' }));

    expect(within(dialog).getByRole('tab', { name: 'Stats' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    // The form stays behind the stats, out of sight.
    expect(
      within(dialog).getByRole('form', { name: 'Habit form' }),
    ).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('tab', { name: 'Edit' }));

    // Back on the form, the stats stay laid out behind it.
    expect(
      within(dialog).getByLabelText('Habit Statistics', { selector: 'div' }),
    ).toBeInTheDocument();
  });
});
