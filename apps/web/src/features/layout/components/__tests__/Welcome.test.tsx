// Covers the signed-out welcome page: its heading and the Clerk sign-in form.
// The page has no animation, so it renders no canvas.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Welcome from '@/features/layout/components/Welcome';
import ThemeProvider from '@app/providers/ThemeProvider';
import { THEME_STORAGE_KEY } from '@shared/constants/theme';

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

  it('keeps the hero to a heading, a subtitle and the feature list', () => {
    const { container } = renderWelcome();

    expect(container.querySelector('[data-tracker-preview]')).toBeNull();
    expect(screen.queryByText(/habit tracker \+ ai coach/i)).toBeNull();
    expect(screen.queryByText(/free to try/i)).toBeNull();
  });

  it.each(['light', 'dark'])(
    'writes its %s theme copy without em dashes',
    (mode) => {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      const { container } = renderWelcome();

      expect(container).not.toHaveTextContent('\u2014');
      localStorage.removeItem(THEME_STORAGE_KEY);
    },
  );
});
