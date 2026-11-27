// Covers which earned achievements read as new: those earned since the user last opened the Progress page.
// What has been seen is kept on this device per user; a first visit marks nothing new.

import { describe, it, expect, afterEach, vi } from 'vitest';
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
      useNewAchievements([achievement('1', true)], 'user_2'),
    );

    expect([...result.current]).toEqual([]);
    expect(localStorage.getItem('track-n-stick-seen-achievements:user_2')).toBe(
      '["1"]',
    );
  });

  it('waits for the achievements and the user before remembering anything', () => {
    renderHook(() => useNewAchievements([], 'user_1'));
    renderHook(() => useNewAchievements([achievement('1', true)], null));

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
      useNewAchievements([achievement('1', true)], 'user_1'),
    );

    expect([...result.current]).toEqual([]);
  });
});
