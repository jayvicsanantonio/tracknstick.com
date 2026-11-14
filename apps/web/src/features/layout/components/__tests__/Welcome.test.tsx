// Covers the signed-out welcome page: its heading and the Clerk sign-in form.
// The page has no animation, so it renders no canvas.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
