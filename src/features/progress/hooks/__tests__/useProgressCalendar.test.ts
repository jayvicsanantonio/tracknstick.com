// Calendar cells must match on the whole date, not just the day-of-month
// The API returns a descending list that can include a neighbouring month's
// day when the requested range is built from local day boundaries.

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useProgressCalendar } from '../useProgressCalendar';

const JUNE = new Date(2025, 5, 15); // 15 June 2025

describe('useProgressCalendar', () => {
  it('maps a day to its own date, not another month with the same day number', () => {
    // Descending, as the API returns it, with a stray 1 July row leaking in
    // from the range's local-midnight end boundary.
    const insightData = [
      { date: '2025-07-01', completionRate: 99 },
      { date: '2025-06-02', completionRate: 50 },
      { date: '2025-06-01', completionRate: 20 },
    ];

    const { result } = renderHook(() =>
      useProgressCalendar(insightData, JUNE, vi.fn()),
    );

    const dayOne = result.current.calendarDays.find((d) => d.dayOfMonth === 1);
    expect(dayOne?.dayData?.completionRate).toBe(20);
  });

  it('never surfaces a row from outside the displayed month', () => {
    const insightData = [
      { date: '2025-07-01', completionRate: 99 },
      { date: '2025-05-03', completionRate: 88 },
    ];

    const { result } = renderHook(() =>
      useProgressCalendar(insightData, JUNE, vi.fn()),
    );

    for (const day of result.current.calendarDays) {
      if (day.dayData) {
        expect(day.dayData.date.startsWith('2025-06')).toBe(true);
      }
    }
  });

  it('matches a mid-month day to its own rate', () => {
    const insightData = [{ date: '2025-06-10', completionRate: 75 }];

    const { result } = renderHook(() =>
      useProgressCalendar(insightData, JUNE, vi.fn()),
    );

    expect(
      result.current.calendarDays.find((d) => d.dayOfMonth === 10)?.dayData
        ?.completionRate,
    ).toBe(75);
  });

  it('reports the correct number of days and first weekday', () => {
    const { result } = renderHook(() => useProgressCalendar([], JUNE, vi.fn()));

    expect(result.current.calendarDays).toHaveLength(30);
    expect(result.current.firstDayOfMonth).toBe(0); // 1 June 2025 is a Sunday
  });
});
