// Unit tests for the useClearApiCacheOnUserChange hook
// Covers when the service worker's cached API responses are discarded

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useClearApiCacheOnUserChange } from '@shared/hooks/useClearApiCacheOnUserChange';
import { API_CACHE_NAME } from '@shared/constants/apiCache';

const mockAuth: { isLoaded: boolean; userId: string | null } = {
  isLoaded: true,
  userId: null,
};

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: mockAuth.isLoaded, userId: mockAuth.userId }),
}));

describe('useClearApiCacheOnUserChange', () => {
  const deleteCache = vi.fn().mockResolvedValue(true);

  beforeEach(() => {
    localStorage.clear();
    deleteCache.mockClear();
    // jsdom has no CacheStorage
    vi.stubGlobal('caches', { delete: deleteCache });
    mockAuth.isLoaded = true;
    mockAuth.userId = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('clears the cache when a different user signs in on the same browser', () => {
    mockAuth.userId = 'user_a';
    renderHook(() => useClearApiCacheOnUserChange()).unmount();
    deleteCache.mockClear();

    mockAuth.userId = 'user_b';
    renderHook(() => useClearApiCacheOnUserChange());

    expect(deleteCache).toHaveBeenCalledExactlyOnceWith(API_CACHE_NAME);
  });

  it('keeps the cache when the same user comes back', () => {
    mockAuth.userId = 'user_a';
    renderHook(() => useClearApiCacheOnUserChange()).unmount();
    deleteCache.mockClear();

    renderHook(() => useClearApiCacheOnUserChange());

    expect(deleteCache).not.toHaveBeenCalled();
  });

  it('clears the cache when the user signs out', () => {
    mockAuth.userId = 'user_a';
    const { rerender } = renderHook(() => useClearApiCacheOnUserChange());
    deleteCache.mockClear();

    mockAuth.userId = null;
    rerender();

    expect(deleteCache).toHaveBeenCalledExactlyOnceWith(API_CACHE_NAME);
  });

  it('waits for Clerk to load before deciding who is signed in', () => {
    mockAuth.userId = 'user_a';
    renderHook(() => useClearApiCacheOnUserChange()).unmount();
    deleteCache.mockClear();

    // While loading, Clerk reports no user; that is not a sign-out.
    mockAuth.isLoaded = false;
    mockAuth.userId = null;
    renderHook(() => useClearApiCacheOnUserChange());

    expect(deleteCache).not.toHaveBeenCalled();
  });
});
