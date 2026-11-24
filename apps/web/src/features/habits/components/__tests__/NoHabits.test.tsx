// Covers the first-habit prompt: one button for any habit, starter habits to begin from, and the coach.
// A starter habit opens the Add dialog already filled in with that habit.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NoHabits from '../NoHabits';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

/** Shows what the Add dialog would open with. */
function AddDialogProbe() {
  const { showAddHabitDialog, addHabitDraft } = useHabitsContext();
  return (
    <output aria-label="Add dialog">
      {showAddHabitDialog ? `open:${addHabitDraft?.name ?? 'blank'}` : 'closed'}
    </output>
  );
}

function renderNoHabits() {
  render(
    <MemoryRouter>
      <HabitsStateProvider>
        <NoHabits />
        <AddDialogProbe />
      </HabitsStateProvider>
    </MemoryRouter>,
  );
}

describe('NoHabits', () => {
  it('opens a blank Add dialog from its main button', async () => {
    renderNoHabits();

    await userEvent.click(screen.getByRole('button', { name: 'Add habit' }));

    expect(
      screen.getByRole('status', { name: 'Add dialog' }),
    ).toHaveTextContent('open:blank');
  });

  it('offers starter habits that open the Add dialog filled in', async () => {
    renderNoHabits();

    const starters = screen.getByRole('list', { name: 'Starter habits' });
    expect(starters).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Start with Drink water' }),
    );

    expect(
      screen.getByRole('status', { name: 'Add dialog' }),
    ).toHaveTextContent('open:Drink water');
  });

  it('points to the coach for help choosing a first habit', () => {
    renderNoHabits();

    expect(
      screen.getByRole('link', { name: /ask the coach/i }),
    ).toHaveAttribute('href', '/coach');
  });
});
