// Covers one figure in the progress page's summary row, such as the current streak.
// Each is a single status reading its label, value and unit; it can be loading, missing or badged.

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

  it('reads and shows a missing value as no data yet, not as a figure', () => {
    render(<ProgressStat Icon={Flame} label="November average" value={null} />);

    const figure = screen.getByRole('status', {
      name: 'November average: no data yet',
    });
    expect(figure).toHaveTextContent('No data yet');
  });

  it('shows no figure while loading, so a streak never flashes as 0', () => {
    render(
      <ProgressStat
        Icon={Flame}
        label="Current streak"
        value={0}
        unit="day"
        loading
      />,
    );

    const figure = screen.getByRole('status', {
      name: 'Current streak: loading',
    });
    expect(figure).toHaveAttribute('aria-busy', 'true');
    expect(figure).not.toHaveTextContent('0');
  });

  it('shows a badge beside the label when given one', () => {
    render(
      <ProgressStat
        Icon={Flame}
        label="Current streak"
        value={3}
        unit="day"
        badge="Best yet"
      />,
    );

    expect(
      screen.getByRole('status', { name: 'Current streak: 3 days, best yet' }),
    ).toHaveTextContent('Best yet');
  });
});
