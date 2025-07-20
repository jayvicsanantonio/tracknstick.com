import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { router } from '@/routes';
import '@testing-library/jest-dom';

const renderWithRouter = (route = '/') => {
  window.history.pushState({}, 'Test page', route);
  return render(<RouterProvider router={router} />);
};

describe('Routing', () => {
  it('renders DashboardPage at root path', () => {
    renderWithRouter('/');
    expect(screen.getByText(/daily habit tracker/i)).toBeInTheDocument();
  });

  it('renders HabitsPage at /habits path', () => {
    renderWithRouter('/habits');
    expect(screen.getByText(/habits/i)).toBeInTheDocument();
  });

  it('renders ProgressPage at /progress path', () => {
    renderWithRouter('/progress');
    expect(screen.getByText(/progress/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown paths', () => {
    renderWithRouter('/unknown');
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
