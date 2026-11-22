// Covers the phone-width bottom navigation: its four destinations and its Add button.
// The bar marks the current route and opens the Add Habit dialog.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import MobileTabBar from '@/features/layout/components/MobileTabBar';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

/** Shows whether the Add Habit dialog is open, as the context reports it. */
function AddDialogState() {
  const { showAddHabitDialog } = useHabitsContext();
  return <output aria-label="Add dialog">{String(showAddHabitDialog)}</output>;
}

/** Shows the current history entry, which changes on every navigation. */
function LocationKey() {
  return <output aria-label="Location key">{useLocation().key}</output>;
}

function renderBar(path = '/') {
  render(
    <HabitsStateProvider>
      <MemoryRouter initialEntries={[path]}>
        <MobileTabBar />
        <AddDialogState />
        <LocationKey />
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

  it('stays on the same history entry, so nothing restores the old scroll position', async () => {
    vi.stubGlobal('scrollTo', vi.fn());
    renderBar('/habits');
    const key = screen.getByRole('status', { name: 'Location key' });
    const before = key.textContent;

    await userEvent.click(screen.getByRole('link', { name: 'Habits' }));

    expect(key).toHaveTextContent(before ?? '');
  });

  it('leaves the scrolling to the new tab when moving to another', async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    renderBar('/habits');

    await userEvent.click(screen.getByRole('link', { name: 'Progress' }));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('MobileTabBar while typing', () => {
  it('steps out of the way while the keyboard is up, as iOS hides it', () => {
    renderBar();

    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass(
      'keyboard-open:hidden',
    );
  });
});

describe('MobileTabBar layout, as iOS 26 draws a tab bar', () => {
  it('keeps the four tabs in one capsule, and Add Habit in a round button of its own beside it', () => {
    renderBar();

    const capsule = screen
      .getByRole('link', { name: 'Tracker' })
      .closest('[data-tab-capsule]');
    expect(capsule).not.toBeNull();
    for (const name of ['Habits', 'Progress', 'Coach']) {
      expect(capsule).toContainElement(screen.getByRole('link', { name }));
    }
    expect(capsule).not.toContainElement(
      screen.getByRole('button', { name: 'Add Habit' }),
    );
  });

  it('marks the open tab with a highlight that slides between the tabs', () => {
    renderBar('/progress');

    const highlighted = document.querySelectorAll('[data-tab-highlight]');
    expect(highlighted).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Progress' })).toContainElement(
      highlighted[0] as HTMLElement,
    );
  });
});
