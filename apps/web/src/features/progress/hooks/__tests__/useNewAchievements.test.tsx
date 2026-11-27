// Covers which earned achievements read as new: those earned since the user last opened the Progress page.
// Seen ids are kept on this device per user, from a fresh list only; a first visit marks nothing new.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { StrictMode } from 'react';
import { renderHook } from '@testing-library/react';
import type { Achievement } from '../../types/Achievement';
import { useNewAchievements } from '../useNewAchievements';

const KEY = 'track-n-stick-seen-achievements:user_1';

const achievement = (id: string, isEarned: boolean): Achievement => ({
  id,
  key: `key_${id}`,
  name: `Achievement ${id}`,
  description: 'Description',
  type: 'completion',
  category: 'dedication',
  requirementType: 'count',
  requirementValue: 1,
  isEarned,
});

describe('useNewAchievements', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('marks nothing new on a first visit, and remembers what is earned', () => {
    const { result } = renderHook(() =>
      useNewAchievements(
        [achievement('1', true), achievement('2', false)],
        'user_1',
        true,
      ),
    );

    expect([...result.current]).toEqual([]);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['1']);
  });

  it('marks what was earned since the last visit, for the whole visit', () => {
    localStorage.setItem(KEY, JSON.stringify(['1']));

    const { result, rerender } = renderHook(() =>
      useNewAchievements(
        [achievement('1', true), achievement('2', true)],
        'user_1',
        true,
      ),
    );

    expect([...result.current]).toEqual(['2']);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['1', '2']);
    rerender();
    expect([...result.current]).toEqual(['2']);
  });

  it('keeps each user apart', () => {
    localStorage.setItem(KEY, JSON.stringify(['1']));

    const { result } = renderHook(() =>
      useNewAchievements([achievement('1', true)], 'user_2', true),
    );

    expect([...result.current]).toEqual([]);
    expect(localStorage.getItem('track-n-stick-seen-achievements:user_2')).toBe(
      '["1"]',
    );
  });

  it('waits for the achievements and the user before remembering anything', () => {
    renderHook(() => useNewAchievements([], 'user_1', true));
    renderHook(() => useNewAchievements([achievement('1', true)], null, true));

    expect(localStorage.length).toBe(0);
  });

  it('marks nothing when the device cannot store what was seen', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    const { result } = renderHook(() =>
      useNewAchievements([achievement('1', true)], 'user_1', true),
    );

    expect([...result.current]).toEqual([]);
  });

  it('waits for a fresh list, so an achievement earned elsewhere still reads as new', () => {
    localStorage.setItem(KEY, JSON.stringify(['1']));
    // The cached list from before the award, while it is fetched again.
    let list = [achievement('1', true), achievement('2', false)];
    let isFresh = false;

    const { result, rerender } = renderHook(() =>
      useNewAchievements(list, 'user_1', isFresh),
    );

    expect([...result.current]).toEqual([]);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['1']);

    list = [achievement('1', true), achievement('2', true)];
    isFresh = true;
    rerender();

    expect([...result.current]).toEqual(['2']);
  });

  it('keeps its marks when Strict Mode runs its effect twice', () => {
    localStorage.setItem(KEY, JSON.stringify(['1']));

    const { result } = renderHook(
      () =>
        useNewAchievements(
          [achievement('1', true), achievement('2', true)],
          'user_1',
          true,
        ),
      { wrapper: StrictMode },
    );

    expect([...result.current]).toEqual(['2']);
  });
});
