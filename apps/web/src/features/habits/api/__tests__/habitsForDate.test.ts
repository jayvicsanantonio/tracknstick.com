// Covers the request for one day's habits: it names the day, not the moment it was made.
// The URL then stays the same all day, so the service worker's cached response answers it offline.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { axiosInstance } from '@shared/services/api/axiosInstance';
import { fetchHabits, habitsForDateKey } from '../index';

const TIME_ZONE = 'America/Los_Angeles';
// Two moments of 23 November 2026 in Los Angeles, and the day's midnight there.
const MORNING = new Date('2026-11-23T16:43:09.485Z');
const EVENING = new Date('2026-11-24T06:10:00.000Z');
const MIDNIGHT = '2026-11-23T08:00:00.000Z';

describe("one day's habits", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("asks the API for the start of the day in the user's time zone", async () => {
    const get = vi.spyOn(axiosInstance, 'get').mockResolvedValue({ data: [] });

    await fetchHabits(MORNING, TIME_ZONE);

    expect(get).toHaveBeenCalledWith('/api/v1/habits', {
      params: { date: MIDNIGHT, timeZone: TIME_ZONE },
    });
  });

  it('sends the same request at any time of the same day', async () => {
    const get = vi.spyOn(axiosInstance, 'get').mockResolvedValue({ data: [] });

    await fetchHabits(MORNING, TIME_ZONE);
    await fetchHabits(EVENING, TIME_ZONE);

    expect(get.mock.calls[0]).toEqual(get.mock.calls[1]);
  });

  it('keys the SWR cache by the day', () => {
    expect(habitsForDateKey(MORNING, TIME_ZONE)).toBe(
      habitsForDateKey(EVENING, TIME_ZONE),
    );
    expect(habitsForDateKey(MORNING, TIME_ZONE)).toBe(
      `/api/v1/habits?date=${MIDNIGHT}&timeZone=${TIME_ZONE}`,
    );
  });
});
