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

    // Active link should have specific active classes
    expect(habitsLink).toHaveClass('bg-(--color-brand-secondary)');
    expect(dailyLink).not.toHaveClass('bg-(--color-brand-secondary)');
  });
});
