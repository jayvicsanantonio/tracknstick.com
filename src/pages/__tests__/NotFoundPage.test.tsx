// Exercises the 404 page's navigation against a real router
// The deleted navigation.ts test mocked react-router-dom, so it asserted
// only that a one-line pass-through passed a string through.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
}

function renderAt(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <LocationProbe /> },
      { path: '/habits', element: <LocationProbe /> },
      { path: '*', element: <NotFoundPage /> },
    ],
    { initialEntries, initialIndex: initialEntries.length - 1 },
  );
  return render(<RouterProvider router={router} />);
}

describe('NotFoundPage', () => {
  it('renders the 404 message for an unmatched route', () => {
    renderAt(['/nope']);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('"Go to Dashboard" navigates to /', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt(['/nope']);

    await user.click(screen.getByRole('button', { name: /go to dashboard/i }));

    expect(await screen.findByTestId('pathname')).toHaveTextContent('/');
  });

  it('"Go Back" returns to the previous entry through the router', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt(['/habits', '/nope']);

    await user.click(screen.getByRole('button', { name: /go back/i }));

    expect(await screen.findByTestId('pathname')).toHaveTextContent('/habits');
  });
});
