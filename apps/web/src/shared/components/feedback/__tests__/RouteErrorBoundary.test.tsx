// A route that throws must render the fallback, not a blank page

import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

const mockRouteError = vi.hoisted(() => ({ value: undefined as unknown }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    // isRouteErrorResponse stays real so the branch is exercised, not faked
    useRouteError: () =>
      mockRouteError.value === undefined
        ? actual.useRouteError()
        : mockRouteError.value,
  };
});
import RouteErrorBoundary from '../RouteErrorBoundary';
import ErrorBoundary from '../ErrorBoundary';

function Boom(): React.ReactElement {
  throw new Error('render exploded');
}

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    mockRouteError.value = undefined;
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

  it('shapes a route error response into a status message', () => {
    // Driven through useRouteError directly. This branch only fires for
    // errors thrown by a loader or action, and this app defines none, so
    // going through the router would test React Router's plumbing rather
    // than the shaping done here -- and would depend on hydration timing.
    const routeErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      internal: false,
      data: null,
    };
    mockRouteError.value = routeErrorResponse;

    render(<RouteErrorBoundary />);

    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
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
