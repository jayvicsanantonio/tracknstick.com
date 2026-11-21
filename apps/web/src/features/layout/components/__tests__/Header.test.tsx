// Covers the header's navigation links, the logo link, and the toolbar's habit coach button.
// The coach button sits beside Add Habit and reports whether the chat panel is open.

import '@testing/mocks';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Header from '@/features/layout/components/Header';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import ThemeProvider from '@app/providers/ThemeProvider';

const renderHeader = ({
  isChatOpen = false,
  onToggleChat = vi.fn(),
}: { isChatOpen?: boolean; onToggleChat?: () => void } = {}) => {
  return render(
    <ThemeProvider>
      <HabitsStateProvider>
        <BrowserRouter>
          <Header isChatOpen={isChatOpen} onToggleChat={onToggleChat} />
        </BrowserRouter>
      </HabitsStateProvider>
    </ThemeProvider>,
  );
};

describe('Header Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links', () => {
    renderHeader();

    // Should show link elements
    const dailyLink = screen.getByRole('link', { name: /daily tracker/i });
    const habitsLink = screen.getByRole('link', { name: /habits overview/i });
    const progressLink = screen.getByRole('link', {
      name: /progress overview/i,
    });

    expect(dailyLink).toBeInTheDocument();
    expect(habitsLink).toBeInTheDocument();
    expect(progressLink).toBeInTheDocument();

    // Check href attributes
    expect(dailyLink).toHaveAttribute('href', '/');
    expect(habitsLink).toHaveAttribute('href', '/habits');
    expect(progressLink).toHaveAttribute('href', '/progress');
  });

  it('applies active styles to current route', () => {
    // Render with a specific route using MemoryRouter
    render(
      <ThemeProvider>
        <HabitsStateProvider>
          <MemoryRouter initialEntries={['/habits']}>
            <Header isChatOpen={false} onToggleChat={vi.fn()} />
          </MemoryRouter>
        </HabitsStateProvider>
      </ThemeProvider>,
    );

    const habitsLink = screen.getByRole('link', { name: /habits overview/i });
    const dailyLink = screen.getByRole('link', { name: /daily tracker/i });

    // Active link should have specific active classes
    expect(habitsLink).toHaveClass('bg-(--color-brand-secondary)');
    expect(dailyLink).not.toHaveClass('bg-(--color-brand-secondary)');
  });

  it('shows a text label on each navigation link', () => {
    renderHeader();

    expect(
      screen.getByRole('link', { name: /daily tracker/i }),
    ).toHaveTextContent('Tracker');
    expect(
      screen.getByRole('link', { name: /habits overview/i }),
    ).toHaveTextContent('Habits');
    expect(
      screen.getByRole('link', { name: /progress overview/i }),
    ).toHaveTextContent('Progress');
  });

  it('links the logo to the tracker', () => {
    renderHeader();

    expect(
      screen.getByRole('link', { name: "Track N' Stick" }),
    ).toHaveAttribute('href', '/');
  });

  it('toggles the habit coach from a toolbar button beside Add Habit', async () => {
    const onToggleChat = vi.fn();
    renderHeader({ onToggleChat });

    // The signed-in toolbar; the Clerk mock renders the signed-out one too.
    const coach = screen.getByRole('button', { name: 'Coach' });
    const toolbar = coach.closest<HTMLElement>('[role="toolbar"]');
    expect(toolbar).toHaveAccessibleName('User actions');
    const buttons = within(toolbar!).getAllByRole('button');
    const add = within(toolbar!).getByRole('button', {
      name: 'Add Habit',
    });
    expect(buttons.indexOf(coach)).toBe(buttons.indexOf(add) + 1);

    await userEvent.click(coach);
    expect(onToggleChat).toHaveBeenCalledTimes(1);
  });

  it('marks the coach button expanded, and active like a current page, while the chat is open', () => {
    const { unmount } = renderHeader({ isChatOpen: false });
    // The Button stub from @testing/mocks renders the variant it is given as
    // an attribute; brandTonalActive is the active nav links' variant.
    const closed = screen.getByRole('button', { name: 'Coach' });
    expect(closed).toHaveAttribute('aria-expanded', 'false');
    expect(closed).toHaveAttribute('variant', 'brandTonal');
    unmount();

    renderHeader({ isChatOpen: true });
    const open = screen.getByRole('button', { name: 'Coach' });
    expect(open).toHaveAttribute('aria-expanded', 'true');
    expect(open).toHaveAttribute('variant', 'brandTonalActive');
  });
});
