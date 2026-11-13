// The date context must fail outside its provider rather than hand back a fake

import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import DateProvider from '../DateProvider';
import { useDate } from '../useDate';

describe('useDate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when used outside DateProvider', () => {
    // The old default returned a working-looking object with a hardcoded
    // America/Los_Angeles timezone, so this case failed silently.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useDate())).toThrow(
      /must be used within a DateProvider/,
    );
  });

  it('resolves the timezone from the environment, not a hardcoded default', () => {
    const { result } = renderHook(() => useDate(), { wrapper: DateProvider });

    expect(result.current.timeZone).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  });

  it('steps the selected date backwards and forwards by a day', () => {
    const { result } = renderHook(() => useDate(), { wrapper: DateProvider });
    const start = result.current.date.getDate();

    act(() => result.current.handleNextDate());
    expect(result.current.date.getDate()).not.toBe(start);

    act(() => result.current.handlePreviousDate());
    expect(result.current.date.getDate()).toBe(start);
  });
});
