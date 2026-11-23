// Covers the header's navigation links, including the habit coach's, and the logo link.
// Coach is a page like Tracker, Habits and Progress, linked after them.

import '@testing/mocks';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    // Active link carries aria-current="page" and renders the Liquid Glass active lens
    expect(habitsLink).toHaveAttribute('aria-current', 'page');
    expect(habitsLink.querySelector('.ios-liquid-lens')).toBeInTheDocument();
    expect(dailyLink).not.toHaveAttribute('aria-current', 'page');
    expect(dailyLink.querySelector('.ios-liquid-lens')).not.toBeInTheDocument();
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

    const coachLink = screen.getByRole('link', { name: 'Habit Coach' });
    expect(coachLink).toHaveAttribute('aria-current', 'page');
    expect(coachLink.querySelector('.ios-liquid-lens')).toBeInTheDocument();
  });

  it('has no separate coach button', () => {
    renderHeader();

    expect(
      screen.queryByRole('button', { name: 'Coach' }),
    ).not.toBeInTheDocument();
  });
});
