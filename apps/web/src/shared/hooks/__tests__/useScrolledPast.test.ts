// Covers useScrolledPast: whether the page has scrolled beyond a point, as the top bar needs to know.
// It follows the page as it scrolls and back.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useScrolledPast } from '@shared/hooks/useScrolledPast';

function scrollTo(y: number) {
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(y);
  window.dispatchEvent(new Event('scroll'));
}

describe('useScrolledPast', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is false at the top of the page', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);
    const { result } = renderHook(() => useScrolledPast(40));

    expect(result.current).toBe(false);
  });

  it('turns true once the page scrolls past the point, and false again above it', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);
    const { result } = renderHook(() => useScrolledPast(40));

    act(() => scrollTo(60));
    expect(result.current).toBe(true);

    act(() => scrollTo(10));
    expect(result.current).toBe(false);
  });

  it('knows where the page is when it starts, such as after a tab restores it', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300);
    const { result } = renderHook(() => useScrolledPast(40));

    expect(result.current).toBe(true);
  });
});
