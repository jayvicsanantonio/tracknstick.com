// Covers one streak figure on the progress page and how it reads its length.
// A one-day streak says "1 day", not "1 days".

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StreakDisplayDays from '../StreakDisplayDays';

describe('StreakDisplayDays', () => {
  it('reads a one-day streak in the singular', () => {
    render(<StreakDisplayDays value={1} label="Current Streak" />);

    const figure = screen.getByRole('status', {
      name: 'Current Streak: 1 day',
    });
    expect(figure).toHaveTextContent('day');
    expect(figure).not.toHaveTextContent('days');
  });

  it('reads other lengths in the plural', () => {
    render(<StreakDisplayDays value={0} label="Longest Streak" />);

    expect(
      screen.getByRole('status', { name: 'Longest Streak: 0 days' }),
    ).toHaveTextContent('days');
  });
});
