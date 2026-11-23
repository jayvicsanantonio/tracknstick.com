// Covers when the app treats the last visit's user as signed in: offline, or once Clerk failed to load.
// The user is the one the cached API responses belong to, which useClearApiCacheOnUserChange records.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { API_CACHE_OWNER_KEY } from '@shared/constants/apiCache';
import { useOfflineSession } from '../useOfflineSession';

const mockAuth = vi.hoisted(() => ({
  isLoaded: false,
  status: 'loading' as 'loading' | 'error' | 'ready' | 'degraded',
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: mockAuth.isLoaded }),
  useClerk: () => ({ status: mockAuth.status }),
}));

function setOnline(online: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}

describe('useOfflineSession', () => {
  beforeEach(() => {
    mockAuth.isLoaded = false;
    mockAuth.status = 'loading';
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

  describe('online, where the connection may still not get through', () => {
    beforeEach(() => setOnline(true));

    it('is false while Clerk is still trying to load', () => {
      const { result } = renderHook(() => useOfflineSession());

      expect(result.current).toBe(false);
    });

    it('is true once Clerk has failed to load, when a user was signed in last time', () => {
      mockAuth.status = 'error';
      const { result } = renderHook(() => useOfflineSession());

      expect(result.current).toBe(true);
    });

    it('is false after Clerk failed to load when no one was signed in last time', () => {
      mockAuth.status = 'error';
      localStorage.setItem(API_CACHE_OWNER_KEY, '');
      const { result } = renderHook(() => useOfflineSession());

      expect(result.current).toBe(false);
    });
  });
});
