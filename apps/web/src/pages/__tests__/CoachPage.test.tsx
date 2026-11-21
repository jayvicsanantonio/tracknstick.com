// Covers the Coach page: the habit coach's chat as a page of its own, at /coach.
// Its title and subtitle follow the Habits and Progress pages; it offers the message box at once.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatConversationProvider } from '@features/chat/context/ChatConversationContext';
import CoachPage from '@/pages/CoachPage';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: vi.fn() }),
}));

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
  it('is titled Habit Coach', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Habit Coach' }),
    ).toBeInTheDocument();
    expect(document.title).toContain('Habit Coach');
  });

  it('shows its title and subtitle in a card header, as Habits and Progress do', () => {
    const { container } = renderPage();

    const header = container.querySelector<HTMLElement>(
      '[data-slot="card-header"]',
    );
    expect(header).not.toBeNull();
    const title = header?.querySelector('[data-slot="card-title"]');
    expect(title).toHaveTextContent('Habit Coach');
    expect(
      within(header!).getByText(
        'Advice grounded in Atomic Habits by James Clear',
      ),
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
