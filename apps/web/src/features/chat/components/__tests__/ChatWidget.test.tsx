// Covers the chat widget's open state, which its parent owns so the phone tab bar can open it too.
// The floating button asks to open the panel; both the panel's and the floating close buttons ask to close it.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWidget } from '../ChatWidget';

// The real panel asks Clerk for a token only when a message is sent.
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: vi.fn() }),
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
});
