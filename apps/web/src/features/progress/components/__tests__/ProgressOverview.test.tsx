// Covers what the progress page shows when its data cannot be loaded.
// A failed request shows an error, not an empty calendar that reads as "no progress".

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgressOverview from '../ProgressOverview';
import useProgressHistory from '../../hooks/useProgressHistory';
import useProgressStreaks from '../../hooks/useProgressStreaks';

vi.mock('../../hooks/useProgressHistory', () => ({ default: vi.fn() }));
vi.mock('../../hooks/useProgressStreaks', () => ({ default: vi.fn() }));
vi.mock('../ProgressTabs', () => ({
  default: () => <div data-testid="progress-tabs" />,
}));

const loaded = {
  history: { historyData: [], isLoading: false, error: undefined },
  streaks: {
    currentStreak: 2,
    longestStreak: 5,
    isLoading: false,
    error: undefined,
  },
};

function renderOverview() {
  render(
    <MemoryRouter>
      <ProgressOverview />
    </MemoryRouter>,
  );
}

describe('ProgressOverview', () => {
  beforeEach(() => {
    vi.mocked(useProgressHistory).mockReturnValue(loaded.history);
    vi.mocked(useProgressStreaks).mockReturnValue(loaded.streaks);
  });

  it('shows the streaks and the progress tabs once loaded', () => {
    renderOverview();

    expect(screen.getByTestId('progress-tabs')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error instead of the progress when the history fails to load', () => {
    vi.mocked(useProgressHistory).mockReturnValue({
      ...loaded.history,
      error: new Error('Network Error'),
    });

    renderOverview();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your progress could not be loaded',
    );
    expect(screen.queryByTestId('progress-tabs')).not.toBeInTheDocument();
  });

  it('shows an error instead of the progress when the streaks fail to load', () => {
    vi.mocked(useProgressStreaks).mockReturnValue({
      ...loaded.streaks,
      error: new Error('Network Error'),
    });

    renderOverview();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your progress could not be loaded',
    );
    expect(screen.queryByTestId('progress-tabs')).not.toBeInTheDocument();
  });

  it('has no back button, since the header navigation covers it', () => {
    renderOverview();

    expect(
      screen.queryByRole('button', { name: /back/i }),
    ).not.toBeInTheDocument();
  });
});
