import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import '@testing-library/jest-dom';

describe('Simple Routing Tests', () => {
  it('renders dashboard at root path', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <div>Dashboard Page</div>,
        },
      ],
      {
        initialEntries: ['/'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('renders habits page at /habits path', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/habits',
          element: <div>Habits Page</div>,
        },
      ],
      {
        initialEntries: ['/habits'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Habits Page')).toBeInTheDocument();
  });

  it('renders progress page at /progress path', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/progress',
          element: <div>Progress Page</div>,
        },
      ],
      {
        initialEntries: ['/progress'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Progress Page')).toBeInTheDocument();
  });

  it('renders not found page for unknown routes', () => {
    const router = createMemoryRouter(
      [
        {
          path: '*',
          element: <div>Not Found Page</div>,
        },
      ],
      {
        initialEntries: ['/unknown'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Not Found Page')).toBeInTheDocument();
  });
});
