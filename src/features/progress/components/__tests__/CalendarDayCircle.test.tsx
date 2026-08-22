import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CalendarDayCircle from '../CalendarDayCircle';

describe('CalendarDayCircle', () => {
  it('reports a completed day', () => {
    const { getByRole, container } = render(
      <CalendarDayCircle
        dayData={{ date: '2026-08-01', completionRate: 80 }}
        isPast
        isToday={false}
      />,
    );

    expect(getByRole('img')).toHaveAttribute('aria-label', '80% completion');
    expect(container.textContent).toContain('80%');
  });

  it('quotes no rate for a day that has not happened', () => {
    // A future cell previously rendered a flat 0%, which reads as a missed
    // day rather than one still to come.
    const { getByRole, container } = render(
      <CalendarDayCircle isPast={false} isToday={false} />,
    );

    expect(getByRole('img')).toHaveAttribute('aria-label', 'Future day');
    expect(container.textContent).not.toContain('%');
  });

  it('reports a past day with no data as untouched', () => {
    const { getByRole } = render(<CalendarDayCircle isPast isToday={false} />);

    expect(getByRole('img')).toHaveAttribute('aria-label', '0% completion');
  });
});
