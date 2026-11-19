// Covers the chat widget's open state, which its parent owns so the phone tab bar can open it too.
// The floating button asks to open the panel; the panel's close button asks to close it.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWidget } from '../ChatWidget';

describe('ChatWidget', () => {
  it('asks to open when its floating button is pressed', async () => {
    const onOpenChange = vi.fn();
    render(<ChatWidget isOpen={false} onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('shows the panel when open, and asks to close from its header', async () => {
    const onOpenChange = vi.fn();
    render(<ChatWidget isOpen onOpenChange={onOpenChange} />);

    // The panel loads on demand, so its close button appears once loaded.
    const closeButtons = await screen.findAllByRole('button', {
      name: 'Close chat',
    });
    await userEvent.click(closeButtons[0]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
