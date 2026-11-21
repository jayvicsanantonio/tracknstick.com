// Covers how the coach's chat feels to use: suggestions, the replying state and the message box.
// fetch is stubbed with a streamed Response so each test controls when and what the coach replies.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatBox } from '../ChatBox';
import { useChatConversation } from '@features/chat/hooks/useChatConversation';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: () => Promise.resolve('token') }),
}));

/** A streamed reply whose chunks arrive only when the test sends them. */
function controlledReply() {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  const encoder = new TextEncoder();
  return {
    response: new Response(body, { status: 200 }),
    send: (text: string) => controller.enqueue(encoder.encode(text)),
    end: () => controller.close(),
  };
}

const fetchMock = vi.fn<typeof fetch>();

/** The chat with the conversation ChatConversationProvider keeps for it. */
function renderChatBox() {
  function Harness() {
    const conversation = useChatConversation();
    return <ChatBox conversation={conversation} />;
  }
  return render(<Harness />);
}

describe('ChatBox', () => {
  // jsdom has no scrollIntoView; the panel scrolls to its last message.
  const original = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'scrollIntoView',
  );

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (original) {
      Object.defineProperty(Element.prototype, 'scrollIntoView', original);
    } else {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
    }
  });

  it('sends a suggested question as soon as it is picked', async () => {
    const reply = controlledReply();
    fetchMock.mockResolvedValue(reply.response);
    renderChatBox();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'How can I stay consistent with my habits?',
      }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string) as {
      messages: { role: string; content: string }[];
    };
    expect(body.messages).toEqual([
      { role: 'user', content: 'How can I stay consistent with my habits?' },
    ]);
    // The picked suggestion is gone; the next message starts in the box.
    expect(
      screen.getByRole('textbox', { name: 'Ask the habit coach' }),
    ).toHaveFocus();
    reply.end();
    await screen.findByRole('alert');
  });

  it('shows that the coach is replying until its first words arrive', async () => {
    const reply = controlledReply();
    let respond!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        respond = resolve;
      }),
    );
    renderChatBox();

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Ask the habit coach' }),
      'Hi{Enter}',
    );

    expect(
      screen.getByRole('status', { name: 'The coach is replying' }),
    ).toBeInTheDocument();

    respond(reply.response);
    reply.send('Start small.');

    expect(await screen.findByText('Start small.')).toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: 'The coach is replying' }),
    ).not.toBeInTheDocument();

    reply.end();
    await waitFor(() =>
      expect(screen.getByRole('log', { name: 'Conversation' })).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );
  });

  it('keeps the message box usable while the coach replies', async () => {
    const reply = controlledReply();
    fetchMock.mockResolvedValue(reply.response);
    renderChatBox();
    const textbox = screen.getByRole('textbox', {
      name: 'Ask the habit coach',
    });

    await userEvent.type(textbox, 'Hi{Enter}');

    expect(textbox).toBeEnabled();
    expect(textbox).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    expect(screen.getByRole('log', { name: 'Conversation' })).toHaveAttribute(
      'aria-busy',
      'true',
    );

    reply.send('Start small.');
    reply.end();
    await waitFor(() =>
      expect(screen.getByRole('log', { name: 'Conversation' })).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );
  });

  it('says the coach did not reply when a reply ends empty', async () => {
    const reply = controlledReply();
    fetchMock.mockResolvedValue(reply.response);
    renderChatBox();

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Ask the habit coach' }),
      'Hi{Enter}',
    );
    reply.end();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The coach didn't reply. Try again.",
    );
    expect(
      screen.queryByRole('status', { name: 'The coach is replying' }),
    ).not.toBeInTheDocument();
  });

  it('shows an error without an "Error:" prefix', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: 'Too many requests' } }),
        { status: 429 },
      ),
    );
    renderChatBox();

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Ask the habit coach' }),
      'Hi{Enter}',
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Too many requests');
    expect(alert).not.toHaveTextContent('Error:');
  });

  it('focuses the message box when it opens', () => {
    renderChatBox();

    expect(
      screen.getByRole('textbox', { name: 'Ask the habit coach' }),
    ).toHaveFocus();
  });

  it('leaves the keyboard down when it opens on a touch screen', () => {
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query === '(pointer: coarse)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    try {
      renderChatBox();

      expect(
        screen.getByRole('textbox', { name: 'Ask the habit coach' }),
      ).not.toHaveFocus();
    } finally {
      vi.mocked(window.matchMedia).mockImplementation(
        (query: string) =>
          ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }) as unknown as MediaQueryList,
      );
    }
  });

  it('grows the message box with what is typed', async () => {
    const scrollHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollHeight',
    );
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => 88,
    });
    try {
      renderChatBox();
      const textbox = screen.getByRole('textbox', {
        name: 'Ask the habit coach',
      });

      await userEvent.type(textbox, 'A longer question');

      await waitFor(() => expect(textbox.style.height).toBe('88px'));
    } finally {
      if (scrollHeight) {
        Object.defineProperty(
          HTMLElement.prototype,
          'scrollHeight',
          scrollHeight,
        );
      }
    }
  });
});
