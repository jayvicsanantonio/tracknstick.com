// Covers the achievement category filter: which category is selected, and switching it.
// Each category is a toggle button whose pressed state shows the current filter.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementCategoryTabs from '../AchievementCategoryTabs';
import type { Achievement } from '../../types/Achievement';

const achievement = (overrides: Partial<Achievement>) =>
  ({
    id: '1',
    key: 'first_step',
    name: 'First Step',
    description: 'Create your very first habit',
    type: 'habit_creation',
    category: 'getting_started',
    requirementType: 'count',
    requirementValue: 1,
    isEarned: false,
    ...overrides,
  }) satisfies Achievement;

describe('AchievementCategoryTabs', () => {
  it('marks the selected category as pressed', () => {
    render(
      <AchievementCategoryTabs
        achievements={[achievement({})]}
        selectedCategory="all"
        onCategoryChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /All/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('button', { name: /Getting Started/ }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports the category the user picks', async () => {
    const onCategoryChange = vi.fn();
    render(
      <AchievementCategoryTabs
        achievements={[achievement({})]}
        selectedCategory="all"
        onCategoryChange={onCategoryChange}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Getting Started/ }),
    );
    expect(onCategoryChange).toHaveBeenCalledWith('getting_started');
  });
});
