// Covers the tracker's progress ring: the day's completion as a percentage, and a checkmark once every habit is done.
// The ring reads its percentage to assistive technology either way.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeProvider from '@app/providers/ThemeProvider';
import DailyHabitProgressIndicator from '../DailyHabitProgressIndicator';

function renderRing(completionRate: number) {
  render(
    <ThemeProvider>
      <DailyHabitProgressIndicator completionRate={completionRate} />
    </ThemeProvider>,
  );
}

describe('DailyHabitProgressIndicator', () => {
  it('shows the percentage done inside the ring', () => {
    renderRing(50);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Daily habit completion: 50%'),
    ).toBeInTheDocument();
  });

  it('shows no percentage once every habit is done, and still reads it', () => {
    renderRing(100);

    // The checkmark stands in for "100%".
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Daily habit completion: 100%'),
    ).toBeInTheDocument();
  });
});
