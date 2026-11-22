// Covers the tracker's segmented progress ring: one segment per habit due that
// day, percentage in the center while in progress, and the connect-then-checkmark
// sequence once every habit is done.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import ThemeProvider from '@app/providers/ThemeProvider';
import DailyHabitProgressIndicator from '../DailyHabitProgressIndicator';

interface RingProps {
  completionRate: number;
  totalHabits: number;
  completedHabits: number;
}

function renderRing(props: RingProps) {
  return render(
    <ThemeProvider>
      <DailyHabitProgressIndicator {...props} />
    </ThemeProvider>,
  );
}

describe('DailyHabitProgressIndicator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows only the completion percentage inside the ring while in progress', () => {
    renderRing({ completionRate: 50, totalHabits: 2, completedHabits: 1 });

    const ring = screen.getByRole('progressbar', {
      name: 'Daily habit completion: 50%',
    });
    expect(ring).toHaveTextContent(/^50%$/);
    expect(ring).toHaveAttribute('aria-valuenow', '50');
    expect(screen.queryByText(/completed/i)).not.toBeInTheDocument();
  });

  it('shows a connected ring and checkmark instead of 100% when already complete', () => {
    const { container } = renderRing({
      completionRate: 100,
      totalHabits: 2,
      completedHabits: 2,
    });

    const ring = screen.getByRole('progressbar', {
      name: 'Daily habit completion: 100%',
    });
    expect(ring).toHaveAttribute('data-connected', 'true');
    expect(ring).toHaveAttribute(
      'aria-valuetext',
      '100%, 2 of 2 habits completed',
    );
    expect(ring).toHaveTextContent('');
    expect(container.querySelector('[data-completion-check]')).toBeTruthy();
  });

  it('connects all segments first and then reveals the checkmark when the last habit finishes', () => {
    vi.useFakeTimers();

    const { container, rerender } = renderRing({
      completionRate: 50,
      totalHabits: 2,
      completedHabits: 1,
    });

    const ring = screen.getByRole('progressbar', {
      name: 'Daily habit completion: 50%',
    });
    expect(ring).toHaveAttribute('data-connected', 'false');
    expect(container.querySelector('[data-completion-check]')).toBeNull();

    rerender(
      <ThemeProvider>
        <DailyHabitProgressIndicator
          completionRate={100}
          totalHabits={2}
          completedHabits={2}
        />
      </ThemeProvider>,
    );

    // Beat 1: final segment fills while gaps are still open.
    expect(ring).toHaveAttribute('data-connected', 'false');
    expect(container.querySelector('[data-completion-check]')).toBeNull();

    // Beat 2: segments connect across the gaps before the checkmark takes over.
    act(() => {
      vi.advanceTimersByTime(360);
    });
    expect(ring).toHaveAttribute('data-connected', 'true');
    expect(container.querySelector('[data-completion-check]')).toBeNull();

    // Beat 3: checkmark replaces the percentage in the center.
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(ring).toHaveAttribute('data-connected', 'true');
    expect(container.querySelector('[data-completion-check]')).toBeTruthy();

    // Unchecking a habit immediately separates the segments and returns the percentage.
    rerender(
      <ThemeProvider>
        <DailyHabitProgressIndicator
          completionRate={50}
          totalHabits={2}
          completedHabits={1}
        />
      </ThemeProvider>,
    );
    expect(ring).toHaveAttribute('data-connected', 'false');
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(ring).toHaveTextContent(/^50%$/);
  });

  it('divides the circle into one segment and gap bridge per habit and fills completed segments', () => {
    const { container } = renderRing({
      completionRate: 60,
      totalHabits: 5,
      completedHabits: 3,
    });

    expect(container.querySelectorAll('[data-segment]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-segment-bridge]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-completed="true"]')).toHaveLength(
      3,
    );
    expect(container.querySelectorAll('[data-completed="false"]')).toHaveLength(
      2,
    );
  });

  it('renders a single full-circle segment with no gap bridges when there is one habit for the day', () => {
    const { container } = renderRing({
      completionRate: 0,
      totalHabits: 1,
      completedHabits: 0,
    });

    expect(container.querySelectorAll('[data-segment]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-segment-bridge]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-completed="true"]')).toHaveLength(
      0,
    );
  });
});
