// Covers the habit coach conversation kept across pages: it outlives a visit to another page,
// keeps a reply streaming meanwhile, and clears 10 minutes after the last message while away.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { ChatConversationProvider } from '@features/chat/context/ChatConversationContext';
import CoachPage from '@/pages/CoachPage';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: () => Promise.resolve('token') }),
}));

const TEN_MINUTES = 10 * 60 * 1000;

/** The provider as RootLayout holds it, around the Tracker and Coach pages. */
function renderApp() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <ChatConversationProvider>
            <Outlet />
          </ChatConversationProvider>
        ),
        children: [
          { index: true, element: <h1>Tracker</h1> },
          { path: 'coach', element: <CoachPage /> },
        ],
      },
    ],
    { initialEntries: ['/coach'] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

type AppRouter = ReturnType<typeof renderApp>;

async function goTo(router: AppRouter, path: string) {
  await act(() => router.navigate(path));
}

async function ask(question: string) {
  const user = userEvent.setup({
    advanceTimers: (ms) => vi.advanceTimersByTime(ms),
  });
  await user.type(
    await screen.findByRole('textbox', { name: 'Ask the habit coach' }),
    `${question}{Enter}`,
  );
}

/** Asks one question on the Coach page and waits for the full reply. */
async function chatOnce() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response('Start small.'))),
  );
  await ask('Hi');
  expect(await screen.findByText('Start small.')).toBeInTheDocument();
}

describe('ChatConversationProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps the coach replying while another page is open', async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        controller = c;
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(body))),
    );
    const router = renderApp();
    await ask('Hi');

    await goTo(router, '/');
    await goTo(router, '/coach');

    // Back mid-reply: still shown as replying, and sending waits.
    expect(
      await screen.findByRole('status', { name: 'The coach is replying' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('log', { name: 'Conversation' })).toHaveAttribute(
      'aria-busy',
      'true',
    );

    await goTo(router, '/');
    controller.enqueue(new TextEncoder().encode('Start small.'));
    controller.close();
    await goTo(router, '/coach');

    expect(await screen.findByText('Start small.')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('log', { name: 'Conversation' })).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );
  });

  it('shows a reply that failed while another page was open', async () => {
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.close();
      },
    });
    let respond!: (response: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            respond = resolve;
          }),
      ),
    );
    const router = renderApp();
    await ask('Hi');

    await goTo(router, '/');
    await act(async () => {
      respond(new Response(body));
      await vi.advanceTimersByTimeAsync(0);
    });
    await goTo(router, '/coach');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The coach didn't reply. Try again.",
    );
  });

  it('is still there after a visit to another page', async () => {
    const router = renderApp();
    await chatOnce();

    await goTo(router, '/');
    await act(() => vi.advanceTimersByTimeAsync(TEN_MINUTES - 1000));
    await goTo(router, '/coach');

    expect(await screen.findByText('Start small.')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('clears 10 minutes after the last message while another page is open', async () => {
    const router = renderApp();
    await chatOnce();

    await goTo(router, '/');
    await act(() => vi.advanceTimersByTimeAsync(TEN_MINUTES));
    await goTo(router, '/coach');

    expect(
      await screen.findByRole('heading', { name: 'How can I help?' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Start small.')).not.toBeInTheDocument();
  });

  it('is never cleared while the Coach page is open', async () => {
    renderApp();
    await chatOnce();

    await act(() => vi.advanceTimersByTimeAsync(TEN_MINUTES * 2));

    expect(screen.getByText('Start small.')).toBeInTheDocument();
  });

  it('clears at once on leaving when the last message is already 10 minutes old', async () => {
    const router = renderApp();
    await chatOnce();
    await act(() => vi.advanceTimersByTimeAsync(TEN_MINUTES));

    await goTo(router, '/');
    await act(() => vi.advanceTimersByTimeAsync(0));
    await goTo(router, '/coach');

    expect(
      await screen.findByRole('heading', { name: 'How can I help?' }),
    ).toBeInTheDocument();
  });
});
