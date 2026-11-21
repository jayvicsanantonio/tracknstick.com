// Covers the month summary on the progress page: the average completion and the perfect days.
// Only the shown month's days count; days with nothing scheduled are not in the history at all.

import { describe, it, expect } from 'vitest';
import { summarizeMonth } from '../monthSummary';

const november = new Date(2026, 10, 17);

describe('summarizeMonth', () => {
  it('averages the completion of the days that had habits scheduled', () => {
    const summary = summarizeMonth(
      [
        { date: '2026-11-03', completionRate: 0 },
        { date: '2026-11-02', completionRate: 50 },
        { date: '2026-11-01', completionRate: 100 },
      ],
      november,
    );

    expect(summary.averageRate).toBe(50);
    expect(summary.scheduledDays).toBe(3);
  });

  it('counts the days with every habit done as perfect', () => {
    const summary = summarizeMonth(
      [
        { date: '2026-11-02', completionRate: 100 },
        { date: '2026-11-01', completionRate: 100 },
        { date: '2026-11-03', completionRate: 99 },
      ],
      november,
    );

    expect(summary.perfectDays).toBe(2);
  });

  it('rounds the average to a whole percent', () => {
    const summary = summarizeMonth(
      [
        { date: '2026-11-01', completionRate: 33 },
        { date: '2026-11-02', completionRate: 34 },
      ],
      november,
    );

    expect(summary.averageRate).toBe(34);
  });

  it("leaves out a neighbouring month's days", () => {
    const summary = summarizeMonth(
      [
        { date: '2026-10-31', completionRate: 0 },
        { date: '2026-11-01', completionRate: 100 },
        { date: '2026-12-01', completionRate: 0 },
      ],
      november,
    );

    expect(summary.averageRate).toBe(100);
    expect(summary.scheduledDays).toBe(1);
  });

  it('has no average for a month with nothing scheduled', () => {
    const summary = summarizeMonth([], november);

    expect(summary.averageRate).toBeNull();
    expect(summary.perfectDays).toBe(0);
    expect(summary.scheduledDays).toBe(0);
  });
});
