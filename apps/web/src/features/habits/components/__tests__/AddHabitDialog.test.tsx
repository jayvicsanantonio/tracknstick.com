// Covers the Add habit dialog opened with a starter habit: its form starts filled in.
// A starter habit from the first-habit prompt brings its name, icon and days with it.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AddHabitDialog from '../AddHabitDialog';
import { DateContext } from '@app/providers/DateContext';

vi.mock('@/features/habits/hooks/useHabitsContext', () => ({
  useHabitsContext: () => ({
    showAddHabitDialog: true,
    toggleShowAddHabitDialog: vi.fn(),
    addHabitDraft: {
      name: 'Drink water',
      icon: 'GlassWater',
      frequency: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
  }),
}));
vi.mock('@/features/habits/hooks/useHabits', () => ({
  useHabits: () => ({
    addHabit: vi.fn(),
    updateHabit: vi.fn(),
    deleteHabit: vi.fn(),
  }),
}));

describe('AddHabitDialog', () => {
  it('starts the form filled in with the starter habit it was opened with', async () => {
    render(
      <DateContext.Provider
        value={{
          date: new Date(2026, 10, 24, 12),
          currentDate: new Date(2026, 10, 24, 12),
          setDate: vi.fn(),
          handlePreviousDate: vi.fn(),
          handleNextDate: vi.fn(),
          timeZone: 'America/Los_Angeles',
        }}
      >
        <AddHabitDialog />
      </DateContext.Provider>,
    );

    expect(await screen.findByLabelText(/^Name/)).toHaveValue('Drink water');
    expect(screen.getByRole('button', { name: 'Wed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('radio', { name: /glass water/i })).toBeChecked();
  });
});
