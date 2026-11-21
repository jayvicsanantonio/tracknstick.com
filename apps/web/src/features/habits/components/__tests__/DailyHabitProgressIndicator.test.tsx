// Covers the tracker's progress ring: the day's completion as a percentage, and a checkmark once every habit is done.
// The ring reads its percentage to assistive technology either way.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeProvider from '@app/providers/ThemeProvider';
import DailyHabitProgressIndicator from '../DailyHabitProgressIndicator';

function renderRing(completionRate: number) {
  const { container } = render(
    <ThemeProvider>
      <DailyHabitProgressIndicator completionRate={completionRate} />
    </ThemeProvider>,
  );
  return container;
}

describe('DailyHabitProgressIndicator', () => {
  it('shows the percentage done inside the ring', () => {
    renderRing(50);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Daily habit completion: 50%'),
    ).toBeInTheDocument();
  });

  it('shows a checkmark instead of the percentage once every habit is done', () => {
    const container = renderRing(100);

    expect(screen.queryByText('100%')).not.toBeInTheDocument();
    expect(container.querySelector('svg.lucide-check')).not.toBeNull();
    expect(
      screen.getByLabelText('Daily habit completion: 100%'),
    ).toBeInTheDocument();
  });
});
