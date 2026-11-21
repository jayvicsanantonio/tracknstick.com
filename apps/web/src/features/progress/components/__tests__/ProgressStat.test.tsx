// Covers one figure in the progress page's summary row, such as the current streak.
// Each is a single status that reads its label, value and unit, with "1 day" in the singular.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Flame } from 'lucide-react';
import ProgressStat from '../ProgressStat';

describe('ProgressStat', () => {
  it('reads a one-day streak in the singular', () => {
    render(
      <ProgressStat Icon={Flame} label="Current streak" value={1} unit="day" />,
    );

    const figure = screen.getByRole('status', {
      name: 'Current streak: 1 day',
    });
    expect(figure).toHaveTextContent('day');
    expect(figure).not.toHaveTextContent('days');
  });

  it('reads other counts in the plural', () => {
    render(
      <ProgressStat Icon={Flame} label="Longest streak" value={0} unit="day" />,
    );

    expect(
      screen.getByRole('status', { name: 'Longest streak: 0 days' }),
    ).toHaveTextContent('days');
  });

  it('shows a value that carries its own unit, such as a percentage', () => {
    render(<ProgressStat Icon={Flame} label="November average" value="72%" />);

    expect(
      screen.getByRole('status', { name: 'November average: 72%' }),
    ).toHaveTextContent('72%');
  });
});
