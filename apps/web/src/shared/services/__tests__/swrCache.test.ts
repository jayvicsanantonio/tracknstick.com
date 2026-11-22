// Covers the saved data cache: the app opens to what it last showed, as a native app does.
// Saved when the app is put away, and only ever shown to the user it belongs to.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearPersistentCache,
  createPersistentCache,
  SWR_CACHE_STORAGE_KEY,
} from '@shared/services/swrCache';
import { API_CACHE_OWNER_KEY } from '@shared/constants/apiCache';

const HABITS_KEY = '/api/v1/habits?date=2026-11-21';
const habits = [{ id: '1', name: 'Read', completed: true }];

/** Puts the app away, as switching to another app or locking the phone does. */
function hideApp() {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'hidden',
  });
  document.dispatchEvent(new Event('visibilitychange'));
  Reflect.deleteProperty(document, 'visibilityState');
}

function saved(): unknown {
  return JSON.parse(localStorage.getItem(SWR_CACHE_STORAGE_KEY) ?? 'null');
}

describe('the saved data cache', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(API_CACHE_OWNER_KEY, 'user_a');
  });

  it('opens to the data saved when the app was last put away', () => {
    const before = createPersistentCache();
    before.set(HABITS_KEY, { data: habits });
    hideApp();

    const after = createPersistentCache();

    expect(after.get(HABITS_KEY)).toEqual({ data: habits });
  });

  it('saves when the page is closed, too', () => {
    const cache = createPersistentCache();
    cache.set(HABITS_KEY, { data: habits });

    window.dispatchEvent(new Event('pagehide'));

    expect(createPersistentCache().get(HABITS_KEY)).toEqual({ data: habits });
  });

  it('keeps only the data, not errors or loading state', () => {
    const cache = createPersistentCache();
    cache.set(HABITS_KEY, {
      data: habits,
      isValidating: true,
      isLoading: false,
    });
    cache.set('/api/v1/progress', { error: new Error('offline') });
    hideApp();

    const after = createPersistentCache();

    expect(after.get(HABITS_KEY)).toEqual({ data: habits });
    expect(after.has('/api/v1/progress')).toBe(false);
  });

  it("never opens to another user's data", () => {
    const cache = createPersistentCache();
    cache.set(HABITS_KEY, { data: habits });
    hideApp();

    localStorage.setItem(API_CACHE_OWNER_KEY, 'user_b');

    expect(createPersistentCache().size).toBe(0);
  });

  it('saves nothing while no one is signed in', () => {
    localStorage.setItem(API_CACHE_OWNER_KEY, '');
    const cache = createPersistentCache();
    cache.set(HABITS_KEY, { data: habits });

    hideApp();

    expect(saved()).toBeNull();
  });

  it('starts empty when the saved copy cannot be read', () => {
    localStorage.setItem(SWR_CACHE_STORAGE_KEY, '{not json');

    expect(createPersistentCache().size).toBe(0);
  });

  it('forgets everything when cleared, in memory and on disk', () => {
    const cache = createPersistentCache();
    cache.set(HABITS_KEY, { data: habits });
    hideApp();

    clearPersistentCache(cache);

    expect(cache.size).toBe(0);
    expect(saved()).toBeNull();
  });
});
