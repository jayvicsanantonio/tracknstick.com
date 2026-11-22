// Covers how the Tracker, Habits and Progress pages appear: at once, as a native app's tabs do.
// Each page's feature is stubbed; the page around it is real.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/pages/DashboardPage';
import HabitsPage from '@/pages/HabitsPage';
import ProgressPage from '@/pages/ProgressPage';
import { isEnteringOnScreen } from '@testing/utils';

vi.mock('@/features/habits/components/DailyHabitTracker', () => ({
  default: () => <p>Tracker content</p>,
}));
vi.mock('@/features/habits/components/HabitsOverview', () => ({
  default: () => <p>Habits content</p>,
}));
vi.mock('@/features/progress/components/ProgressOverview', () => ({
  default: () => <p>Progress content</p>,
}));

describe.each([
  ['Tracker', DashboardPage],
  ['Habits', HabitsPage],
  ['Progress', ProgressPage],
])('the %s page', (name, Page) => {
  it('shows its content at once, without fading or sliding it in', () => {
    render(<Page />);

    expect(isEnteringOnScreen(screen.getByText(`${name} content`))).toBe(false);
  });
});
