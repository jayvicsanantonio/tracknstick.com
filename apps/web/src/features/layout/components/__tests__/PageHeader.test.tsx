// Covers the tablet & desktop page header shared by Tracker, Habits, Progress and Coach.
// Each page passes its title, a one-line description and an optional action.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/features/layout/components/PageHeader';

describe('PageHeader', () => {
  it('shows the title as a heading with its description', () => {
    render(<PageHeader title="Habits" description="Manage all your habits" />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Habits' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Manage all your habits')).toBeInTheDocument();
  });

  it('shows the action beside the title', () => {
    render(
      <PageHeader
        title="Habit Coach"
        description="Advice grounded in Atomic Habits"
        action={<button type="button">New chat</button>}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'New chat' }),
    ).toBeInTheDocument();
  });

  it('can show a decorative title that is not a heading', () => {
    render(
      <PageHeader
        title="Today"
        description="Check off the habits scheduled for this day"
        decorativeTitle
      />,
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });
});
