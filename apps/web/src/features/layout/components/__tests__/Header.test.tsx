// Covers the header: its navigation links and logo on wider screens, an iOS top bar on phones.
// The app follows the system appearance; the account menu holds the choice, not a header button.

import '@testing/mocks';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from '@shared/hooks/useTheme';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Header from '@/features/layout/components/Header';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import ThemeProvider from '@app/providers/ThemeProvider';

const renderHeader = () => {
  return render(
    <ThemeProvider>
      <HabitsStateProvider>
        <BrowserRouter>
          <Header />
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
            <Header />
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

  it('links to the habit coach after progress, like the other pages', () => {
    renderHeader();

    const coach = screen.getByRole('link', { name: 'Habit Coach' });
    expect(coach).toHaveAttribute('href', '/coach');
    expect(coach).toHaveTextContent('Coach');

    const links = screen.getAllByRole('link');
    const progress = screen.getByRole('link', { name: /progress overview/i });
    expect(links.indexOf(coach)).toBe(links.indexOf(progress) + 1);
  });

  it('marks the coach link active on the Coach page', () => {
    render(
      <ThemeProvider>
        <HabitsStateProvider>
          <MemoryRouter initialEntries={['/coach']}>
            <Header />
          </MemoryRouter>
        </HabitsStateProvider>
      </ThemeProvider>,
    );

    expect(screen.getByRole('link', { name: 'Habit Coach' })).toHaveClass(
      'bg-(--color-brand-secondary)',
    );
  });

  it('has no separate coach button', () => {
    renderHeader();

    expect(
      screen.queryByRole('button', { name: 'Coach' }),
    ).not.toBeInTheDocument();
  });
});

describe('Header appearance', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('has no theme button: the app follows the system appearance', () => {
    renderHeader();

    expect(
      screen.queryByRole('button', { name: 'Toggle Theme' }),
    ).not.toBeInTheDocument();
  });

  it('offers the appearance in the account menu, naming the current one', () => {
    const cyclePreference = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      preference: 'system',
      setPreference: vi.fn(),
      cyclePreference,
    });
    renderHeader();

    const [item] = screen.getAllByRole('button', {
      name: 'Appearance: System',
    });
    fireEvent.click(item);

    expect(cyclePreference).toHaveBeenCalledTimes(1);
  });
});

describe('Header on a phone', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderAt(path: string) {
    render(
      <ThemeProvider>
        <HabitsStateProvider>
          <MemoryRouter initialEntries={[path]}>
            <Header />
          </MemoryRouter>
        </HabitsStateProvider>
      </ThemeProvider>,
    );
    const bar = document.querySelector<HTMLElement>('[data-phone-bar]');
    if (!bar) throw new Error('No phone top bar');
    return bar;
  }

  it("names the page in a top bar of its own, as iOS's navigation bar does", () => {
    const bar = renderAt('/habits');

    expect(bar).toHaveClass('sm:hidden');
    expect(bar).toHaveTextContent('Habits');
  });

  it('shows that name, and a frosted background, once the large title scrolls under it', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);
    const bar = renderAt('/progress');
    expect(bar).toHaveAttribute('data-scrolled', 'false');

    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(120);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(bar).toHaveAttribute('data-scrolled', 'true');
  });

  it('keeps the logo for wider screens, where the page has no large title', () => {
    renderAt('/');

    expect(screen.getByRole('link', { name: "Track N' Stick" })).toHaveClass(
      'max-sm:hidden',
    );
  });
});
