// Covers when the app treats the last visit's user as signed in: offline, before Clerk can load.
// The user is the one the cached API responses belong to, which useClearApiCacheOnUserChange records.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { API_CACHE_OWNER_KEY } from '@shared/constants/apiCache';
import { useOfflineSession } from '../useOfflineSession';

const mockAuth = vi.hoisted(() => ({ isLoaded: false }));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: mockAuth.isLoaded }),
}));

function setOnline(online: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}

describe('useOfflineSession', () => {
  beforeEach(() => {
    mockAuth.isLoaded = false;
    localStorage.setItem(API_CACHE_OWNER_KEY, 'user_123');
    setOnline(false);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('is true offline, before Clerk loads, when a user was signed in last time', () => {
    const { result } = renderHook(() => useOfflineSession());

    expect(result.current).toBe(true);
  });

  it('is false online, where Clerk can load and decide', () => {
    setOnline(true);
    const { result } = renderHook(() => useOfflineSession());

    expect(result.current).toBe(false);
  });

  it('is false once Clerk has loaded', () => {
    mockAuth.isLoaded = true;
    const { result } = renderHook(() => useOfflineSession());

    expect(result.current).toBe(false);
  });

  it('is false when no one was signed in last time', () => {
    localStorage.setItem(API_CACHE_OWNER_KEY, '');
    const { result } = renderHook(() => useOfflineSession());

    expect(result.current).toBe(false);
  });

  it('is false when nothing records the last user', () => {
    localStorage.removeItem(API_CACHE_OWNER_KEY);
    const { result } = renderHook(() => useOfflineSession());

    expect(result.current).toBe(false);
  });

  it('follows the connection as it drops and returns', () => {
    setOnline(true);
    const { result } = renderHook(() => useOfflineSession());
    expect(result.current).toBe(false);

    act(() => setOnline(false));
    expect(result.current).toBe(true);

    act(() => setOnline(true));
    expect(result.current).toBe(false);
  });
});
