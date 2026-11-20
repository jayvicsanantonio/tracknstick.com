// Covers the progress page's tabs and how each is named for assistive technology.
// The completion tab reads "Rates" on phones, so its name has to contain both visible labels.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressTabs from '../ProgressTabs';

vi.mock('../../hooks/useAchievements', () => ({
  useAchievements: () => ({ achievements: [], stats: null, loading: false }),
  useAchievementProgress: () => ({
    selectedCategory: 'all',
    setSelectedCategory: vi.fn(),
  }),
}));

describe('ProgressTabs', () => {
  it('names the completion tab with both its phone and its desktop label', () => {
    render(
      <ProgressTabs
        historyData={[]}
        selectedMonth={new Date(2026, 10, 1)}
        setSelectedMonth={vi.fn()}
        isLoading={false}
      />,
    );

    const tab = screen.getByRole('tab', { name: 'Completion Rates' });
    // WCAG label-in-name: speech input users say what they see.
    expect(tab).toHaveAccessibleName(expect.stringContaining('Rates'));
    expect(tab).toHaveAccessibleName(
      expect.stringContaining('Completion Rate'),
    );
  });
});
