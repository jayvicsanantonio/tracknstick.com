// A route that throws must render the fallback, not a blank page

import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import RouteErrorBoundary from '../RouteErrorBoundary';
import ErrorBoundary from '../ErrorBoundary';

function Boom(): React.ReactElement {
  throw new Error('render exploded');
}

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    // React logs the caught error; keep the test output readable
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the fallback when a route element throws', () => {
    const router = createMemoryRouter(
      [{ path: '/', element: <Boom />, errorElement: <RouteErrorBoundary /> }],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /refresh page/i }),
    ).toBeInTheDocument();
  });

  it('renders a status-aware message for a route error response', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <div />,
          errorElement: <RouteErrorBoundary />,
          loader: () => {
            // React Router signals HTTP-shaped route errors with a Response
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw new Response('Not Found', {
              status: 404,
              statusText: 'Not Found',
            });
          },
        },
      ],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });
});

describe('ErrorBoundary (class, outside the router)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('catches a throwing child and shows the fallback', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child" />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
