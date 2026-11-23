// Covers the signed-out welcome page on a phone: one screen that says what the app does and how to start.
// Sign-up leads, sign-in is a tap away, and both open Clerk's form in a bottom sheet.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Welcome from '@/features/layout/components/Welcome';
import ThemeProvider from '@app/providers/ThemeProvider';
import { THEME_STORAGE_KEY } from '@shared/constants/theme';

vi.mock('@shared/hooks/useIsMobile', () => ({ useIsMobile: () => true }));

vi.mock('@clerk/clerk-react', () => ({
  SignIn: ({ routing }: { routing?: string }) => (
    <div data-testid="sign-in" data-routing={routing} />
  ),
  SignUp: ({ routing }: { routing?: string }) => (
    <div data-testid="sign-up" data-routing={routing} />
  ),
}));

function renderWelcome(mode: 'light' | 'dark' = 'light') {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  return render(
    <ThemeProvider>
      <Welcome />
    </ThemeProvider>,
  );
}

describe('Welcome on a phone', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it.each([
    ['light', 'Sparkle Up', /habits that shine/i],
    ['dark', 'Defy Gravity', /habits that stick/i],
  ] as const)(
    'greets with the %s theme headline and its subtitle',
    (mode, title, subtitle) => {
      renderWelcome(mode);

      expect(
        screen.getByRole('heading', { level: 1, name: title }),
      ).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    },
  );

  it('shows the app icon and name at the top', () => {
    const { container } = renderWelcome();

    expect(screen.getByText("Track N' Stick")).toBeInTheDocument();
    expect(
      container.querySelector('img[src="/icons/favicon.svg"]'),
    ).toHaveAttribute('alt', '');
  });

  it('explains how it works in three short steps', () => {
    renderWelcome();

    const steps = screen.getByRole('list', { name: 'How it works' });
    const items = within(steps).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Check in daily');
    expect(items[1]).toHaveTextContent('See your progress');
    expect(items[2]).toHaveTextContent('Ask the coach');
  });

  it('leads with Get started and keeps sign-in a tap away, with no form on the page', () => {
    renderWelcome();

    expect(
      screen.getByRole('button', { name: 'Get started' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'I already have an account' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('sign-in')).toBeNull();
    expect(screen.queryByTestId('sign-up')).toBeNull();
  });

  it("opens Clerk's sign-up in a sheet from Get started", async () => {
    const user = userEvent.setup();
    renderWelcome();

    await user.click(screen.getByRole('button', { name: 'Get started' }));

    const sheet = await screen.findByRole('dialog', {
      name: 'Create your account',
    });
    // Virtual routing keeps Clerk's steps inside the sheet, off the URL.
    expect(within(sheet).getByTestId('sign-up')).toHaveAttribute(
      'data-routing',
      'virtual',
    );
  });

  it("opens Clerk's sign-in in a sheet for someone coming back", async () => {
    const user = userEvent.setup();
    renderWelcome();

    await user.click(
      screen.getByRole('button', { name: 'I already have an account' }),
    );

    const sheet = await screen.findByRole('dialog', { name: 'Welcome back' });
    expect(within(sheet).getByTestId('sign-in')).toHaveAttribute(
      'data-routing',
      'virtual',
    );
  });

  it('switches between signing up and signing in inside the sheet', async () => {
    const user = userEvent.setup();
    renderWelcome();
    await user.click(screen.getByRole('button', { name: 'Get started' }));

    await user.click(
      within(
        await screen.findByRole('dialog', { name: 'Create your account' }),
      ).getByRole('button', { name: 'Sign in' }),
    );
    const signIn = await screen.findByRole('dialog', { name: 'Welcome back' });
    expect(within(signIn).getByTestId('sign-in')).toBeInTheDocument();

    await user.click(within(signIn).getByRole('button', { name: 'Sign up' }));
    expect(
      await screen.findByRole('dialog', { name: 'Create your account' }),
    ).toBeInTheDocument();
  });

  it('closes the sheet from its Close button', async () => {
    const user = userEvent.setup();
    renderWelcome();
    await user.click(screen.getByRole('button', { name: 'Get started' }));
    const sheet = await screen.findByRole('dialog', {
      name: 'Create your account',
    });

    await user.click(within(sheet).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('switches the theme from the top bar', async () => {
    const user = userEvent.setup();
    renderWelcome('light');

    await user.click(screen.getByRole('button', { name: 'Toggle Theme' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Defy Gravity' }),
    ).toBeInTheDocument();
  });

  it('leaves the tablet and desktop feature cards off the phone', () => {
    renderWelcome();

    expect(screen.queryByRole('list', { name: 'What you get' })).toBeNull();
  });
});
