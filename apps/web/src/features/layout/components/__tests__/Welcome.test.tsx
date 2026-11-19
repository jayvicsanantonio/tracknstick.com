// Covers the signed-out welcome page: its heading and the Clerk sign-in form.
// The page has no animation, so it renders no canvas.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Welcome from '@/features/layout/components/Welcome';
import ThemeProvider from '@app/providers/ThemeProvider';

vi.mock('@clerk/clerk-react', () => ({
  SignIn: () => <div data-testid="sign-in" />,
}));

function renderWelcome() {
  return render(
    <ThemeProvider>
      <Welcome />
    </ThemeProvider>,
  );
}

describe('Welcome', () => {
  it('shows the heading and the sign-in form', () => {
    renderWelcome();

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('sign-in')).toBeInTheDocument();
  });

  it('renders no animation canvas', () => {
    const { container } = renderWelcome();

    expect(container.querySelector('canvas')).toBeNull();
  });

  it('lists what the app offers', () => {
    renderWelcome();

    const features = screen.getByRole('list', { name: 'What you get' });
    const items = within(features).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(features).toHaveTextContent('Check in daily');
    expect(features).toHaveTextContent('See your progress');
    expect(features).toHaveTextContent('Ask the coach');
  });

  it('keeps the illustrative tracker preview out of the accessibility tree', () => {
    const { container } = renderWelcome();

    const preview = container.querySelector('[data-tracker-preview]');
    expect(preview).not.toBeNull();
    expect(preview).toHaveAttribute('aria-hidden', 'true');
  });
});
