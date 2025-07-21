import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import '@testing-library/jest-dom';

describe('Routing', () => {
  it('renders DashboardPage at root path', () => {
    renderWithRouter({ initialEntries: ['/'] });
    expect(screen.getByText(/daily habit tracker/i)).toBeInTheDocument();
  });

  it('renders HabitsPage at /habits path', () => {
    renderWithRouter({ initialEntries: ['/habits'] });
    expect(
      screen.getByRole('heading', { name: /habits/i }),
    ).toBeInTheDocument();
  });

  it('renders ProgressPage at /progress path', () => {
    renderWithRouter({ initialEntries: ['/progress'] });
    expect(
      screen.getByRole('heading', { name: /progress/i }),
    ).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown paths', () => {
    renderWithRouter({ initialEntries: ['/unknown'] });
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
