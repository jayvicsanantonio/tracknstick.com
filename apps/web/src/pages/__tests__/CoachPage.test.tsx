// Covers the Coach page: the habit coach's chat as a page of its own, at /coach.
// Its title and subtitle follow the Habits and Progress pages; it offers the message box at once.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatConversationProvider } from '@features/chat/context/ChatConversationContext';
import CoachPage from '@/pages/CoachPage';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import type { Habit } from '@/features/habits/types/Habit';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: vi.fn() }),
}));
vi.mock('@/features/habits/hooks/useAllHabits', () => ({
  useAllHabits: vi.fn(),
}));

function mockAllHabits(habits: Habit[], isLoading = false) {
  vi.mocked(useAllHabits).mockReturnValue({
    habits,
    isLoading,
    error: undefined,
    deleteHabit: vi.fn(),
    retry: vi.fn(),
  } as unknown as ReturnType<typeof useAllHabits>);
}

const readHabit = {
  id: '1',
  name: 'Read',
  icon: 'BookOpen',
  frequency: ['Mon'],
  startDate: '2026-11-01T00:00:00.000Z',
  completed: false,
} as Habit;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/coach']}>
      <ChatConversationProvider>
        <CoachPage />
      </ChatConversationProvider>
    </MemoryRouter>,
  );
}

describe('CoachPage', () => {
  beforeEach(() => {
    mockAllHabits([readHabit]);
  });

  it('offers help picking a first habit to a user with no habits', () => {
    mockAllHabits([]);
    renderPage();

    const suggestions = screen.getByRole('list', {
      name: 'Suggested questions',
    });
    expect(
      within(suggestions).getByRole('button', {
        name: /Help me pick my first habit/,
      }),
    ).toBeInTheDocument();
    expect(
      within(suggestions).queryByRole('button', {
        name: /How do I build a new habit\?/,
      }),
    ).not.toBeInTheDocument();
  });

  it('keeps the usual questions for a user who has habits, or while habits load', () => {
    renderPage();
    expect(
      screen.getByRole('button', { name: /How do I build a new habit\?/ }),
    ).toBeInTheDocument();
  });

  it('does not treat habits still loading as no habits', () => {
    mockAllHabits([], true);
    renderPage();
    expect(
      screen.queryByRole('button', { name: /Help me pick my first habit/ }),
    ).not.toBeInTheDocument();
  });

  it('is titled Habit Coach', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Habit Coach' }),
    ).toBeInTheDocument();
    expect(document.title).toContain('Habit Coach');
  });

  it('shows its title and subtitle in the page header, as Habits and Progress do', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Habit Coach' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Advice grounded in Atomic Habits by James Clear'),
    ).toBeInTheDocument();
  });

  it('offers the message box and the suggested questions', () => {
    renderPage();

    expect(
      screen.getByRole('textbox', { name: 'Ask the habit coach' }),
    ).toBeInTheDocument();
    const suggestions = screen.getByRole('list', {
      name: 'Suggested questions',
    });
    expect(within(suggestions).getAllByRole('button')).toHaveLength(3);
  });

  it('explains how to send and how to start a new line', () => {
    renderPage();

    expect(
      screen.getByText('Enter to send · Shift + Enter for a new line'),
    ).toBeInTheDocument();
  });

  it('has no close button, being a page rather than a panel', () => {
    renderPage();

    expect(
      screen.queryByRole('button', { name: 'Close chat' }),
    ).not.toBeInTheDocument();
  });
});
