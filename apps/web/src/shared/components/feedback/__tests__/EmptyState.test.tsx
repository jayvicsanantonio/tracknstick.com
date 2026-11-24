// Covers the shared empty state: an icon, a heading at the level asked for, its detail, and its actions.
// Every page's "nothing here yet" card is built from it, so they read alike.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sprout } from 'lucide-react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('shows its title as a heading, its detail, and its actions', () => {
    render(
      <EmptyState
        Icon={Sprout}
        title="No habits yet"
        detail="Add your first habit to start a streak."
      >
        <button type="button">Add habit</button>
      </EmptyState>,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'No habits yet' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Add your first habit to start a streak.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add habit' }),
    ).toBeInTheDocument();
  });

  it('uses the heading level a page asks for', () => {
    render(
      <EmptyState
        Icon={Sprout}
        title="Nothing scheduled"
        detail="Nothing is due."
        headingLevel={3}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Nothing scheduled' }),
    ).toBeInTheDocument();
  });

  it('leaves out the actions row when there are no actions', () => {
    const { container } = render(
      <EmptyState Icon={Sprout} title="No archived habits" detail="None." />,
    );

    expect(
      container.querySelector('[data-empty-state-actions]'),
    ).not.toBeInTheDocument();
  });
});
