// Covers the chat widget's open state, which its parent owns so the phone tab bar can open it too,
// and the conversation it keeps while the panel is closed, cleared 10 minutes after the last message.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWidget } from '../ChatWidget';

// The real panel asks Clerk for a token only when a message is sent.
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: vi.fn() }),
}));

// Closing removes the panel at once, as it does on screen once the exit
// animation ends; under fake timers that animation cannot be relied on to end.
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ChatWidget', () => {
  // jsdom has no scrollIntoView; the panel scrolls to its last message.
  const original = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'scrollIntoView',
  );

  beforeEach(() => {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    if (original) {
      Object.defineProperty(Element.prototype, 'scrollIntoView', original);
    } else {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
    }
  });

  it('asks to open when its floating button is pressed', async () => {
    const onOpenChange = vi.fn();
    render(<ChatWidget isOpen={false} onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('shows the real panel when open, and its own close button asks to close', async () => {
    const onOpenChange = vi.fn();
    render(<ChatWidget isOpen onOpenChange={onOpenChange} />);

    // The panel loads on demand.
    const heading = await screen.findByRole('heading', { name: 'Habit Coach' });
    const panelHeader = heading.closest('[data-chat-header]');
    expect(panelHeader).not.toBeNull();

    await userEvent.click(
      within(panelHeader as HTMLElement).getByRole('button', {
        name: 'Close chat',
      }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('offers a single close button while open', async () => {
    render(<ChatWidget isOpen onOpenChange={vi.fn()} />);

    await screen.findByRole('heading', { name: 'Habit Coach' });

    expect(screen.getAllByRole('button', { name: 'Close chat' })).toHaveLength(
      1,
    );
  });

  describe('the conversation', () => {
    const TEN_MINUTES = 10 * 60 * 1000;

    /** Opens the panel, asks one question and waits for the full reply. */
    async function chatOnce(rerender: (ui: React.ReactElement) => void) {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(new Response('Start small.'))),
      );
      rerender(<ChatWidget isOpen onOpenChange={vi.fn()} />);
      const user = userEvent.setup({
        advanceTimers: (ms) => vi.advanceTimersByTime(ms),
      });
      await user.type(
        await screen.findByRole('textbox', { name: 'Ask the habit coach' }),
        'Hi{Enter}',
      );
      expect(await screen.findByText('Start small.')).toBeInTheDocument();
    }

    /** Closes the panel and waits for it to leave, as it does on screen. */
    async function closePanel(rerender: (ui: React.ReactElement) => void) {
      rerender(<ChatWidget isOpen={false} onOpenChange={vi.fn()} />);
      await waitFor(() =>
        expect(
          screen.queryByRole('heading', { name: 'Habit Coach' }),
        ).not.toBeInTheDocument(),
      );
    }

    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    it('keeps the coach replying while the panel is closed', async () => {
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
      const { rerender } = render(<ChatWidget isOpen onOpenChange={vi.fn()} />);
      const user = userEvent.setup({
        advanceTimers: (ms) => vi.advanceTimersByTime(ms),
      });
      await user.type(
        await screen.findByRole('textbox', { name: 'Ask the habit coach' }),
        'Hi{Enter}',
      );

      await closePanel(rerender);
      rerender(<ChatWidget isOpen onOpenChange={vi.fn()} />);

      // Reopened mid-reply: still shown as replying, and sending waits.
      expect(
        await screen.findByRole('status', { name: 'The coach is replying' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('log', { name: 'Conversation' })).toHaveAttribute(
        'aria-busy',
        'true',
      );

      await closePanel(rerender);
      controller.enqueue(new TextEncoder().encode('Start small.'));
      controller.close();
      rerender(<ChatWidget isOpen onOpenChange={vi.fn()} />);

      expect(await screen.findByText('Start small.')).toBeInTheDocument();
      await waitFor(() =>
        expect(
          screen.getByRole('log', { name: 'Conversation' }),
        ).toHaveAttribute('aria-busy', 'false'),
      );
    });

    it('shows a reply that failed while the panel was closed', async () => {
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
      const { rerender } = render(<ChatWidget isOpen onOpenChange={vi.fn()} />);
      const user = userEvent.setup({
        advanceTimers: (ms) => vi.advanceTimersByTime(ms),
      });
      await user.type(
        await screen.findByRole('textbox', { name: 'Ask the habit coach' }),
        'Hi{Enter}',
      );

      await closePanel(rerender);
      await act(async () => {
        respond(new Response(body));
        await vi.advanceTimersByTimeAsync(0);
      });
      rerender(<ChatWidget isOpen onOpenChange={vi.fn()} />);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        "The coach didn't reply. Try again.",
      );
    });

    it('is still there after the panel is closed and opened again', async () => {
      const { rerender } = render(
        <ChatWidget isOpen={false} onOpenChange={vi.fn()} />,
      );
      await chatOnce(rerender);

      await closePanel(rerender);
      await act(() => vi.advanceTimersByTimeAsync(TEN_MINUTES - 1000));
      rerender(<ChatWidget isOpen onOpenChange={vi.fn()} />);

      expect(await screen.findByText('Start small.')).toBeInTheDocument();
      expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    it('clears 10 minutes after the last message while the panel is closed', async () => {
      const { rerender } = render(
        <ChatWidget isOpen={false} onOpenChange={vi.fn()} />,
      );
      await chatOnce(rerender);

      await closePanel(rerender);
      await act(() => vi.advanceTimersByTimeAsync(TEN_MINUTES));
      rerender(<ChatWidget isOpen onOpenChange={vi.fn()} />);

      expect(
        await screen.findByRole('heading', { name: 'How can I help?' }),
      ).toBeInTheDocument();
      expect(screen.queryByText('Start small.')).not.toBeInTheDocument();
    });

    it('is never cleared while the panel is open', async () => {
      const { rerender } = render(
        <ChatWidget isOpen={false} onOpenChange={vi.fn()} />,
      );
      await chatOnce(rerender);

      await act(() => vi.advanceTimersByTimeAsync(TEN_MINUTES * 2));

      expect(screen.getByText('Start small.')).toBeInTheDocument();
    });

    it('clears at once on closing when the last message is already 10 minutes old', async () => {
      const { rerender } = render(
        <ChatWidget isOpen={false} onOpenChange={vi.fn()} />,
      );
      await chatOnce(rerender);
      await act(() => vi.advanceTimersByTimeAsync(TEN_MINUTES));

      await closePanel(rerender);
      await act(() => vi.advanceTimersByTimeAsync(0));
      rerender(<ChatWidget isOpen onOpenChange={vi.fn()} />);

      expect(
        await screen.findByRole('heading', { name: 'How can I help?' }),
      ).toBeInTheDocument();
    });
  });
});
