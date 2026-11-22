// Unit tests for the useClearApiCacheOnUserChange hook
// Covers when the service worker's cached API responses are discarded

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SWRConfig, type Cache } from 'swr';

import { useClearApiCacheOnUserChange } from '@shared/hooks/useClearApiCacheOnUserChange';
import { API_CACHE_NAME } from '@shared/constants/apiCache';
import { SWR_CACHE_STORAGE_KEY } from '@shared/services/swrCache';

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

describe('useClearApiCacheOnUserChange and the saved data cache', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('caches', { delete: vi.fn().mockResolvedValue(true) });
    mockAuth.isLoaded = true;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function renderWithCache(cache: Map<string, unknown>) {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ provider: () => cache as Cache }}>
        {children}
      </SWRConfig>
    );
    return renderHook(() => useClearApiCacheOnUserChange(), { wrapper });
  }

  it("forgets the last user's saved data when someone else signs in", () => {
    mockAuth.userId = 'user_a';
    renderWithCache(new Map()).unmount();
    localStorage.setItem(SWR_CACHE_STORAGE_KEY, '{"owner":"user_a"}');
    const cache = new Map([['/api/v1/habits', { data: ['Read'] }]]);

    mockAuth.userId = 'user_b';
    renderWithCache(cache);

    expect(cache.size).toBe(0);
    expect(localStorage.getItem(SWR_CACHE_STORAGE_KEY)).toBeNull();
  });

  it('keeps the saved data when the same user comes back', () => {
    mockAuth.userId = 'user_a';
    renderWithCache(new Map()).unmount();
    const cache = new Map([['/api/v1/habits', { data: ['Read'] }]]);

    renderWithCache(cache);

    expect(cache.size).toBe(1);
  });
});
