// Checks the iOS "Add to Home Screen" sheet: it appears in iPhone Safari and shows the
// app icon rounded in the proportion iOS gives home-screen icons.

import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PWAInstallPrompt } from '../PWAInstallPrompt';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

describe('PWAInstallPrompt on iPhone Safari', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(IPHONE_SAFARI);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the app icon with the corner radius of an iOS home-screen icon', () => {
    render(<PWAInstallPrompt />);
    act(() => {
      vi.advanceTimersByTime(2200);
    });

    const sheet = screen.getByRole('region', { name: 'Add to Home Screen' });
    const icon = within(sheet).getByRole('presentation');
    expect(icon).toHaveAttribute('src', '/icons/apple-touch-icon.png');
    expect(icon).toHaveClass('rounded-[22.37%]');
  });
});
