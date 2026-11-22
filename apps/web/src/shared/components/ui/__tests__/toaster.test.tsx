// Covers how the toaster draws an achievement: a banner across the top, with no close button.
// It leaves on its own, as an iOS banner does; other messages keep their close button.

import { describe, it, expect } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { Toaster } from '@shared/components/ui/toaster';
import { useToast } from '@shared/hooks/use-toast';

describe('Toaster', () => {
  it('shows an achievement as a banner, without a close button', () => {
    render(<Toaster />);
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        variant: 'achievement',
        title: 'Achievement earned',
        description: 'First Step: Tick a habit off',
      });
    });

    // The toast itself, not the live region Radix announces it through.
    const banner = screen.getByText('Achievement earned').closest('li');
    expect(banner).not.toBeNull();
    if (!banner) return;
    expect(banner).toHaveTextContent('First Step: Tick a habit off');
    expect(banner.querySelector('[toast-close]')).toBeNull();

    act(() => {
      result.current.dismiss();
    });
  });

  it('keeps the close button on other messages', () => {
    render(<Toaster />);
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        variant: 'destructive',
        description: 'Failed to add habit "Walk". Please try again.',
      });
    });

    expect(
      screen
        .getByText(/Failed to add habit/)
        .closest('li')
        ?.querySelector('[toast-close]'),
    ).not.toBeNull();

    act(() => {
      result.current.dismiss();
    });
  });
});
