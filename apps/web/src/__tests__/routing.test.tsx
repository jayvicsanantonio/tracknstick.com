import '@testing/mocks';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@testing/utils';
import '@testing-library/jest-dom';

// The pages are lazy-loaded, so each test waits for its page to appear.
describe('Routing', () => {
  it('renders DashboardPage at root path', async () => {
    renderWithRouter({ initialEntries: ['/'] });
    expect(await screen.findByText(/daily habit tracker/i)).toBeInTheDocument();
  });

  it('renders HabitsPage at /habits path', async () => {
    renderWithRouter({ initialEntries: ['/habits'] });
    expect(
      await screen.findByRole('heading', { name: /habits/i }),
    ).toBeInTheDocument();
  });

  it('renders ProgressPage at /progress path', async () => {
    renderWithRouter({ initialEntries: ['/progress'] });
    expect(
      await screen.findByRole('heading', { name: /progress/i }),
    ).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown paths', async () => {
    renderWithRouter({ initialEntries: ['/unknown'] });
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument();
  });
});
