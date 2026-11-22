// Covers the phone-width bottom navigation: its four destinations and its Add button.
// The bar marks the current route and opens the Add Habit dialog.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MobileTabBar from '@/features/layout/components/MobileTabBar';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

/** Shows whether the Add Habit dialog is open, as the context reports it. */
function AddDialogState() {
  const { showAddHabitDialog } = useHabitsContext();
  return <output aria-label="Add dialog">{String(showAddHabitDialog)}</output>;
}

function renderBar(path = '/') {
  render(
    <HabitsStateProvider>
      <MemoryRouter initialEntries={[path]}>
        <MobileTabBar />
        <AddDialogState />
      </MemoryRouter>
    </HabitsStateProvider>,
  );
}

describe('MobileTabBar', () => {
  it('links to the tracker, habits, progress and coach', () => {
    renderBar();

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tracker' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Habits' })).toHaveAttribute(
      'href',
      '/habits',
    );
    expect(screen.getByRole('link', { name: 'Progress' })).toHaveAttribute(
      'href',
      '/progress',
    );
    expect(screen.getByRole('link', { name: 'Coach' })).toHaveAttribute(
      'href',
      '/coach',
    );
  });

  it('marks the current route', () => {
    renderBar('/progress');

    expect(screen.getByRole('link', { name: 'Progress' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Tracker' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('opens the Add Habit dialog from its Add button', async () => {
    renderBar();

    expect(
      screen.getByRole('status', { name: 'Add dialog' }),
    ).toHaveTextContent('false');
    await userEvent.click(screen.getByRole('button', { name: 'Add Habit' }));
    expect(
      screen.getByRole('status', { name: 'Add dialog' }),
    ).toHaveTextContent('true');
  });

  it('marks the Coach tab current on the Coach page', () => {
    renderBar('/coach');

    expect(screen.getByRole('link', { name: 'Coach' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

describe('MobileTabBar on a second tap', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('scrolls the current tab back to its top, as an iOS tab bar does', async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    renderBar('/habits');

    await userEvent.click(screen.getByRole('link', { name: 'Habits' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('leaves the scrolling to the new tab when moving to another', async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    renderBar('/habits');

    await userEvent.click(screen.getByRole('link', { name: 'Progress' }));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
